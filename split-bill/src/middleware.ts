import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

/**
 * Next.js Middleware za zaštitu ruta
 * Koristi NextAuth.js withAuth wrapper
 * 
 * Provera autentifikacije i role-based access control
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Logovanje za debugging (samo u development-u)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Middleware:', {
        path,
        authenticated: !!token,
        role: token?.role,
      });
    }

    // ============================================
    // ADMIN-ONLY ROUTES
    // ============================================
    if (path.startsWith('/admin')) {
      if (token?.role !== UserRole.ADMIN) {
        console.log('❌ Access denied: Admin route, user role:', token?.role);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // ============================================
    // EDITOR+ ROUTES (EDITOR ili ADMIN)
    // ============================================
    if (path.startsWith('/groups/create')) {
      const allowedRoles = [UserRole.ADMIN, UserRole.EDITOR];
      if (!token?.role || !allowedRoles.includes(token.role)) {
        console.log('❌ Access denied: Editor route, user role:', token?.role);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // ============================================
    // AUTHENTICATED ROUTES (bilo koja rola)
    // ============================================
    // Svi ostali protected routes su dostupni svim autentifikovanim korisnicima
    // withAuth automatski proverava da li je token prisutan

    // Nastavi sa request-om
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Callback koji određuje da li je korisnik autorizovan
       * Ako vrati false, korisnik se redirektuje na signIn stranicu
       */
      authorized: ({ token }) => {
        // Korisnik mora imati token (biti prijavljen)
        return !!token;
      },
    },
    pages: {
      signIn: '/login', // Redirect na login stranicu ako nije autentifikovan
    },
  }
);

/**
 * Matcher config - definisanje koje rute middleware treba da štiti
 * 
 * Protected routes:
 * - /dashboard/* - Glavni dashboard i sve podstranice
 * - /groups/* - Sve rute vezane za grupe
 * - /profile/* - Korisnički profil
 * - /admin/* - Admin panel (samo ADMIN rola)
 * 
 * Public routes (nisu u matcher-u):
 * - / - Landing page
 * - /login - Login stranica
 * - /register - Registracija
 * - /api/auth/* - NextAuth endpoints
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/groups/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};