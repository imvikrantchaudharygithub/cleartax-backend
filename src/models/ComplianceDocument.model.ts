import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceDocument extends Document {
  name: string;
  type: string;
  uploadDate: Date;
  size: string;
  status: 'verified' | 'pending' | 'rejected';
  fileUrl: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceDocumentSchema = new Schema<IComplianceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      maxlength: [200, 'Document name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true,
    },
    uploadDate: {
      type: Date,
      required: [true, 'Upload date is required'],
    },
    size: {
      type: String,
      required: [true, 'File size is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
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
ComplianceDocumentSchema.index({ status: 1 });
ComplianceDocumentSchema.index({ type: 1 });
ComplianceDocumentSchema.index({ uploadDate: -1 });
ComplianceDocumentSchema.index({ userId: 1 });

export const ComplianceDocument = mongoose.model<IComplianceDocument>('ComplianceDocument', ComplianceDocumentSchema);

