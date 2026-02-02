import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { createExpenseSchema } from '@/lib/validations/expense';

/**
 * GET /api/expenses?groupId=xxx
 * Lista troškova u grupi
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

    if (!groupId) {
      return createErrorResponse('Group ID is required', 400);
    }

    // Proveri da li je korisnik član grupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        isPending: false,
      },
    });

    if (!membership) {
      return createErrorResponse('Forbidden - Not a group member', 403);
    }

    // Pronađi sve troškove u grupi
    const expenses = await prisma.expense.findMany({
      where: {
        groupId,
      },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
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
    });

    return NextResponse.json({
      expenses,
      total: expenses.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/expenses
 * Kreiranje novog troška
 */
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Validacija input-a
    const body = await req.json();
    const validatedData = createExpenseSchema.parse(body);

    // Proveri da li je korisnik član grupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: validatedData.groupId,
        userId: user.id,
        isPending: false,
      },
    });

    if (!membership) {
      return createErrorResponse('Forbidden - Not a group member', 403);
    }

    // Validacija: suma splits mora biti jednaka amount
    const totalSplits = validatedData.splits.reduce(
      (sum, split) => sum + split.amount,
      0
    );

    if (Math.abs(totalSplits - validatedData.amount) > 0.01) {
      return createErrorResponse(
        `Split amounts (${totalSplits}) must equal total amount (${validatedData.amount})`,
        400
      );
    }

    // Validacija: svi korisnici u splits moraju biti članovi grupe
    const memberIds = await prisma.groupMember.findMany({
      where: {
        groupId: validatedData.groupId,
        isPending: false,
      },
      select: {
        userId: true,
      },
    });

    const validMemberIds = memberIds.map((m) => m.userId);
    const invalidSplits = validatedData.splits.filter(
      (split) => !validMemberIds.includes(split.userId)
    );

    if (invalidSplits.length > 0) {
      return createErrorResponse(
        'All split users must be group members',
        400
      );
    }

    // Kreiraj trošak sa splits-ovima
    const expense = await prisma.expense.create({
      data: {
        groupId: validatedData.groupId,
        payerId: user.id,
        description: validatedData.description,
        amount: validatedData.amount,
        category: validatedData.category,
        date: validatedData.date,
        splits: {
          create: validatedData.splits.map((split) => ({
            userId: split.userId,
            amount: split.amount,
          })),
        },
      },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
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
    });

    return NextResponse.json(
      {
        message: 'Expense created successfully',
        expense,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}