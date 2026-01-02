import { Request, Response, NextFunction } from 'express';
import * as contactService from '../services/contact.service';

export const getContact = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await contactService.getContact();
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await contactService.upsertContact(req.body);
    res.status(200).json({
      success: true,
      data: contact,
      message: 'Contact information updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

