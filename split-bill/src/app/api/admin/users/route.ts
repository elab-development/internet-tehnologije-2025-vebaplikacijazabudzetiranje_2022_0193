import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/utils/api-error';

/**
 * GET /api/admin/users
 * Lista svih korisnika (samo ADMIN)
 */
export async function GET(req: NextRequest) {
  try {
    // Provera admin permisija
    const authCheck = await requireAdmin(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Admin je autorizovan - vrati sve korisnike
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            ownedGroups: true,
            memberships: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}