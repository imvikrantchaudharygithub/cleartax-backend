import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  businessType: string;
  message: string;
  sourcePage: string;
  type: 'callback' | 'query';
  status: 'pending' | 'contacted' | 'resolved' | 'archived';
  serviceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      enum: ['individual', 'proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited', 'other'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    sourcePage: {
      type: String,
      required: [true, 'Source page is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['callback', 'query'],
      required: [true, 'Inquiry type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'resolved', 'archived'],
      default: 'pending',
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InquirySchema.index({ email: 1 });
InquirySchema.index({ phone: 1 });
InquirySchema.index({ status: 1 });
InquirySchema.index({ type: 1 });
InquirySchema.index({ sourcePage: 1 });
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ name: 'text', email: 'text', message: 'text' });

export const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);

