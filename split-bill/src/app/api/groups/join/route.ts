import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { z } from 'zod';

const joinGroupSchema = z.object({
  inviteCode: z.string().min(1),
});

/**
 * @swagger
 * /api/groups/join:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Join group via invite code
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined group
 *       400:
 *         description: Invalid invite code or already a member
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Group not found
 */
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;
    const body = await req.json();
    const { inviteCode } = joinGroupSchema.parse(body);

    // Find group by invite code
    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!group) {
      return createErrorResponse('Invalid invite code', 404);
    }

    // Check if already a member
    if (group.members.length > 0) {
      return createErrorResponse('You are already a member of this group', 400);
    }

    // Add user as member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        isPending: false,
      },
    });

    return NextResponse.json({
      message: 'Successfully joined group',
      groupId: group.id,
      groupName: group.name,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
