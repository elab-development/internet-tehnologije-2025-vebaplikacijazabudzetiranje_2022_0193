import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireEditor } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { z } from 'zod';

/**
 * GET /api/groups
 * Lista grupa korisnika (autentifikovani korisnici)
 */
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Pronađi sve grupe gde je korisnik član
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      groups,
      total: groups.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/groups
 * Kreiranje nove grupe (EDITOR ili ADMIN)
 */
const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // Provera da li je korisnik EDITOR ili ADMIN
    const authCheck = await requireEditor(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Validacija input-a
    const body = await req.json();
    const validatedData = createGroupSchema.parse(body);

    // Kreiraj grupu
    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            isPending: false,
          },
        },
      },
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
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Group created successfully',
        group,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}