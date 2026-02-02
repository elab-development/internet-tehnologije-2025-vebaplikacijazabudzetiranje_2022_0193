import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { updateExpenseSchema } from '@/lib/validations/expense';

/**
 * GET /api/expenses/[id]
 * Detalji pojedinačnog troška
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAuth(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Pronađi trošak
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
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
                email: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      return createErrorResponse('Expense not found', 404);
    }

    // Proveri da li je korisnik član grupe
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId: expense.groupId,
        userId: user.id,
        isPending: false,
      },
    });

    if (!isMember) {
      return createErrorResponse('Forbidden - Not a group member', 403);
    }

    return NextResponse.json({ expense });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/expenses/[id]
 * Ažuriranje troška (samo kreator ili vlasnik grupe)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAuth(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Pronađi trošak
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!expense) {
      return createErrorResponse('Expense not found', 404);
    }

    // Proveri permisije: kreator troška ili vlasnik grupe
    const isCreator = expense.payerId === user.id;
    const isGroupOwner = expense.group.ownerId === user.id;

    if (!isCreator && !isGroupOwner) {
      return createErrorResponse(
        'Forbidden - Only expense creator or group owner can update',
        403
      );
    }

    // Validacija input-a
    const body = await req.json();
    const validatedData = updateExpenseSchema.parse(body);

    // Ažuriraj trošak
    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        payer: {
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
    });

    return NextResponse.json({
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/expenses/[id]
 * Brisanje troška (samo kreator ili vlasnik grupe)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAuth(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Pronađi trošak
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!expense) {
      return createErrorResponse('Expense not found', 404);
    }

    // Proveri permisije
    const isCreator = expense.payerId === user.id;
    const isGroupOwner = expense.group.ownerId === user.id;

    if (!isCreator && !isGroupOwner) {
      return createErrorResponse(
        'Forbidden - Only expense creator or group owner can delete',
        403
      );
    }

    // Obriši trošak (CASCADE će obrisati splits)
    await prisma.expense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}