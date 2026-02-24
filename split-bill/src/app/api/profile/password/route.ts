import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

/**
 * @swagger
 * /api/profile/password:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Change user password
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 description: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password or validation error
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: authCheck.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return createErrorResponse('Current password is incorrect', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: authCheck.user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
