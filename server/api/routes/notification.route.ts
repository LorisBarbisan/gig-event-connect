import type { Express } from "express";
import {
  createNotification,
  createOrUpdateJobAlertFilter,
  deleteJobAlertFilter,
  deleteNotification,
  getCategoryUnreadCounts,
  getJobAlertFilters,
  getNotificationPreferences,
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markCategoryNotificationsAsRead,
  markNotificationAsRead,
  updateJobAlertFilter,
  updateNotificationPreferences,
} from "../controllers/notification.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

export function registerNotificationRoutes(app: Express) {
  // Get user notifications
  app.get("/api/notifications", authenticateJWT, getUserNotifications);

  // Get unread notification count
  app.get("/api/notifications/unread-count", authenticateJWT, getUnreadNotificationCount);

  // Get category-specific unread notification counts for tab badges
  app.get("/api/notifications/category-counts", authenticateJWT, getCategoryUnreadCounts);

  // Create notification (usually called internally)
  app.post("/api/notifications", authenticateJWT, createNotification);

  // Mark notification as read
  app.patch("/api/notifications/:id/read", authenticateJWT, markNotificationAsRead);

  // Mark all notifications as read
  app.patch("/api/notifications/mark-all-read", authenticateJWT, markAllNotificationsAsRead);

  // Mark category-specific notifications as read
  app.patch(
    "/api/notifications/mark-category-read/:category",
    authenticateJWT,
    markCategoryNotificationsAsRead
  );

  // Delete notification
  app.delete("/api/notifications/:id", authenticateJWT, deleteNotification);

  // Get notification preferences
  app.get("/api/notifications/settings", authenticateJWT, getNotificationPreferences);

  // Update notification preferences
  app.post("/api/notifications/settings", authenticateJWT, updateNotificationPreferences);

  // Get job alert filters (returns first active filter for user)
  app.get("/api/notifications/job-alerts", authenticateJWT, getJobAlertFilters);

  // Create or update job alert filter (upsert pattern)
  app.post("/api/notifications/job-alerts", authenticateJWT, createOrUpdateJobAlertFilter);

  // Update job alert filter
  app.patch("/api/notifications/job-alerts/:id", authenticateJWT, updateJobAlertFilter);

  // Delete job alert filter
  app.delete("/api/notifications/job-alerts/:id", authenticateJWT, deleteJobAlertFilter);
}
