import { NextFunction, Request, Response } from "express";
import { authenticateJWT } from "./auth.middleware";

// Admin authentication middleware - requires JWT auth first
export const requireAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  // First run JWT authentication
  try {
    await new Promise((resolve, reject) => {
      authenticateJWT(req, res, (err: Error | null) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    // Then check if user has admin role
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error: unknown) {
    return res
      .status(401)
      .json({ error: error instanceof Error ? error.message : "Authentication failed" });
  }
};
