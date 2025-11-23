export class RatingService {
  constructor(private ratingRepo) {}

  createRating(data) {
    return this.ratingRepo.createRating(data);
  }

  getRatingByJobApplication(appId) {
    return this.ratingRepo.getRatingByJobApplication(appId);
  }

  getFreelancerRatings(id) {
    return this.ratingRepo.getFreelancerRatings(id);
  }

  getFreelancerAverageRating(id) {
    return this.ratingRepo.getFreelancerAverageRating(id);
  }

  canRecruiterRateFreelancer(recruiterId, freelancerId, appId) {
    return this.ratingRepo.canRecruiterRateFreelancer(recruiterId, freelancerId, appId);
  }

  createRatingRequest(data) {
    return this.ratingRepo.createRatingRequest(data);
  }

  getRatingRequestByJobApplication(appId) {
    return this.ratingRepo.getRatingRequestByJobApplication(appId);
  }

  getRecruiterRatingRequests(id) {
    return this.ratingRepo.getRecruiterRatingRequests(id);
  }

  getFreelancerRatingRequests(id) {
    return this.ratingRepo.getFreelancerRatingRequests(id);
  }

  updateRatingRequestStatus(id, status) {
    return this.ratingRepo.updateRatingRequestStatus(id, status);
  }
}
