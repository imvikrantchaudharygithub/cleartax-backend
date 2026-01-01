import { Request, Response, NextFunction } from 'express';
import * as inquiryService from '../services/inquiry.service';

export const createInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await inquiryService.getInquiries(req.query as any);
    res.status(200).json({
      success: true,
      data: result.inquiries,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await inquiryService.getInquiryById(id);
    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inquiry = await inquiryService.updateInquiryStatus(id, status);
    res.status(200).json({
      success: true,
      data: inquiry,
      message: 'Inquiry status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await inquiryService.deleteInquiry(id);
    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiryStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await inquiryService.getInquiryStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

