import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createErrorResponse, handleApiError } from '@/lib/utils/api-error';
import { sendVerificationEmail } from '@/lib/email/send';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * GET /api/auth/verify-email?userId=xxx
 * Verifikacija email adrese — korisnik dolazi klikom na link iz emaila.
 * Nakon uspješne verifikacije redirectuje na /login?verified=1
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.redirect(`${BASE_URL}/login?error=invalid_link`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.redirect(`${BASE_URL}/login?error=invalid_link`);
    }

    if (user.emailVerified) {
      return NextResponse.redirect(`${BASE_URL}/login?verified=already`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return NextResponse.redirect(`${BASE_URL}/login?verified=1`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/auth/verify-email
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

    const verificationUrl = `${BASE_URL}/api/auth/verify-email?userId=${user.id}`;
    await sendVerificationEmail(user.email, {
      name: user.name,
      verificationUrl,
    });

    return NextResponse.json({
      message: 'If the email exists, a verification link has been sent.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
