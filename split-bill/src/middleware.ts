import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { apiRateLimit, strictRateLimit } from '@/lib/security/rate-limit';
import { handleCorsPreflightRequest } from '@/lib/security/cors';

/**
 * Next.js Middleware sa security features
 */
export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ============================================
    // CORS - Handle preflight requests
    // ============================================
    if (req.method === 'OPTIONS') {
      return handleCorsPreflightRequest(req);
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    // Strict rate limit for auth endpoints
    if (path.startsWith('/api/auth/register') || path.startsWith('/api/auth/login')) {
      const rateLimitResponse = await strictRateLimit(req);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }

    // Standard rate limit for other API endpoints
    if (path.startsWith('/api/')) {
      const rateLimitResponse = await apiRateLimit(req);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }

    // ============================================
    // ROLE-BASED ACCESS CONTROL
    // ============================================

    // Admin-only routes
    if (path.startsWith('/admin')) {
      if (token?.role !== UserRole.ADMIN) {
        console.log('❌ Access denied: Admin route, user role:', token?.role);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Editor+ routes
    if (path.startsWith('/groups/create')) {
      const allowedRoles = [UserRole.ADMIN, UserRole.EDITOR];
      if (!token?.role || !allowedRoles.includes(token.role)) {
        console.log('❌ Access denied: Editor route, user role:', token?.role);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // ============================================
    // SECURITY HEADERS
    // ============================================
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    // CSP header
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.exchangerate-api.com;"
      );
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/groups/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};