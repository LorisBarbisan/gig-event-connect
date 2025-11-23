export class NotificationService {
  constructor(private notifRepo) {}

  createNotification(data) {
    return this.notifRepo.createNotification(data);
  }

  getNotification(id) {
    return this.notifRepo.getNotification(id);
  }

  getUserNotifications(userId, limit?) {
    return this.notifRepo.getUserNotifications(userId, limit);
  }

  getUnreadNotificationCount(userId) {
    return this.notifRepo.getUnreadNotificationCount(userId);
  }

  getCategoryUnreadCounts(userId) {
    return this.notifRepo.getCategoryUnreadCounts(userId);
  }

  markNotificationAsRead(id) {
    return this.notifRepo.markNotificationAsRead(id);
  }

  markAllNotificationsAsRead(userId) {
    return this.notifRepo.markAllNotificationsAsRead(userId);
  }

  markCategoryNotificationsAsRead(userId, category) {
    return this.notifRepo.markCategoryNotificationsAsRead(userId, category);
  }

  deleteNotification(id) {
    return this.notifRepo.deleteNotification(id);
  }

  deleteExpiredNotifications() {
    return this.notifRepo.deleteExpiredNotifications();
  }
}
