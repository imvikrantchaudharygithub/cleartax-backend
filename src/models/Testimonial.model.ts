import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  id: string;
  companyName: string;
  companyLogo?: string;
  testimonial: string;
  personName: string;
  personRole: string;
  personAvatar?: string;
  rating: number;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    id: {
      type: String,
      required: [true, 'Testimonial ID is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    testimonial: {
      type: String,
      required: [true, 'Testimonial text is required'],
      trim: true,
      maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
    },
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [100, 'Person name cannot exceed 100 characters'],
    },
    personRole: {
      type: String,
      required: [true, 'Person role is required'],
      trim: true,
      maxlength: [100, 'Person role cannot exceed 100 characters'],
    },
    personAvatar: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TestimonialSchema.index({ featured: 1, order: 1 });
TestimonialSchema.index({ rating: -1, createdAt: -1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

