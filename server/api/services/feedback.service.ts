export class FeedbackService {
  constructor(private feedbackRepo) {}

  createFeedback(data) {
    return this.feedbackRepo.createFeedback(data);
  }

  getAllFeedback() {
    return this.feedbackRepo.getAllFeedback();
  }

  getFeedbackById(id) {
    return this.feedbackRepo.getFeedbackById(id);
  }

  updateFeedbackStatus(id, status, adminUserId?) {
    return this.feedbackRepo.updateFeedbackStatus(id, status, adminUserId);
  }

  addAdminResponse(id, response, adminUserId) {
    return this.feedbackRepo.addAdminResponse(id, response, adminUserId);
  }

  getFeedbackByStatus(status) {
    return this.feedbackRepo.getFeedbackByStatus(status);
  }

  getFeedbackStats() {
    return this.feedbackRepo.getFeedbackStats();
  }
}
