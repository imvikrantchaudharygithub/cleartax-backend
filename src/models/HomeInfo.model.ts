import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroImageItem {
  url: string;
  alt?: string;
  publicId?: string;
}

export interface IBanner {
  heading: string;
  description: string;
  button1Text: string;
  button2Text: string;
  checklistItems: string[];
  heroImage?: string;
  heroImageAlt?: string;
  heroImagePublicId?: string;
  heroImages?: IHeroImageItem[];
}

export interface IBenefitItem {
  title: string;
  description: string;
  image?: string;
  imagePublicId?: string;
  imagePosition: 'left' | 'right';
  imageAlt?: string;
}

export interface IBenefits {
  heading: string;
  subheading: string;
  items: IBenefitItem[];
}

export interface IServiceCard {
  title: string;
  description: string;
  features: string[];
  href: string;
  icon: 'Receipt' | 'Building2' | 'Calculator' | 'Award';
  colorGradient: string;
}

export interface IServices {
  heading: string;
  subheading: string;
  cards: IServiceCard[];
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface IHomeInfo extends Document {
  banner: IBanner;
  benefits: IBenefits;
  services: IServices;
  createdAt: Date;
  updatedAt: Date;
}

const HomeInfoSchema = new Schema<IHomeInfo>(
  {
    banner: {
      heading: { type: String, required: true },
      description: { type: String, required: true },
      button1Text: { type: String, required: true },
      button2Text: { type: String, required: true },
      checklistItems: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length === 3,
          '{PATH} must have exactly 3 items',
        ],
      },
      heroImage: { type: String },
      heroImageAlt: { type: String },
      heroImagePublicId: { type: String },
      heroImages: {
        type: [
          {
            url: { type: String },
            alt: { type: String },
            publicId: { type: String },
          },
        ],
        default: [],
      },
    },
    benefits: {
      heading: { type: String, required: true },
      subheading: { type: String, required: true },
      items: {
        type: [
          {
            title: { type: String, required: true },
            description: { type: String, required: true },
            image: { type: String },
            imagePublicId: { type: String },
            imagePosition: {
              type: String,
              required: true,
              enum: ['left', 'right'],
            },
            imageAlt: { type: String },
          },
        ],
        required: true,
        validate: [
          (val: IBenefitItem[]) => val.length === 3,
          '{PATH} must have exactly 3 items',
        ],
      },
    },
    services: {
      heading: { type: String, required: true },
      subheading: { type: String, required: true },
      cards: {
        type: [
          {
            title: { type: String, required: true },
            description: { type: String, required: true },
            features: { type: [String], required: true },
            href: { type: String, required: true },
            icon: {
              type: String,
              required: true,
              enum: ['Receipt', 'Building2', 'Calculator', 'Award'],
            },
            colorGradient: { type: String, required: true },
          },
        ],
        required: true,
        validate: [
          (val: IServiceCard[]) => val.length === 4,
          '{PATH} must have exactly 4 items',
        ],
      },
      ctaButtonText: { type: String, required: true },
      ctaButtonLink: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export const HomeInfo = mongoose.model<IHomeInfo>('HomeInfo', HomeInfoSchema);
