import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';

/**
 * @swagger
 * /api/groups/{id}/archive:
 *   patch:
 *     tags:
 *       - Groups
 *     summary: Archive or unarchive group
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group archived/unarchived successfully
 *       403:
 *         description: Only group owner can archive
 *       404:
 *         description: Group not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function PATCH(
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

    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return createErrorResponse('Group not found', 404);
    }

    if (group.ownerId !== user.id) {
      return createErrorResponse('Only group owner can archive', 403);
    }

    const updated = await prisma.group.update({
      where: { id },
      data: { isArchived: !group.isArchived },
    });

    return NextResponse.json({
      message: `Group ${updated.isArchived ? 'archived' : 'unarchived'} successfully`,
      group: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
