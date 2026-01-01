import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  slug: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: Date;
  readTime: string;
  excerpt: string;
  content: string;
  image?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    author: {
      name: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
      },
      avatar: {
        type: String,
        required: [true, 'Author avatar is required'],
        trim: true,
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    readTime: {
      type: String,
      required: [true, 'Read time is required'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (slug already has unique: true, so no need to index it again)
BlogSchema.index({ category: 1 });
BlogSchema.index({ featured: 1 });
BlogSchema.index({ date: -1 });
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);

