import { Testimonial } from '../models/Testimonial.model';
import {
  TestimonialCreateRequest,
  TestimonialUpdateRequest,
  TestimonialResponse,
} from '../types/testimonial.types';
import mongoose from 'mongoose';
import { AppError } from '../middlewares/error.middleware';

// Testimonials carry both a Mongo `_id` and a human/business `id` field.
// Mirror the team.service.ts pattern: 24-hex strings are treated as `_id`,
// anything else as the business `id`.
const isMongoId = (s: string) => /^[a-fA-F0-9]{24}$/.test(s);

const buildIdFilter = (id: string) =>
  isMongoId(id) ? { _id: new mongoose.Types.ObjectId(id) } : { id };

export const getTestimonials = async (): Promise<TestimonialResponse[]> => {
  const testimonials = await Testimonial.find()
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return testimonials as unknown as TestimonialResponse[];
};

export const getTestimonialById = async (id: string): Promise<TestimonialResponse> => {
  const testimonial = await Testimonial.findOne(buildIdFilter(id)).lean();

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  return testimonial as unknown as TestimonialResponse;
};

export const getFeaturedTestimonials = async (): Promise<TestimonialResponse[]> => {
  const testimonials = await Testimonial.find({ featured: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return testimonials as unknown as TestimonialResponse[];
};

export const createTestimonial = async (
  data: TestimonialCreateRequest
): Promise<TestimonialResponse> => {
  // Check if id already exists
  const existing = await Testimonial.findOne({ id: data.id });

  if (existing) {
    throw new AppError('A testimonial with this ID already exists', 409);
  }

  const testimonial = await Testimonial.create(data);
  return testimonial.toObject() as unknown as TestimonialResponse;
};

export const updateTestimonial = async (
  id: string,
  data: TestimonialUpdateRequest
): Promise<TestimonialResponse> => {
  const testimonial = await Testimonial.findOneAndUpdate(buildIdFilter(id), data, {
    new: true,
  }).lean();

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  return testimonial as unknown as TestimonialResponse;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  const testimonial = await Testimonial.findOneAndDelete(buildIdFilter(id));

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }
};
