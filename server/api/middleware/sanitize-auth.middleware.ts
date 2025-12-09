import { NextFunction, Request, Response } from "express";

// Input sanitization middleware for authentication
export const sanitizeAuthInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Trim whitespace and normalize email
    if (req.body.email) {
      req.body.email = req.body.email.trim().toLowerCase();
    }
    // Ensure password length limits
    if (req.body.password && req.body.password.length > 128) {
      return res.status(400).json({ error: "Password too long" });
    }
  }
  next();
};
