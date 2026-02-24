import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get expense reports and analytics
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Filter by specific group (optional)
 *     responses:
 *       200:
 *         description: Report data with analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalExpenses:
 *                   type: number
 *                 count:
 *                   type: number
 *                 byCategory:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 byMonth:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 topExpenses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 byUser:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;
    const searchParams = req.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');

    // Build where clause - only get expenses from user's groups
    const where: any = {
      group: {
        members: {
          some: {
            userId: user.id,
            isPending: false,
          },
        },
      },
    };

    // If groupId specified, validate it and add to where clause
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      });

      if (!group || group.members.length === 0) {
        return createErrorResponse('Group not found or you are not a member', 404);
      }

      where.groupId = groupId;
    }

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        payer: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate by category
    const byCategory: Record<string, number> = {};
    expenses.forEach((exp) => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + Number(exp.amount);
    });

    // Calculate by month
    const byMonth: Record<string, number> = {};
    expenses.forEach((exp) => {
      const month = exp.date.toISOString().slice(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + Number(exp.amount);
    });

    // Top expenses
    const topExpenses = expenses
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10)
      .map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: Number(exp.amount),
        category: exp.category,
        date: exp.date,
        payer: exp.payer.name,
        group: exp.group.name,
      }));

    // By user (payer)
    const byUser: Record<string, number> = {};
    expenses.forEach((exp) => {
      byUser[exp.payer.name] = (byUser[exp.payer.name] || 0) + Number(exp.amount);
    });

    return NextResponse.json(
      {
        totalExpenses: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
        count: expenses.length,
        byCategory,
        byMonth,
        topExpenses,
        byUser,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
