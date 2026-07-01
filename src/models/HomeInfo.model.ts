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
  badge?: string;
  checklistItems: string[];
  heroImage?: string;
  heroImageAlt?: string;
  heroImagePublicId?: string;
  heroImages?: IHeroImageItem[];
}

export type StatIcon =
  | 'FileText'
  | 'Users'
  | 'TrendingUp'
  | 'FileCheck'
  | 'Award'
  | 'Building2'
  | 'Receipt'
  | 'Calculator';

export const STAT_ICONS: StatIcon[] = [
  'FileText',
  'Users',
  'TrendingUp',
  'FileCheck',
  'Award',
  'Building2',
  'Receipt',
  'Calculator',
];

export interface IStatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon: StatIcon;
}

export interface IStats {
  items: IStatItem[];
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
  stats?: IStats;
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
      badge: { type: String },
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
    stats: {
      type: {
        items: {
          type: [
            {
              value: { type: Number, required: true },
              prefix: { type: String },
              suffix: { type: String },
              label: { type: String, required: true },
              icon: {
                type: String,
                required: true,
                enum: STAT_ICONS,
              },
            },
          ],
          validate: [
            (val: IStatItem[]) => val.length === 4,
            '{PATH} must have exactly 4 items',
          ],
        },
      },
      required: false,
      _id: false,
    },
  },
  {
    timestamps: true,
  }
);

export const HomeInfo = mongoose.model<IHomeInfo>('HomeInfo', HomeInfoSchema);
