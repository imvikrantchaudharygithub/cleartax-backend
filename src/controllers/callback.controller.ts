import { Request, Response, NextFunction } from 'express';
import * as callbackService from '../services/callback.service';

export const createCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body;
    const result = await callbackService.createCallback(data);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCallbacks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await callbackService.getCallbacks(req.query as any);
    res.status(200).json({
      success: true,
      data: result.callbacks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCallbackById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await callbackService.getCallbackById(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await callbackService.updateCallback(id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await callbackService.deleteCallback(id);
    res.status(200).json({
      success: true,
      message: 'Callback request deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCallbackStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await callbackService.getCallbackStats();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
