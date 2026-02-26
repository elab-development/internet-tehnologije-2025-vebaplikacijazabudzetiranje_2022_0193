import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@prisma/client';
import { createErrorResponse } from '@/lib/utils/api-error';

/**
 * API Middleware helper funkcije
 * Koriste se u API routes za proveru autentifikacije i autorizacije
 */

/**
 * Provera da li je korisnik autentifikovan
 * Koristi se u API routes
 */
export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false as const,
      response: createErrorResponse('Unauthorized', 401),
    };
  }

  return {
    authorized: true as const,
    user: session.user,
  };
}

/**
 * Provera da li korisnik ima određenu rolu
 */
export async function requireRole(req: NextRequest, role: UserRole) {
  const authCheck = await requireAuth(req);

  if (!authCheck.authorized) {
    return authCheck;
  }

  if (authCheck.user.role !== role) {
    return {
      authorized: false as const,
      response: createErrorResponse(
        'Forbidden - Insufficient permissions',
        403
      ),
    };
  }

  return {
    authorized: true as const,
    user: authCheck.user,
  };
}

/**
 * Provera da li korisnik ima jednu od više rola
 */
export async function requireAnyRole(req: NextRequest, roles: UserRole[]) {
  const authCheck = await requireAuth(req);

  if (!authCheck.authorized) {
    return authCheck;
  }

  if (!roles.includes(authCheck.user.role)) {
    return {
      authorized: false as const,
      response: createErrorResponse(
        'Forbidden - Insufficient permissions',
        403
      ),
    };
  }

  return {
    authorized: true as const,
    user: authCheck.user,
  };
}

/**
 * Provera da li je korisnik admin
 */
export async function requireAdmin(req: NextRequest) {
  return requireRole(req, UserRole.ADMIN);
}

/**
 * Provera da li je korisnik editor ili admin
 */
export async function requireEditor(req: NextRequest) {
  return requireAnyRole(req, [UserRole.ADMIN, UserRole.EDITOR]);
}