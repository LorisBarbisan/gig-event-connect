import { storage } from './storage';

interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  postedDate: string;
  source: 'reed' | 'adzuna';
  employmentType?: string;
}

interface ReedJobResponse {
  jobId: number;
  employerId: number;
  employerName: string;
  employerProfileId?: number;
  employerProfileName?: string;
  jobTitle: string;
  locationName: string;
  minimumSalary?: number;
  maximumSalary?: number;
  currency: string;
  expirationDate: string;
  date: string;
  jobDescription: string;
  jobUrl: string;
  employmentType?: string;
}

interface AdzunaJobResponse {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  description: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  redirect_url: string;
  contract_type?: string;
}

export class JobAggregator {
  private reedApiKey: string | undefined;
  private adzunaApiKey: string | undefined;
  private adzunaAppId: string | undefined;

  constructor() {
    this.reedApiKey = process.env.REED_API_KEY;
    this.adzunaApiKey = process.env.ADZUNA_API_KEY;
    this.adzunaAppId = process.env.ADZUNA_APP_ID;
  }

  /**
   * Fetch jobs from Reed UK API
   * Keywords: audio, video, lighting, events, AV, production
   */
  async fetchReedJobs(keywords = 'events audio video lighting AV production', location = 'UK'): Promise<ExternalJob[]> {
    if (!this.reedApiKey) {
      console.log('Reed API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}&locationName=${encodeURIComponent(location)}&resultsToTake=20`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.reedApiKey + ':').toString('base64')}`,
            'User-Agent': 'EventCrew/1.0'
          }
        }
      );

      if (!response.ok) {
        console.error('Reed API error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      const jobs = data.results || [];

      return jobs.map((job: ReedJobResponse): ExternalJob => ({
        id: `reed_${job.jobId}`,
        title: job.jobTitle,
        company: job.employerName,
        location: job.locationName,
        description: job.jobDescription,
        salary: this.formatReedSalary(job.minimumSalary, job.maximumSalary, job.currency),
        jobUrl: job.jobUrl,
        postedDate: job.date,
        source: 'reed',
        employmentType: job.employmentType
      }));
    } catch (error) {
      console.error('Error fetching Reed jobs:', error);
      return [];
    }
  }

  /**
   * Fetch jobs from Adzuna API
   */
  async fetchAdzunaJobs(keywords = 'events audio video lighting AV production', country = 'gb'): Promise<ExternalJob[]> {
    if (!this.adzunaApiKey || !this.adzunaAppId) {
      console.log('Adzuna API credentials not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${this.adzunaAppId}&app_key=${this.adzunaApiKey}&what=${encodeURIComponent(keywords)}&results_per_page=20&content-type=application/json`
      );

      if (!response.ok) {
        console.error('Adzuna API error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      const jobs = data.results || [];

      return jobs.map((job: AdzunaJobResponse): ExternalJob => ({
        id: `adzuna_${job.id}`,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        description: job.description,
        salary: this.formatAdzunaSalary(job.salary_min, job.salary_max),
        jobUrl: job.redirect_url,
        postedDate: job.created,
        source: 'adzuna',
        employmentType: job.contract_type
      }));
    } catch (error) {
      console.error('Error fetching Adzuna jobs:', error);
      return [];
    }
  }

  /**
   * Fetch jobs from all configured sources
   */
  async fetchAllExternalJobs(): Promise<ExternalJob[]> {
    const [reedJobs, adzunaJobs] = await Promise.all([
      this.fetchReedJobs(),
      this.fetchAdzunaJobs()
    ]);

    // Combine and deduplicate jobs
    const allJobs = [...reedJobs, ...adzunaJobs];
    const uniqueJobs = this.deduplicateJobs(allJobs);

    return uniqueJobs.slice(0, 50); // Limit to 50 jobs
  }

  /**
   * Store external jobs in the database with external flag
   */
  async syncExternalJobs(): Promise<void> {
    try {
      const externalJobs = await this.fetchAllExternalJobs();
      
      for (const job of externalJobs) {
        // Check if job already exists
        const existingJob = await storage.getJobByExternalId(job.id);
        
        if (!existingJob) {
          // Convert external job format to internal job format
          const jobData = {
            recruiter_id: null, // Null for external jobs
            title: job.title,
            company: job.company,
            location: job.location,
            type: 'external' as const,
            rate: job.salary || 'Not specified',
            description: job.description,
            status: 'active' as const,
            external_id: job.id,
            external_source: job.source,
            external_url: job.jobUrl,
            posted_date: job.postedDate
          };

          await storage.createExternalJob(jobData);
        }
      }

      console.log(`Synced ${externalJobs.length} external jobs`);
    } catch (error) {
      console.error('Error syncing external jobs:', error);
    }
  }

  private formatReedSalary(min?: number, max?: number, currency?: string): string {
    if (!min && !max) return 'Salary not specified';
    
    const symbol = currency === 'GBP' ? '£' : '¤';
    
    if (min && max && min !== max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    } else if (min) {
      return `${symbol}${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${symbol}${max.toLocaleString()}`;
    }
    
    return 'Salary not specified';
  }

  private formatAdzunaSalary(min?: number, max?: number): string {
    if (!min && !max) return 'Salary not specified';
    
    if (min && max && min !== max) {
      return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    } else if (min) {
      return `£${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to £${max.toLocaleString()}`;
    }
    
    return 'Salary not specified';
  }

  private deduplicateJobs(jobs: ExternalJob[]): ExternalJob[] {
    const seen = new Set<string>();
    const unique: ExternalJob[] = [];

    for (const job of jobs) {
      // Create a key based on title + company + location
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}_${job.location.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(job);
      }
    }

    return unique;
  }
}

export const jobAggregator = new JobAggregator();