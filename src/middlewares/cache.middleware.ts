import { Request, Response, NextFunction } from 'express';

/**
 * Mark a public GET response as cacheable by the CDN (Vercel edge).
 * Repeat reads are served from the edge without invoking the serverless
 * function or MongoDB.
 *
 * Only attach to public, unauthenticated GET routes — cached responses
 * are shared across all clients.
 */
export const publicCache = (_req: Request, res: Response, next: NextFunction): void => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  next();
};
