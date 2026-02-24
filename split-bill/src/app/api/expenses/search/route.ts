import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/utils/api-error';
import { ExpenseCategory } from '@prisma/client';

/**
 * @swagger
 * /api/expenses/search:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Search and filter expenses
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (description)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, BILLS, OTHER]
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: Search results
 */
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') as ExpenseCategory | null;
    const groupId = searchParams.get('groupId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause - only user's groups
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

    // Text search
    if (query) {
      where.description = {
        contains: query,
        mode: 'insensitive',
      };
    }

    // Category filter
    if (category && Object.values(ExpenseCategory).includes(category)) {
      where.category = category;
    }

    // Group filter
    if (groupId) {
      where.groupId = groupId;
    }

    // Date range filter
    if (from || to) {
      where.date = {};
      if (from) {
        where.date.gte = new Date(from);
      }
      if (to) {
        where.date.lte = new Date(to);
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount);
      }
    }

    // Execute query with parallel counting
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          payer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json(
      {
        expenses,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      {
        headers: {
          'Cache-Control': 'no-cache', // Don't cache search results
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
