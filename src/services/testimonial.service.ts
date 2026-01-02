import { Testimonial } from '../models/Testimonial.model';
import {
  TestimonialCreateRequest,
  TestimonialUpdateRequest,
  TestimonialResponse,
} from '../types/testimonial.types';
import mongoose from 'mongoose';

export const getTestimonials = async (): Promise<TestimonialResponse[]> => {
  const testimonials = await Testimonial.find()
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return testimonials as unknown as TestimonialResponse[];
};

export const getTestimonialById = async (id: string): Promise<TestimonialResponse> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid testimonial ID format');
  }

  const testimonial = await Testimonial.findById(id).lean();

  if (!testimonial) {
    throw new Error('Testimonial not found');
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
    throw new Error('A testimonial with this ID already exists');
  }

  const testimonial = await Testimonial.create(data);
  return testimonial.toObject() as unknown as TestimonialResponse;
};

export const updateTestimonial = async (
  id: string,
  data: TestimonialUpdateRequest
): Promise<TestimonialResponse> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid testimonial ID format');
  }

  const testimonial = await Testimonial.findByIdAndUpdate(id, data, { new: true }).lean();

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  return testimonial as unknown as TestimonialResponse;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid testimonial ID format');
  }

  const testimonial = await Testimonial.findByIdAndDelete(id);

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }
};

