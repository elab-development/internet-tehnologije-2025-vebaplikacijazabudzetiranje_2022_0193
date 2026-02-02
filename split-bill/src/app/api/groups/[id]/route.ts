import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { updateGroupSchema } from '@/lib/validations/group';

/**
 * GET /api/groups/[id]
 * Detalji pojedinačne grupe
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

    // Pronađi grupu
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          where: {
            isPending: false,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        expenses: {
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
          orderBy: {
            date: 'desc',
          },
        },
        _count: {
          select: {
            members: true,
            expenses: true,
            settlements: true,
          },
        },
      },
    });

    if (!group) {
      return createErrorResponse('Group not found', 404);
    }

    // Proveri da li je korisnik član grupe
    const isMember = group.members.some((m) => m.userId === user.id);

    if (!isMember) {
      return createErrorResponse('Forbidden - Not a group member', 403);
    }

    return NextResponse.json({ group });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/groups/[id]
 * Ažuriranje grupe (samo vlasnik)
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

    // Pronađi grupu
    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (!group) {
      return createErrorResponse('Group not found', 404);
    }

    // Proveri da li je korisnik vlasnik grupe
    if (group.ownerId !== user.id) {
      return createErrorResponse(
        'Forbidden - Only group owner can update group',
        403
      );
    }

    // Validacija input-a
    const body = await req.json();
    const validatedData = updateGroupSchema.parse(body);

    // Ažuriraj grupu
    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            expenses: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Group updated successfully',
      group: updatedGroup,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/groups/[id]
 * Brisanje grupe (samo vlasnik)
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

    // Pronađi grupu
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!group) {
      return createErrorResponse('Group not found', 404);
    }

    // Proveri da li je korisnik vlasnik grupe
    if (group.ownerId !== user.id) {
      return createErrorResponse(
        'Forbidden - Only group owner can delete group',
        403
      );
    }

    // Obriši grupu (CASCADE će obrisati members, expenses, splits, settlements)
    await prisma.group.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Group deleted successfully',
      deletedExpenses: group._count.expenses,
    });
  } catch (error) {
    return handleApiError(error);
  }
}