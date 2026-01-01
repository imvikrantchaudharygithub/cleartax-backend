import { Request, Response, NextFunction } from 'express';
import * as complianceService from '../services/compliance.service';
import { uploadComplianceDocument } from '../services/fileUpload.service';

// Deadline controllers
export const getComplianceDeadlines = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await complianceService.getComplianceDeadlines(req.query as any);
    res.status(200).json({
      success: true,
      data: result.deadlines,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingDeadlines = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const deadlines = await complianceService.getUpcomingDeadlines(limit);
    res.status(200).json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    next(error);
  }
};

export const createComplianceDeadline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deadline = await complianceService.createComplianceDeadline(req.body);
    res.status(201).json({
      success: true,
      data: deadline,
      message: 'Compliance deadline created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplianceDeadline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deadline = await complianceService.updateComplianceDeadline(id, req.body);
    res.status(200).json({
      success: true,
      data: deadline,
      message: 'Compliance deadline updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComplianceDeadline = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await complianceService.deleteComplianceDeadline(id);
    res.status(200).json({
      success: true,
      message: 'Compliance deadline deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Document controllers
export const getComplianceDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await complianceService.getComplianceDocuments(req.query as any);
    res.status(200).json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const createComplianceDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let fileUrl = req.body.fileUrl;

    // Upload document if file is provided
    if (req.file) {
      const uploadResult = await uploadComplianceDocument(req.file);
      fileUrl = uploadResult.secureUrl;
    }

    if (!fileUrl) {
      res.status(400).json({
        success: false,
        message: 'File URL or file upload is required',
      });
      return;
    }

    const document = await complianceService.createComplianceDocument({
      ...req.body,
      fileUrl,
      uploadDate: req.body.uploadDate || new Date(),
      size: req.body.size || `${(req.file?.size || 0) / 1024} KB`,
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Compliance document uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplianceDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await complianceService.updateComplianceDocument(id, req.body);
    res.status(200).json({
      success: true,
      data: document,
      message: 'Compliance document updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComplianceDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await complianceService.deleteComplianceDocument(id);
    res.status(200).json({
      success: true,
      message: 'Compliance document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getComplianceStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await complianceService.getComplianceStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

