import type { Express } from "express";
import {
  addFeedbackResponse,
  bootstrapCreateFirstAdmin,
  bootstrapGrantAdminAccess,
  getAdminUsers,
  getAllContactMessages,
  getAllFeedback,
  getAllUsers,
  getAnalyticsOverview,
  getFeedbackStats,
  grantAdminAccess,
  revokeAdminAccess,
  sendContactReply,
  updateFeedbackStatus,
} from "../controllers/admin.controller";
import { requireAdminAuth } from "../middleware/admin.middleware";

export function registerAdminRoutes(app: Express) {
  // Get all feedback (admin only)
  app.get("/feedback", requireAdminAuth, getAllFeedback);

  // Get feedback statistics (admin only)
  app.get("/feedback/stats", requireAdminAuth, getFeedbackStats);

  // Update feedback status (admin only)
  app.put("/feedback/:id/status", requireAdminAuth, updateFeedbackStatus);

  // Add admin response to feedback (admin only)
  app.put("/feedback/:id/response", requireAdminAuth, addFeedbackResponse);

  // Get all contact messages (admin only)
  app.get("/contact-messages", requireAdminAuth, getAllContactMessages);

  // Send reply to contact message (admin only)
  app.post("/contact-messages/:id/reply", requireAdminAuth, sendContactReply);

  // Get all users (admin only)
  app.get("/users", requireAdminAuth, getAllUsers);

  // Get analytics overview (admin only)
  app.get("/analytics/overview", requireAdminAuth, getAnalyticsOverview);

  // Get all admin users (admin only)
  app.get("/users/admins", requireAdminAuth, getAdminUsers);

  // Grant admin access to user (admin only)
  app.post("/users/grant-admin", requireAdminAuth, grantAdminAccess);

  // Revoke admin access from user (admin only)
  app.post("/users/revoke-admin", requireAdminAuth, revokeAdminAccess);

  // Bootstrap endpoint for initial admin setup (no auth required)
  // Special override endpoint for admin@eventlink.one production access
  app.post("/grant-admin-access", bootstrapGrantAdminAccess);

  app.post("/create-first-admin", bootstrapCreateFirstAdmin);

  // Admin Dashboard Route (will be handled by frontend routing)
  app.get("/admin/*", (req, res, next) => {
    // This will be handled by the frontend router
    next();
  });
}
