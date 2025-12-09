import { Response } from "express";

export const CacheHeaders = {
  // Static assets (images, files) - Cache for 1 year
  staticAssets: (res: Response) => {
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.set("ETag", `"${Date.now()}"`);
  },

  // API data that changes infrequently - Cache for 1 hour
  longCache: (res: Response) => {
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.set("ETag", `"${Date.now()}"`);
  },

  // API data that changes moderately - Cache for 5 minutes
  mediumCache: (res: Response) => {
    res.set("Cache-Control", "public, max-age=300, s-maxage=300");
    res.set("ETag", `"${Date.now()}"`);
  },

  // API data that changes frequently - Cache for 1 minute
  shortCache: (res: Response) => {
    res.set("Cache-Control", "public, max-age=60, s-maxage=60");
    res.set("ETag", `"${Date.now()}"`);
  },

  // Private user data - Cache but revalidate
  privateCache: (res: Response) => {
    res.set("Cache-Control", "private, max-age=300, must-revalidate");
  },

  // No cache for sensitive/realtime data
  noCache: (res: Response) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  },
};
