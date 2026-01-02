import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface ISocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

export interface IContact extends Document {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  location?: string;
  website?: string;
  socialMedia?: ISocialMedia;
  businessHours: {
    monday: IBusinessHours;
    tuesday: IBusinessHours;
    wednesday: IBusinessHours;
    thursday: IBusinessHours;
    friday: IBusinessHours;
    saturday: IBusinessHours;
    sunday: IBusinessHours;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessHoursSchema = new Schema<IBusinessHours>(
  {
    open: {
      type: String,
      trim: true,
      default: '',
    },
    close: {
      type: String,
      trim: true,
      default: '',
    },
    closed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const SocialMediaSchema = new Schema<ISocialMedia>(
  {
    facebook: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    youtube: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ContactSchema = new Schema<IContact>(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+\..+/, 'Please provide a valid URL'],
    },
    socialMedia: {
      type: SocialMediaSchema,
      default: {},
    },
    businessHours: {
      monday: {
        type: BusinessHoursSchema,
        required: true,
      },
      tuesday: {
        type: BusinessHoursSchema,
        required: true,
      },
      wednesday: {
        type: BusinessHoursSchema,
        required: true,
      },
      thursday: {
        type: BusinessHoursSchema,
        required: true,
      },
      friday: {
        type: BusinessHoursSchema,
        required: true,
      },
      saturday: {
        type: BusinessHoursSchema,
        required: true,
      },
      sunday: {
        type: BusinessHoursSchema,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);

