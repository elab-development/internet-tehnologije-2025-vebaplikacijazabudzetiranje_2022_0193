import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Standardizovani error response format
 */
export interface ApiError {
  error: string;
  details?: any;
  code?: string;
}

/**
 * Kreira JSON error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status }
  );
}

/**
 * Handluje Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ApiError> {
  const formattedErrors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    {
      error: 'Validation failed',
      details: formattedErrors,
    },
    { status: 400 }
  );
}

/**
 * Handluje Prisma errors (duplicate keys, foreign key violations, itd.)
 */
export function handlePrismaError(error: any): NextResponse<ApiError> {
  // Unique constraint violation
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0] || 'field';
      return createErrorResponse(
        `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        409
      );
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return createErrorResponse('Related record not found', 404);
    }

    // Record not found
    if (error.code === 'P2025') {
      return createErrorResponse('Record not found', 404);
    }
  }

  // Generic Prisma error
  return createErrorResponse('Database error occurred', 500);
}

/**
 * Generic error handler
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error);

  // Zod validation error
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Custom error sa message
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }

  // Unknown error
  return createErrorResponse('An unexpected error occurred', 500);
}