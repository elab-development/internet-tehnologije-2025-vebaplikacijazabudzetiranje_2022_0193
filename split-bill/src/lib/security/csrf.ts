import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * CSRF Token Generator
 * Generiše jedinstveni token za svaku sesiju
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRF Validation Middleware
 * Validira CSRF token za state-changing operacije (POST, PUT, DELETE, PATCH)
 */
export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  // GET i HEAD zahtevi ne zahtevaju CSRF token
  if (req.method === 'GET' || req.method === 'HEAD') {
    return true;
  }

  // Proveri da li je korisnik autentifikovan
  const session = await getServerSession(authOptions);
  if (!session) {
    return false;
  }

  // Uzmi CSRF token iz headera
  const csrfTokenFromHeader = req.headers.get('x-csrf-token');

  // Uzmi CSRF token iz cookie-a
  const csrfTokenFromCookie = req.cookies.get('csrf-token')?.value;

  // Validacija: tokeni moraju postojati i biti identični
  if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
    return false;
  }

  return csrfTokenFromHeader === csrfTokenFromCookie;
}

/**
 * CSRF Error Response
 */
export function createCsrfErrorResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Invalid CSRF token',
      code: 'CSRF_VALIDATION_FAILED',
    },
    { status: 403 }
  );
}

/**
 * Set CSRF Token Cookie
 * Postavlja CSRF token u cookie
 */
export function setCsrfTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 sata
    path: '/',
  });

  return response;
}
