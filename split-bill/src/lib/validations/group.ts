import { z } from 'zod';

/**
 * Validation schema za kreiranje grupe
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'Group name must be at least 2 characters')
    .max(100, 'Group name must be less than 100 characters')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
});

/**
 * Validation schema za ažuriranje grupe
 */
export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .trim()
    .optional(),
  
  description: z
    .string()
    .max(500)
    .optional()
    .nullable(),
  
  isArchived: z
    .boolean()
    .optional(),
});

/**
 * Validation schema za dodavanje člana u grupu
 */
export const addMemberSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

/**
 * TypeScript tipovi
 */
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;