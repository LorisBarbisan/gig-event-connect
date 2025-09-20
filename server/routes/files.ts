import type { Express } from "express";
import { storage } from "../storage";
import { ObjectStorageService, ObjectNotFoundError } from "../objectStorage";

export function registerFileRoutes(app: Express) {
  // Get CV upload URL (presigned URL for direct upload)
  app.post("/api/cv/upload-url", async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'freelancer') {
        return res.status(403).json({ error: "Only freelancers can upload CVs" });
      }

      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({ error: "Filename and content type are required" });
      }

      // Generate object key
      const objectKey = `cvs/${req.user.id}/${Date.now()}-${filename}`;

      // Get presigned upload URL
      const uploadUrl = await ObjectStorageService.getUploadUrl(objectKey, contentType);

      res.json({ 
        uploadUrl, 
        objectKey,
        message: "Upload URL generated successfully" 
      });
    } catch (error) {
      console.error("Get CV upload URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Save CV metadata after successful upload
  app.post("/api/cv", async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'freelancer') {
        return res.status(403).json({ error: "Only freelancers can save CV metadata" });
      }

      const { objectKey, filename, fileSize } = req.body;

      if (!objectKey || !filename) {
        return res.status(400).json({ error: "Object key and filename are required" });
      }

      // Update freelancer profile with CV information
      const profile = await storage.getFreelancerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Freelancer profile not found" });
      }

      const updatedProfile = await storage.updateFreelancerProfile(req.user.id, {
        cv_object_key: objectKey,
        cv_filename: filename,
        cv_file_size: fileSize || null
      });

      res.json({
        message: "CV uploaded successfully",
        profile: updatedProfile
      });
    } catch (error) {
      console.error("Save CV metadata error:", error);
      res.status(500).json({ error: "Failed to save CV metadata" });
    }
  });

  // Delete CV
  app.delete("/api/cv", async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'freelancer') {
        return res.status(403).json({ error: "Only freelancers can delete their CVs" });
      }

      const profile = await storage.getFreelancerProfile(req.user.id);
      if (!profile || !profile.cv_object_key) {
        return res.status(404).json({ error: "No CV found to delete" });
      }

      // Delete from object storage
      try {
        await ObjectStorageService.deleteObject(profile.cv_object_key);
      } catch (deleteError) {
        console.error("Object storage delete error:", deleteError);
        // Continue with metadata cleanup even if object deletion fails
      }

      // Update profile to remove CV metadata
      const updatedProfile = await storage.updateFreelancerProfile(req.user.id, {
        cv_object_key: null,
        cv_filename: null,
        cv_file_size: null
      });

      res.json({
        message: "CV deleted successfully",
        profile: updatedProfile
      });
    } catch (error) {
      console.error("Delete CV error:", error);
      res.status(500).json({ error: "Failed to delete CV" });
    }
  });

  // Download CV
  app.get("/api/cv/download/:freelancerId", async (req, res) => {
    try {
      const freelancerId = parseInt(req.params.freelancerId);

      // Check authorization - recruiters and admins can download, freelancers can download their own
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (req.user.role === 'freelancer' && req.user.id !== freelancerId) {
        return res.status(403).json({ error: "Not authorized to download this CV" });
      }

      const profile = await storage.getFreelancerProfile(freelancerId);
      if (!profile || !profile.cv_object_key) {
        return res.status(404).json({ error: "CV not found" });
      }

      try {
        // Get presigned download URL
        const downloadUrl = await ObjectStorageService.getDownloadUrl(profile.cv_object_key);
        
        // Redirect to the download URL
        res.redirect(downloadUrl);
      } catch (objectError) {
        if (objectError instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "CV file not found in storage" });
        }
        throw objectError;
      }
    } catch (error) {
      console.error("Download CV error:", error);
      res.status(500).json({ error: "Failed to download CV" });
    }
  });

  // Serve objects (general object storage endpoint)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectPath = req.params.objectPath;
      
      if (!objectPath) {
        return res.status(400).json({ error: "Object path is required" });
      }

      try {
        const downloadUrl = await ObjectStorageService.getDownloadUrl(objectPath);
        res.redirect(downloadUrl);
      } catch (objectError) {
        if (objectError instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "Object not found" });
        }
        throw objectError;
      }
    } catch (error) {
      console.error("Serve object error:", error);
      res.status(500).json({ error: "Failed to serve object" });
    }
  });
}