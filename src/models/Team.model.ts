import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  focusOn?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    id: {
      type: String,
      required: [true, 'Team member ID is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    linkedin: {
      type: String,
      required: [true, 'LinkedIn URL is required'],
      trim: true,
      match: [/^https?:\/\/.+\..+/, 'Please provide a valid URL'],
    },
    avatar: {
      type: String,
      trim: true,
    },
    accent: {
      type: String,
      trim: true,
    },
    focusOn: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (id already has unique: true, so no need to index it again)

export const Team = mongoose.model<ITeam>('Team', TeamSchema);

