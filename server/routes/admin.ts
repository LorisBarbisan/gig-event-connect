import type { Express } from "express";
import { storage } from "../storage";

// Admin authentication middleware
export const requireAdminAuth = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Admin email allowlist for server-side admin role detection
const ADMIN_EMAILS = [
  'loris.barbisan@huzahr.com',
  'testadmin@example.com'
];

export function registerAdminRoutes(app: Express) {
  // Get all feedback (admin only)
  app.get("/api/admin/feedback", requireAdminAuth, async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Get admin feedback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get feedback statistics (admin only)
  app.get("/api/admin/feedback/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      console.error("Get feedback stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update feedback status (admin only)
  app.put("/api/admin/feedback/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const { status } = req.body;

      if (!['pending', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await storage.updateFeedbackStatus(feedbackId, status);
      res.json({ message: "Feedback status updated successfully" });
    } catch (error) {
      console.error("Update feedback status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add admin response to feedback (admin only)
  app.put("/api/admin/feedback/:id/response", requireAdminAuth, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const { response } = req.body;

      if (!response) {
        return res.status(400).json({ error: "Response is required" });
      }

      await storage.updateFeedbackResponse(feedbackId, response);
      res.json({ message: "Admin response added successfully" });
    } catch (error) {
      console.error("Add feedback response error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all users with profiles (admin only)
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithProfiles();
      
      // Remove sensitive information
      const safeUsers = users.map(user => {
        const { password, email_verification_token, password_reset_token, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get analytics overview (admin only)
  app.get("/api/admin/analytics/overview", requireAdminAuth, async (req, res) => {
    try {
      const analytics = {
        totalUsers: await storage.getTotalUserCount(),
        totalJobs: await storage.getTotalJobCount(),
        totalApplications: await storage.getTotalApplicationCount(),
        recentActivity: await storage.getRecentActivity(),
        usersByRole: await storage.getUserCountByRole(),
        applicationsByStatus: await storage.getApplicationCountByStatus(),
        jobsByStatus: await storage.getJobCountByStatus()
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Get analytics overview error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all admin users (admin only)
  app.get("/api/admin/users/admins", requireAdminAuth, async (req, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      
      // Remove sensitive information
      const safeAdmins = adminUsers.map(user => {
        const { password, email_verification_token, password_reset_token, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeAdmins);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Grant admin access to user (admin only)
  app.post("/api/admin/users/grant-admin", requireAdminAuth, async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if email is in admin allowlist
      if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return res.status(400).json({ 
          error: "User email is not in the admin allowlist. Contact system administrator to add this email to the allowlist." 
        });
      }

      // Update user role to admin
      const updatedUser = await storage.updateUser(userId, { role: 'admin' });
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to grant admin access" });
      }

      res.json({
        message: "Admin access granted successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Grant admin error:', error);
      res.status(500).json({ error: 'Failed to grant admin access' });
    }
  });

  // Revoke admin access from user (admin only)
  app.post("/api/admin/users/revoke-admin", requireAdminAuth, async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Prevent self-demotion
      if (req.user.id === userId) {
        return res.status(400).json({ error: "Cannot revoke your own admin access" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== 'admin') {
        return res.status(400).json({ error: "User is not an admin" });
      }

      // Update user role to freelancer (default)
      const updatedUser = await storage.updateUser(userId, { role: 'freelancer' });
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to revoke admin access" });
      }

      res.json({
        message: "Admin access revoked successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Revoke admin error:', error);
      res.status(500).json({ error: 'Failed to revoke admin status' });
    }
  });

  // Admin Dashboard Route (will be handled by frontend routing)
  app.get("/admin/*", (req, res, next) => {
    // This will be handled by the frontend router
    next();
  });
}