import { Request, Response, NextFunction } from 'express';
import * as callbackService from '../services/callback.service';

export const createCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const callback = await callbackService.createCallback(req.body);
    res.status(201).json({
      success: true,
      data: callback,
      message: 'Callback request created successfully!',
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        })),
      });
    } else {
      next(error);
    }
  }
};

export const getCallbacks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await callbackService.getCallbacks(req.query as any);
    res.status(200).json({
      success: true,
      data: result.callbacks,
      pagination: result.pagination,
      message: 'Callbacks retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCallbackById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const callback = await callbackService.getCallbackById(id);
    res.status(200).json({
      success: true,
      data: callback,
      message: 'Callback retrieved successfully',
    });
  } catch (error: any) {
    if (error.message === 'Callback request not found') {
      res.status(404).json({
        success: false,
        message: 'Callback request not found',
      });
    } else {
      next(error);
    }
  }
};

export const updateCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const callback = await callbackService.updateCallback(id, req.body);
    res.status(200).json({
      success: true,
      data: callback,
      message: 'Callback request updated successfully!',
    });
  } catch (error: any) {
    if (error.message === 'Callback request not found') {
      res.status(404).json({
        success: false,
        message: 'Callback request not found',
      });
    } else {
      next(error);
    }
  }
};

export const deleteCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await callbackService.deleteCallback(id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Callback request deleted successfully!',
    });
  } catch (error: any) {
    if (error.message === 'Callback request not found') {
      res.status(404).json({
        success: false,
        message: 'Callback request not found',
      });
    } else {
      next(error);
    }
  }
};

export const getCallbackStats = async (_req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await callbackService.getCallbackStats();
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};


