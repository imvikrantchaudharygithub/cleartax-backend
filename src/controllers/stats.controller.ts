import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service.model';
import { Inquiry } from '../models/Inquiry.model';
import { User } from '../models/User.model';

/**
 * GET /api/stats/dashboard
 * Aggregate counts for the admin dashboard cards, so the frontend makes
 * one request instead of one paginated list query per stat.
 */
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalServices, totalInquiries, totalUsers] = await Promise.all([
      Service.countDocuments({}),
      Inquiry.countDocuments({}),
      User.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: { totalServices, totalInquiries, totalUsers },
    });
  } catch (error) {
    next(error);
  }
};
