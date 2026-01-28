import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createErrorResponse, handleApiError } from '@/lib/utils/api-error';

/**
 * GET /api/auth/verify-email?token=xxx
 * Verifikacija email adrese korisnika
 * 
 * Za MVP - automatski verifikujemo sve korisnike
 * U production verziji - koristiti JWT token ili random string
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Pronađi korisnika
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email already verified',
      });
    }

    // Verifikuj email
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/auth/verify-email/resend
 * Ponovno slanje verifikacionog email-a
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return createErrorResponse('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Ne otkrivaj da li email postoji (security)
      return NextResponse.json({
        message: 'If the email exists, a verification link has been sent.',
      });
    }

    if (user.emailVerified) {
      return createErrorResponse('Email already verified', 400);
    }

    // TODO: Pošalji novi verifikacioni email
    // await sendVerificationEmail(user.email, user.id);

    return NextResponse.json({
      message: 'Verification email sent.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}