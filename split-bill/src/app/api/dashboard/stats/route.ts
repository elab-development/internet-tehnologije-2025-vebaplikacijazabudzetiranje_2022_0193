import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/utils/api-error';

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBalance:
 *                   type: number
 *                 totalOwed:
 *                   type: number
 *                 totalOwing:
 *                   type: number
 *                 groupsCount:
 *                   type: number
 *                 expensesCount:
 *                   type: number
 *                 membersCount:
 *                   type: number
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

    // Get user's groups
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            isPending: false,
          },
        },
      },
      include: {
        _count: {
          select: {
            expenses: true,
            members: true,
          },
        },
      },
    });

    // Calculate total balance
    let totalOwed = 0;
    let totalOwing = 0;

    for (const group of groups) {
      const expenses = await prisma.expense.findMany({
        where: { groupId: group.id },
        include: {
          splits: {
            where: { userId: user.id },
          },
        },
      });

      expenses.forEach((expense) => {
        if (expense.payerId === user.id) {
          // User paid
          totalOwed += Number(expense.amount);
        }
        expense.splits.forEach((split) => {
          // User owes
          totalOwing += Number(split.amount);
        });
      });
    }

    const netBalance = totalOwed - totalOwing;

    return NextResponse.json(
      {
        totalBalance: Math.round(netBalance * 100) / 100,
        totalOwed: Math.round(totalOwed * 100) / 100,
        totalOwing: Math.round(totalOwing * 100) / 100,
        groupsCount: groups.length,
        expensesCount: groups.reduce((sum, g) => sum + g._count.expenses, 0),
        membersCount: groups.reduce((sum, g) => sum + g._count.members, 0),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
