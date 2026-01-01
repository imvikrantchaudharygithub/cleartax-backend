import { Request, Response, NextFunction } from 'express';
import * as calculatorService from '../services/calculator.service';
import { CalculatorHistory } from '../models/CalculatorHistory.model';
import mongoose from 'mongoose';

export const calculateIncomeTax = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = calculatorService.calculateIncomeTax(req.body);

    // Save to history if user is authenticated
    if (req.user) {
      await CalculatorHistory.create({
        calculatorType: 'income-tax',
        inputData: req.body,
        result,
        userId: new mongoose.Types.ObjectId(req.user.userId),
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateGST = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = calculatorService.calculateGST(req.body);

    // Save to history if user is authenticated
    if (req.user) {
      await CalculatorHistory.create({
        calculatorType: 'gst',
        inputData: req.body,
        result,
        userId: new mongoose.Types.ObjectId(req.user.userId),
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateEMI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = calculatorService.calculateEMI(req.body);

    // Save to history if user is authenticated
    if (req.user) {
      await CalculatorHistory.create({
        calculatorType: 'emi',
        inputData: req.body,
        result,
        userId: new mongoose.Types.ObjectId(req.user.userId),
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateHRA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = calculatorService.calculateHRA(req.body);

    // Save to history if user is authenticated
    if (req.user) {
      await CalculatorHistory.create({
        calculatorType: 'hra',
        inputData: req.body,
        result,
        userId: new mongoose.Types.ObjectId(req.user.userId),
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateTDS = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = calculatorService.calculateTDS(req.body);

    // Save to history if user is authenticated
    if (req.user) {
      await CalculatorHistory.create({
        calculatorType: 'tds',
        inputData: req.body,
        result,
        userId: new mongoose.Types.ObjectId(req.user.userId),
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCalculationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTH TEMPORARILY DISABLED - Return all history or empty array
    // if (!req.user) {
    //   res.status(401).json({
    //     success: false,
    //     message: 'Authentication required',
    //   });
    //   return;
    // }

    const calculatorType = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const filter: any = {};
    // const filter: any = { userId: new mongoose.Types.ObjectId(req.user.userId) };
    if (calculatorType) {
      filter.calculatorType = calculatorType;
    }

    const history = await CalculatorHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

