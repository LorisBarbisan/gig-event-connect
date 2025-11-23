export class UserService {
  constructor(
    private userRepo,
    private cache
  ) {}

  getUser(id: number) {
    return this.userRepo.getUser(id);
  }

  getUserWithProfile(id: number) {
    return this.userRepo.getUserWithProfile(id);
  }

  getUserByEmail(email: string) {
    return this.userRepo.getUserByEmail(email);
  }

  createUser(data) {
    return this.userRepo.createUser(data);
  }

  updateUserPassword(userId: number, hashedPassword: string) {
    return this.userRepo.updateUserPassword(userId, hashedPassword);
  }

  updateUserAccount(userId: number, data) {
    return this.userRepo.updateUserAccount(userId, data);
  }

  deleteUserAccount(userId: number) {
    return this.userRepo.deleteUserAccount(userId);
  }

  isUserDeleted(id: number) {
    return this.userRepo.isUserDeleted(id);
  }

  canSendMessageToUser(senderId: number, recipientId: number) {
    return this.userRepo.canSendMessageToUser(senderId, recipientId);
  }
}
