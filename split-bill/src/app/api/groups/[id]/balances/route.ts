import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { validateGroupAccess } from '@/lib/security/idor';
import { getOptimizedDebts, getBalanceSummary } from '@/lib/calculations/optimize-debts';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';

/**
 * @swagger
 * /api/groups/{id}/balances:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get group balances and optimized debts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group balances and optimized debts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balances:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       balance:
 *                         type: number
 *                 optimizedDebts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       from:
 *                         type: string
 *                       fromName:
 *                         type: string
 *                       to:
 *                         type: string
 *                       toName:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalDebts:
 *                       type: number
 *                     totalSettled:
 *                       type: number
 *                     unsettledAmount:
 *                       type: number
 *                     transactionsNeeded:
 *                       type: number
 *       403:
 *         description: Not a group member
 *       404:
 *         description: Group not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function GET(
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

    // Validate access
    const hasAccess = await validateGroupAccess(user.id, id);
    if (!hasAccess) {
      return createErrorResponse('Forbidden - Not a group member', 403);
    }

    // Calculate balances and optimized debts
    const { balances, optimizedDebts } = await getOptimizedDebts(id);
    const summary = await getBalanceSummary(id);

    return NextResponse.json(
      {
        balances,
        optimizedDebts,
        summary,
      },
      {
        headers: {
          'Cache-Control': 'no-cache', // Don't cache balance data
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
