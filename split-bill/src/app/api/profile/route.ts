import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { sanitizeObject } from '@/lib/security/sanitize';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get current user profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *
 *   delete:
 *     tags:
 *       - Profile
 *     summary: Delete user account
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: authCheck.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
        preferredCurrency: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            ownedGroups: true,
            memberships: true,
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await req.json();
    const sanitized = sanitizeObject(body);
    const validated = updateProfileSchema.parse(sanitized);

    const updated = await prisma.user.update({
      where: { id: authCheck.user.id },
      data: validated,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    await prisma.user.delete({
      where: { id: authCheck.user.id },
    });

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
