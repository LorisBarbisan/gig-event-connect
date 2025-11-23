export class AttachmentService {
  constructor(private attachRepo) {}

  createMessageAttachment(data) {
    return this.attachRepo.createMessageAttachment(data);
  }

  getMessageAttachments(messageId) {
    return this.attachRepo.getMessageAttachments(messageId);
  }

  getAttachmentById(id) {
    return this.attachRepo.getAttachmentById(id);
  }

  createFileReport(report) {
    return this.attachRepo.createFileReport(report);
  }
}
