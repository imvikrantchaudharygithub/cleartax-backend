import { z } from 'zod';

export const createTeamMemberSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Team member ID is required'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    role: z.string().min(1, 'Role is required').max(100, 'Role too long'),
    description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
    linkedin: z.string().url('Invalid LinkedIn URL'),
    avatar: z.string().url('Invalid avatar URL').optional(),
    accent: z.string().optional(),
  }),
});

export const updateTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Team member ID is required'),
  }),
  body: createTeamMemberSchema.shape.body.partial(),
});

