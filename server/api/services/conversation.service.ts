export class ConversationService {
  constructor(private convoRepo) {}

  getOrCreateConversation(userOne, userTwo) {
    return this.convoRepo.getOrCreateConversation(userOne, userTwo);
  }

  getConversationsByUserId(userId) {
    return this.convoRepo.getConversationsByUserId(userId);
  }

  deleteConversation(conversationId, userId) {
    return this.convoRepo.deleteConversation(conversationId, userId);
  }
}
