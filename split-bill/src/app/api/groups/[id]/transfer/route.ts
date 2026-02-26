import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { z } from 'zod';

const transferSchema = z.object({
  newOwnerId: z.string().min(1),
});

/**
 * @swagger
 * /api/groups/{id}/transfer:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Transfer group ownership
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *       400:
 *         description: New owner must be a group member
 *       403:
 *         description: Only current owner can transfer ownership
 *       404:
 *         description: Group not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;
    const { id } = await context.params;
    const body = await req.json();
    const { newOwnerId } = transferSchema.parse(body);

    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return createErrorResponse('Group not found', 404);
    }

    if (group.ownerId !== user.id) {
      return createErrorResponse('Only current owner can transfer ownership', 403);
    }

    // Check if new owner is a member
    const newOwnerMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: newOwnerId,
        isPending: false,
      },
    });

    if (!newOwnerMembership) {
      return createErrorResponse('New owner must be a group member', 400);
    }

    const updated = await prisma.group.update({
      where: { id },
      data: { ownerId: newOwnerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Ownership transferred successfully',
      group: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
