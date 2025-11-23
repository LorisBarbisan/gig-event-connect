export class ApplicationService {
  constructor(private appRepo) {}

  createJobApplication(data) {
    return this.appRepo.createJobApplication(data);
  }

  getFreelancerApplications(id) {
    return this.appRepo.getFreelancerApplications(id);
  }

  getJobApplications(id) {
    return this.appRepo.getJobApplications(id);
  }

  getJobApplicationById(id) {
    return this.appRepo.getJobApplicationById(id);
  }

  updateApplicationStatus(id, status, rejectionMsg?) {
    return this.appRepo.updateApplicationStatus(id, status, rejectionMsg);
  }

  softDeleteApplication(id, role) {
    return this.appRepo.softDeleteApplication(id, role);
  }

  getRecruiterApplications(id) {
    return this.appRepo.getRecruiterApplications(id);
  }
}
