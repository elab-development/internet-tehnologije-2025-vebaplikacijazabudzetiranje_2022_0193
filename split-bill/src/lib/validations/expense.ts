import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';

/**
 * Validation schema za kreiranje troška
 */
export const createExpenseSchema = z.object({
  groupId: z
    .string()
    .min(1, 'Group ID is required'),
  
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters')
    .max(200, 'Description must be less than 200 characters')
    .trim(),
  
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999.99, 'Amount too large'),
  
  category: z.nativeEnum(ExpenseCategory, {
    message: 'Invalid expense category',
  }),
  
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  
  splits: z
    .array(
      z.object({
        userId: z.string(),
        amount: z.number().positive(),
      })
    )
    .min(1, 'At least one split is required'),
});

/**
 * Validation schema za ažuriranje troška
 */
export const updateExpenseSchema = z.object({
  description: z
    .string()
    .min(2)
    .max(200)
    .trim()
    .optional(),
  
  amount: z
    .number()
    .positive()
    .max(999999.99)
    .optional(),
  
  category: z
    .nativeEnum(ExpenseCategory)
    .optional(),
  
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
});

/**
 * TypeScript tipovi
 */
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;