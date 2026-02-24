import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations/auth';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { UserRole } from '@prisma/client';
import { sanitizeObject } from '@/lib/security/sanitize';

/**
 * POST /api/auth/register
 * Registracija novog korisnika
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   name: string,
 *   bio?: string
 * }
 * 
 * Response (Success - 201):
 * {
 *   message: "User registered successfully",
 *   userId: string
 * }
 * 
 * Response (Error - 400/409/500):
 * {
 *   error: string,
 *   details?: any
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json();

    // 2. Sanitize input (XSS protection)
    const sanitizedBody = sanitizeObject(body);

    // 3. Validate input sa Zod
    const validatedData = registerSchema.parse(sanitizedBody);

    // 4. Proveri da li email već postoji
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return createErrorResponse(
        'Email already registered',
        409 // Conflict
      );
    }

    // 5. Hash lozinke
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // 6. Kreiraj korisnika u bazi
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        bio: validatedData.bio || null,
        role: UserRole.USER, // Default role
        emailVerified: false, // Zahteva verifikaciju
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // 7. TODO: Pošalji verifikacioni email (implementiraćemo később)
    // await sendVerificationEmail(user.email, user.id);

    // 8. Vrati success response
    return NextResponse.json(
      {
        message: 'User registered successfully. Please verify your email.',
        userId: user.id,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Centralizovani error handling
    return handleApiError(error);
  }
}