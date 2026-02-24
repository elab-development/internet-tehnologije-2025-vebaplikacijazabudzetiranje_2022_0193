import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfTokenCookie } from '@/lib/security/csrf';

/**
 * GET /api/csrf
 * Generiše i vraća CSRF token
 */
export async function GET() {
  const token = generateCsrfToken();

  const response = NextResponse.json({
    csrfToken: token,
  });

  // Postavi token u cookie
  setCsrfTokenCookie(response, token);

  return response;
}
