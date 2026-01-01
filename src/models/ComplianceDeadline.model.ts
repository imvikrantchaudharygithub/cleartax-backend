import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceDeadline extends Document {
  title: string;
  description: string;
  dueDate: Date;
  status: 'urgent' | 'upcoming' | 'completed';
  category: 'GST' | 'Income Tax' | 'TDS' | 'Other';
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceDeadlineSchema = new Schema<IComplianceDeadline>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['urgent', 'upcoming', 'completed'],
      required: [true, 'Status is required'],
    },
    category: {
      type: String,
      enum: ['GST', 'Income Tax', 'TDS', 'Other'],
      required: [true, 'Category is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ComplianceDeadlineSchema.index({ status: 1 });
ComplianceDeadlineSchema.index({ category: 1 });
ComplianceDeadlineSchema.index({ dueDate: 1 });
ComplianceDeadlineSchema.index({ userId: 1 });

export const ComplianceDeadline = mongoose.model<IComplianceDeadline>('ComplianceDeadline', ComplianceDeadlineSchema);

