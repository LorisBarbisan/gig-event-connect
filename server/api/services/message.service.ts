export class MessageService {
  constructor(private messageRepo) {}

  sendMessage(data) {
    return this.messageRepo.sendMessage(data);
  }

  getConversationMessages(convoId) {
    return this.messageRepo.getConversationMessages(convoId);
  }

  getConversationMessagesForUser(convoId, userId) {
    return this.messageRepo.getConversationMessagesForUser(convoId, userId);
  }

  markMessagesAsRead(convoId, userId) {
    return this.messageRepo.markMessagesAsRead(convoId, userId);
  }

  markMessageDeletedForUser(messageId, userId) {
    return this.messageRepo.markMessageDeletedForUser(messageId, userId);
  }
}
