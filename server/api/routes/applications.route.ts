import type { Express } from "express";
import {
  acceptApplication,
  applyToJob,
  deleteApplication,
  getFreelancerApplications,
  getFreelancerBookings,
  getJobApplications,
  getRecruiterApplications,
  rejectApplication,
} from "../controllers/applications.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

export function registerApplicationRoutes(app: Express) {
  // Get freelancer bookings (accepted applications)
  app.get("/api/freelancer/:freelancerId/bookings", authenticateJWT, getFreelancerBookings);

  // Apply to job
  app.post("/api/jobs/:jobId/apply", authenticateJWT, applyToJob);

  // Get freelancer applications
  app.get("/api/freelancer/:freelancerId/applications", authenticateJWT, getFreelancerApplications);

  // Get applications for a job
  app.get("/api/jobs/:jobId/applications", authenticateJWT, getJobApplications);

  // Get recruiter applications
  app.get("/api/recruiter/:recruiterId/applications", authenticateJWT, getRecruiterApplications);

  // Accept application
  app.put("/api/applications/:applicationId/accept", authenticateJWT, acceptApplication);

  // Reject application
  app.put("/api/applications/:applicationId/reject", authenticateJWT, rejectApplication);

  // Delete application (soft delete with role-based permissions)
  app.delete("/api/applications/:applicationId", authenticateJWT, deleteApplication);
}
