import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { optimizedStorage } from "./storage-optimized";
import { insertUserSchema, insertProfileSchema, insertJobSchema, insertJobApplicationSchema, insertMessageSchema, insertNotificationSchema } from "@shared/schema-optimized";
import { sendVerificationEmail } from "./emailService";
import { randomBytes } from "crypto";

// OPTIMIZED ROUTES: Simplified, efficient API endpoints

export async function registerOptimizedRoutes(app: Express): Promise<Server> {
  
  // =============================================
  // AUTHENTICATION ROUTES - Simplified
  // =============================================
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, role } = insertUserSchema.parse(req.body);
      
      const existingUser = await optimizedStorage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const user = await optimizedStorage.createUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires
      });

      const baseUrl = req.protocol + '://' + req.get('host');
      const emailSent = await sendVerificationEmail(user.email, verificationToken, baseUrl);

      res.json({ 
        message: "Registration successful! Please verify your email to sign in.",
        emailSent: emailSent
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await optimizedStorage.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.email_verified) {
        return res.status(403).json({ error: "Please verify your email before signing in" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user data in session for backend authentication
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Sign in failed" });
    }
  });

  app.get("/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).send("Invalid verification link");
      }

      const isValid = await optimizedStorage.verifyEmail(token);
      
      if (isValid) {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Email Verified - EventLink</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #059669;">Email Verified Successfully!</h1>
            <p>Welcome to EventLink! You can now sign in to your account.</p>
            <a href="/" style="color: #3b82f6; text-decoration: none;">Continue to EventLink</a>
          </body>
          </html>
        `);
      } else {
        res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Verification Failed - EventLink</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Verification Failed</h1>
            <p>The verification link is invalid or expired.</p>
            <a href="/auth" style="color: #3b82f6; text-decoration: none;">Return to Sign In</a>
          </body>
          </html>
        `);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).send("Verification error occurred");
    }
  });

  // =============================================
  // USER & PROFILE ROUTES - Unified
  // =============================================
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await optimizedStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await optimizedStorage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.json(null);
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profile = insertProfileSchema.parse(req.body);
      const result = await optimizedStorage.createProfile(profile);
      res.json(result);
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = req.body;
      const result = await optimizedStorage.updateProfile(userId, profile);
      res.json(result);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await optimizedStorage.deleteUserAccount(userId);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: "Deletion failed" });
    }
  });

  // =============================================
  // JOB ROUTES - Simplified
  // =============================================
  
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await optimizedStorage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.json([]);
    }
  });

  app.get("/api/jobs/recruiter/:recruiterId", async (req, res) => {
    try {
      const recruiterId = parseInt(req.params.recruiterId);
      const jobs = await optimizedStorage.getJobsByRecruiterId(recruiterId);
      res.json(jobs);
    } catch (error) {
      console.error("Get recruiter jobs error:", error);
      res.json([]);
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const job = insertJobSchema.parse(req.body);
      const result = await optimizedStorage.createJob(job);
      res.json(result);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  app.put("/api/jobs/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = req.body;
      const result = await optimizedStorage.updateJob(jobId, job);
      res.json(result);
    } catch (error) {
      console.error("Update job error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/jobs/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      await optimizedStorage.deleteJob(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ error: "Deletion failed" });
    }
  });

  // =============================================
  // APPLICATION ROUTES
  // =============================================
  
  app.post("/api/applications", async (req, res) => {
    try {
      const application = insertJobApplicationSchema.parse(req.body);
      const result = await optimizedStorage.createJobApplication(application);
      res.json(result);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(400).json({ error: "Application failed" });
    }
  });

  app.get("/api/applications/freelancer/:freelancerId", async (req, res) => {
    try {
      const freelancerId = parseInt(req.params.freelancerId);
      const applications = await optimizedStorage.getApplicationsByFreelancer(freelancerId);
      res.json(applications);
    } catch (error) {
      console.error("Get freelancer applications error:", error);
      res.json([]);
    }
  });

  app.get("/api/applications/job/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const applications = await optimizedStorage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Get job applications error:", error);
      res.json([]);
    }
  });

  app.put("/api/applications/:applicationId/status", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const { status } = req.body;
      await optimizedStorage.updateApplicationStatus(applicationId, status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  // =============================================
  // MESSAGING ROUTES - Simplified
  // =============================================
  
  app.post("/api/messages", async (req, res) => {
    try {
      const message = insertMessageSchema.parse(req.body);
      const result = await optimizedStorage.sendMessage(message);
      res.json(result);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(400).json({ error: "Message failed" });
    }
  });

  app.get("/api/messages/:user1/:user2", async (req, res) => {
    try {
      const user1 = parseInt(req.params.user1);
      const user2 = parseInt(req.params.user2);
      const messages = await optimizedStorage.getMessagesBetweenUsers(user1, user2);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.json([]);
    }
  });

  app.put("/api/messages/read/:fromUserId/:toUserId", async (req, res) => {
    try {
      const fromUserId = parseInt(req.params.fromUserId);
      const toUserId = parseInt(req.params.toUserId);
      await optimizedStorage.markMessagesAsRead(fromUserId, toUserId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Mark messages read error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/messages/unread/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const count = await optimizedStorage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.json({ count: 0 });
    }
  });

  // =============================================
  // NOTIFICATION ROUTES
  // =============================================
  
  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = insertNotificationSchema.parse(req.body);
      const result = await optimizedStorage.createNotification(notification);
      res.json(result);
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(400).json({ error: "Notification failed" });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await optimizedStorage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.json([]);
    }
  });

  app.put("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      await optimizedStorage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/notifications/unread/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const count = await optimizedStorage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Get unread notifications count error:", error);
      res.json({ count: 0 });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}