import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceCategory extends Document {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  categoryType: 'simple' | 'banking-finance' | 'ipo' | 'legal';
  subServices: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    id: {
      type: String,
      required: [true, 'Category ID is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    iconName: {
      type: String,
      required: [true, 'Icon name is required'],
      trim: true,
    },
    heroTitle: {
      type: String,
      required: [true, 'Hero title is required'],
      trim: true,
    },
    heroDescription: {
      type: String,
      required: [true, 'Hero description is required'],
      trim: true,
    },
    categoryType: {
      type: String,
      enum: ['simple', 'banking-finance', 'ipo', 'legal'],
      required: [true, 'Category type is required'],
    },
    subServices: {
      type: [Schema.Types.ObjectId],
      ref: 'Service',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (id and slug already have unique: true, so no need to index them again)
ServiceCategorySchema.index({ categoryType: 1 });

export const ServiceCategory = mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);

