export class JobService {
  constructor(private jobRepo) {}

  getAllJobs() {
    return this.jobRepo.getAllJobs();
  }

  getAllJobsSortedByDate() {
    return this.jobRepo.getAllJobsSortedByDate();
  }

  getJobsByRecruiterId(id) {
    return this.jobRepo.getJobsByRecruiterId(id);
  }

  getJobById(id) {
    return this.jobRepo.getJobById(id);
  }

  createJob(job) {
    return this.jobRepo.createJob(job);
  }

  updateJob(jobId, data) {
    return this.jobRepo.updateJob(jobId, data);
  }

  deleteJob(jobId) {
    return this.jobRepo.deleteJob(jobId);
  }

  getExternalJobs() {
    return this.jobRepo.getExternalJobs();
  }
}
