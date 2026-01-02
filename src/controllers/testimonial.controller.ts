import { Request, Response, NextFunction } from 'express';
import * as testimonialService from '../services/testimonial.service';
import { uploadTestimonialImage } from '../services/fileUpload.service';

export const getTestimonials = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonials = await testimonialService.getTestimonials();
    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestimonialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.getTestimonialById(id);
    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedTestimonials = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonials = await testimonialService.getFeaturedTestimonials();
    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let companyLogoUrl = req.body.companyLogo;
    let personAvatarUrl = req.body.personAvatar;

    // Handle file uploads if provided (using multer like teams)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.companyLogo && files.companyLogo[0]) {
      const uploadResult = await uploadTestimonialImage(files.companyLogo[0]);
      companyLogoUrl = uploadResult.secureUrl;
    }

    if (files?.personAvatar && files.personAvatar[0]) {
      const uploadResult = await uploadTestimonialImage(files.personAvatar[0]);
      personAvatarUrl = uploadResult.secureUrl;
    }

    const testimonial = await testimonialService.createTestimonial({
      ...req.body,
      companyLogo: companyLogoUrl,
      personAvatar: personAvatarUrl,
    });

    res.status(201).json({
      success: true,
      data: testimonial,
      message: 'Testimonial created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Handle file uploads if provided (using multer like teams)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.companyLogo && files.companyLogo[0]) {
      const uploadResult = await uploadTestimonialImage(files.companyLogo[0]);
      updateData.companyLogo = uploadResult.secureUrl;
    }

    if (files?.personAvatar && files.personAvatar[0]) {
      const uploadResult = await uploadTestimonialImage(files.personAvatar[0]);
      updateData.personAvatar = uploadResult.secureUrl;
    }

    const testimonial = await testimonialService.updateTestimonial(id, updateData);
    res.status(200).json({
      success: true,
      data: testimonial,
      message: 'Testimonial updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await testimonialService.deleteTestimonial(id);
    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

