import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export interface IFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface IService extends Document {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: mongoose.Types.ObjectId | string; // Can be ObjectId reference or string for backward compatibility
  subcategory?: mongoose.Types.ObjectId | string; // Optional subcategory reference
  categoryName?: string; // String category name for filtering
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: IProcessStep[];
  faqs: IFAQ[];
  relatedServices: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStepSchema = new Schema<IProcessStep>({
  step: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
});

const FAQSchema = new Schema<IFAQ>({
  id: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
});

const ServiceSchema = new Schema<IService>(
  {
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
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    longDescription: {
      type: String,
      required: [true, 'Long description is required'],
      trim: true,
    },
    iconName: {
      type: String,
      required: [true, 'Icon name is required'],
      trim: true,
    },
    category: {
      type: Schema.Types.Mixed, // Support both ObjectId and String for backward compatibility
      ref: 'ServiceCategory',
      required: false,
    },
    subcategory: {
      type: Schema.Types.Mixed, // Support both ObjectId and String
      ref: 'ServiceCategory',
      required: false,
    },
    // Keep categoryName as string for backward compatibility and filtering
    categoryName: {
      type: String,
      trim: true,
    },
    price: {
      min: {
        type: Number,
        required: [true, 'Minimum price is required'],
        min: [0, 'Price must be positive'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum price is required'],
        min: [0, 'Price must be positive'],
      },
      currency: {
        type: String,
        default: 'INR',
        trim: true,
      },
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    process: {
      type: [ProcessStepSchema],
      default: [],
    },
    faqs: {
      type: [FAQSchema],
      default: [],
    },
    relatedServices: {
      type: [Schema.Types.ObjectId],
      ref: 'Service',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (slug already has unique: true, so no need to index it again)
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ subcategory: 1 });
ServiceSchema.index({ categoryName: 1 });
ServiceSchema.index({ title: 'text', shortDescription: 'text', longDescription: 'text' });

export const Service = mongoose.model<IService>('Service', ServiceSchema);

