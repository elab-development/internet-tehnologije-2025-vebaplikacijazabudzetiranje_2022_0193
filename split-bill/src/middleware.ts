import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, strictRateLimit } from '@/lib/security/rate-limit';
import { handleCorsPreflightRequest } from '@/lib/security/cors';

/**
 * Next.js Middleware — Edge-Runtime compatible.
 *
 * Replaces the previous withAuth() wrapper which caused 405 errors on Vercel
 * because withAuth is not fully compatible with Next.js 16 Edge Runtime.
 * getToken() from next-auth/jwt works correctly in Edge Runtime.
 */

// Routes that do NOT require authentication
const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/health'];

// Routes that require ADMIN role
const ADMIN_PREFIXES = ['/admin'];

// Routes that require ADMIN or EDITOR role
const EDITOR_PREFIXES = ['/groups/create'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log('[middleware]', req.method, path);

  // ============================================
  // CORS - Handle preflight requests
  // ============================================
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  // ============================================
  // RATE LIMITING
  // ============================================
  const isStrictPath =
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/callback/credentials') ||
    path.startsWith('/api/auth/signin');

  if (isStrictPath) {
    const rateLimitResponse = await strictRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  } else if (path.startsWith('/api/')) {
    // Only apply general API rate limit if not already covered by strict limiter
    const rateLimitResponse = await apiRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // ============================================
  // AUTHENTICATION CHECK
  // ============================================
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
    path.startsWith(prefix)
  );

  if (!isPublicApi) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // API routes return 401; page routes redirect to login
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // ============================================
    // ROLE-BASED ACCESS CONTROL
    // ============================================
    const role = token.role as string;

    if (ADMIN_PREFIXES.some((p) => path.startsWith(p))) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (EDITOR_PREFIXES.some((p) => path.startsWith(p))) {
      if (role !== 'ADMIN' && role !== 'EDITOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  // ============================================
  // SECURITY HEADERS
  // ============================================
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.exchangerate-api.com;"
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/groups/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};
