import { z } from 'zod';

// Time format validation (HH:mm)
const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

// Business hours schema for a single day
const businessDaySchema = z
  .object({
    open: z.string(),
    close: z.string(),
    closed: z.coerce.boolean(),
  })
  .refine(
    (data) => {
      // If closed, open and close can be empty
      if (data.closed) {
        return true;
      }
      // If not closed, both open and close must be provided and valid
      return (
        data.open.trim() !== '' &&
        data.close.trim() !== '' &&
        timeFormatRegex.test(data.open) &&
        timeFormatRegex.test(data.close)
      );
    },
    {
      message: 'Open and close times are required when day is not closed and must be in HH:mm format',
    }
  )
  .refine(
    (data) => {
      // If not closed, validate that close time is after open time
      if (!data.closed && data.open && data.close) {
        const [openHour, openMin] = data.open.split(':').map(Number);
        const [closeHour, closeMin] = data.close.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;
        return closeTime > openTime;
      }
      return true;
    },
    {
      message: 'Close time must be after open time',
    }
  );

const socialMediaSchema = z
  .object({
    facebook: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid Facebook URL',
      }),
    twitter: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid Twitter URL',
      }),
    linkedin: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid LinkedIn URL',
      }),
    instagram: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid Instagram URL',
      }),
    youtube: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid YouTube URL',
      }),
    github: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid GitHub URL',
      }),
  })
  .optional();

export const updateContactSchema = z.object({
  body: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    whatsapp: z.string().min(1, 'WhatsApp number is required'),
    email: z.string().email('Invalid email format'),
    address: z.string().min(1, 'Address is required').max(500, 'Address cannot exceed 500 characters'),
    location: z.string().max(200, 'Location cannot exceed 200 characters').optional(),
    website: z
      .string()
      .optional()
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: 'Invalid website URL',
      }),
    socialMedia: socialMediaSchema,
    businessHours: z.object({
      monday: businessDaySchema,
      tuesday: businessDaySchema,
      wednesday: businessDaySchema,
      thursday: businessDaySchema,
      friday: businessDaySchema,
      saturday: businessDaySchema,
      sunday: businessDaySchema,
    }),
  }),
});

