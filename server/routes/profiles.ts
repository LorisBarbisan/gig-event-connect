import type { Express } from "express";
import { storage } from "../storage";
import { insertFreelancerProfileSchema, insertRecruiterProfileSchema } from "@shared/schema";

export function registerProfileRoutes(app: Express) {
  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without sensitive information
      const { password, email_verification_token, password_reset_token, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get freelancer profile
  app.get("/api/freelancer/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getFreelancerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Freelancer profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Get freelancer profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create freelancer profile
  app.post("/api/freelancer", async (req, res) => {
    try {
      const result = insertFreelancerProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const profile = await storage.createFreelancerProfile(result.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Create freelancer profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update freelancer profile
  app.put("/api/freelancer/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is authorized to update this profile
      if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
        return res.status(403).json({ error: "Not authorized to update this profile" });
      }

      const result = insertFreelancerProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const profile = await storage.updateFreelancerProfile(userId, result.data);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Update freelancer profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get recruiter profile
  app.get("/api/recruiter/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getRecruiterProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Recruiter profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Get recruiter profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create recruiter profile
  app.post("/api/recruiter", async (req, res) => {
    try {
      const result = insertRecruiterProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const profile = await storage.createRecruiterProfile(result.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Create recruiter profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update recruiter profile
  app.put("/api/recruiter/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is authorized to update this profile
      if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
        return res.status(403).json({ error: "Not authorized to update this profile" });
      }

      const result = insertRecruiterProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const profile = await storage.updateRecruiterProfile(userId, result.data);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Update recruiter profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all freelancers (for recruiter job search)
  app.get("/api/freelancers", async (req, res) => {
    try {
      const freelancers = await storage.getAllFreelancers();
      res.json(freelancers);
    } catch (error) {
      console.error("Get freelancers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}