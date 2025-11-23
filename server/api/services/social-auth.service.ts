export class SocialAuthService {
  constructor(private userRepo) {}

  getUserBySocialProvider(provider, providerId) {
    return this.userRepo.getUserBySocialProvider(provider, providerId);
  }

  createSocialUser(data) {
    return this.userRepo.createSocialUser(data);
  }

  linkSocialProvider(userId: number, provider, providerId, photoUrl?) {
    return this.userRepo.linkSocialProvider(userId, provider, providerId, photoUrl);
  }

  updateUserLastLogin(userId: number, method) {
    return this.userRepo.updateUserLastLogin(userId, method);
  }
}
