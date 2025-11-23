export class ProfileService {
  constructor(
    private freelancerRepo,
    private recruiterRepo,
    private cache
  ) {}

  getFreelancerProfile(userId) {
    return this.freelancerRepo.getFreelancerProfile(userId);
  }

  createFreelancerProfile(profile) {
    return this.freelancerRepo.createFreelancerProfile(profile);
  }

  updateFreelancerProfile(userId, data) {
    return this.freelancerRepo.updateFreelancerProfile(userId, data);
  }

  getRecruiterProfile(userId) {
    return this.recruiterRepo.getRecruiterProfile(userId);
  }

  createRecruiterProfile(profile) {
    return this.recruiterRepo.createRecruiterProfile(profile);
  }

  updateRecruiterProfile(userId, data) {
    return this.recruiterRepo.updateRecruiterProfile(userId, data);
  }

  getAllFreelancerProfiles() {
    return this.freelancerRepo.getAllFreelancerProfiles();
  }

  getAllRecruiterProfiles() {
    return this.recruiterRepo.getAllRecruiterProfiles();
  }

  searchFreelancers(filters) {
    return this.freelancerRepo.searchFreelancers(filters);
  }
}
