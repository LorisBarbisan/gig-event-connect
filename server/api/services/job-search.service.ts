export class JobSearchService {
  constructor(private jobRepo) {}

  searchJobs(filters) {
    return this.jobRepo.searchJobs(filters);
  }

  getJobByExternalId(externalId) {
    return this.jobRepo.getJobByExternalId(externalId);
  }

  createExternalJob(data) {
    return this.jobRepo.createExternalJob(data);
  }
}
