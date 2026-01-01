import mongoose, { Schema, Document } from 'mongoose';

export interface ICallback extends Document {
  name: string;
  phone: string;
  email: string;
  businessType?: 'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other';
  message?: string;
  sourcePage: string;
  category?: string;
  subcategory?: string;
  serviceId?: mongoose.Types.ObjectId | string;
  status: 'pending' | 'contacted' | 'resolved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const CallbackSchema = new Schema<ICallback>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    businessType: {
      type: String,
      enum: ['individual', 'proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited', 'other'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    sourcePage: {
      type: String,
      required: [true, 'Source page is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    serviceId: {
      type: Schema.Types.Mixed,
      ref: 'Service',
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'resolved', 'archived'],
      default: 'pending',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
CallbackSchema.index({ status: 1 });
CallbackSchema.index({ category: 1 });
CallbackSchema.index({ subcategory: 1 });
CallbackSchema.index({ sourcePage: 1 });
CallbackSchema.index({ createdAt: -1 });
CallbackSchema.index({ email: 1 });
CallbackSchema.index({ phone: 1 });

export const Callback = mongoose.model<ICallback>('Callback', CallbackSchema);



