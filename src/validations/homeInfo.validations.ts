import { z } from 'zod';

const heroImageItemSchema = z.object({
  url: z.string().url('Hero image URL must be valid').optional().or(z.literal('')),
  alt: z.string().max(200).optional(),
  publicId: z.string().optional(),
});

const bannerSchema = z.object({
  heading: z.string().max(200, 'Heading must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  button1Text: z.string().max(50, 'Button 1 text must be less than 50 characters'),
  button2Text: z.string().max(50, 'Button 2 text must be less than 50 characters'),
  badge: z.string().max(100, 'Badge must be less than 100 characters').optional().or(z.literal('')),
  checklistItems: z.array(z.string().max(100)).length(3, 'Exactly 3 checklist items are required'),
  heroImage: z.string().url('Hero image must be a valid URL').optional().or(z.literal('')),
  heroImageAlt: z.string().max(200).optional(),
  heroImages: z.array(heroImageItemSchema).optional(),
});

const benefitItemSchema = z.object({
  title: z.string().max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  imagePosition: z.enum(['left', 'right']),
  imageAlt: z.string().max(200).optional(),
});

const benefitsSchema = z.object({
  heading: z.string().max(200, 'Heading must be less than 200 characters'),
  subheading: z.string().max(300, 'Subheading must be less than 300 characters'),
  items: z.array(benefitItemSchema).length(3, 'Exactly 3 benefit items are required'),
});

const serviceCardSchema = z.object({
  title: z.string().max(100, 'Title must be less than 100 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters'),
  features: z.array(z.string().max(100)).min(1, 'At least 1 feature is required'),
  href: z.string().startsWith('/', 'Link must start with /'),
  icon: z.enum(['Receipt', 'Building2', 'Calculator', 'Award']),
  colorGradient: z.string().regex(/^from-\S+ to-\S+$/, 'Gradient must match pattern from-{color} to-{color}'),
});

const servicesSchema = z.object({
  heading: z.string().max(200, 'Heading must be less than 200 characters'),
  subheading: z.string().max(300, 'Subheading must be less than 300 characters'),
  cards: z.array(serviceCardSchema).length(4, 'Exactly 4 service cards are required'),
  ctaButtonText: z.string().max(50, 'CTA button text must be less than 50 characters'),
  ctaButtonLink: z.string().startsWith('/', 'Link must start with /'),
});

const STAT_ICON_VALUES = [
  'FileText',
  'Users',
  'TrendingUp',
  'FileCheck',
  'Award',
  'Building2',
  'Receipt',
  'Calculator',
] as const;

const statItemSchema = z.object({
  value: z.coerce.number({ invalid_type_error: 'Stat value must be a number' }),
  prefix: z.string().max(10, 'Prefix must be less than 10 characters').optional().or(z.literal('')),
  suffix: z.string().max(10, 'Suffix must be less than 10 characters').optional().or(z.literal('')),
  label: z.string().min(1, 'Label is required').max(60, 'Label must be less than 60 characters'),
  icon: z.enum(STAT_ICON_VALUES),
});

const statsSchema = z.object({
  items: z.array(statItemSchema).length(4, 'Exactly 4 stat items are required'),
});

export const homeInfoSchema = z.object({
  body: z.object({
    banner: bannerSchema,
    benefits: benefitsSchema,
    services: servicesSchema,
    stats: statsSchema.optional(),
  }),
});
