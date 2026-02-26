import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireEditor } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/utils/api-error';
import { createGroupSchema } from '@/lib/validations/group';
import { sanitizeObject } from '@/lib/security/sanitize';

/**
 * @swagger
 * /api/groups:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get all groups for current user
 *     description: Returns a list of all groups where the user is a member
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *                 total:
 *                   type: integer
 *                   example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   post:
 *     tags:
 *       - Groups
 *     summary: Create a new group
 *     description: Creates a new group (requires EDITOR or ADMIN role)
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupInput'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group created successfully
 *                 group:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * GET /api/groups
 * Lista svih grupa korisnika
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
export async function POST(req: NextRequest) {
  try {
    // Provera da li je korisnik EDITOR ili ADMIN
    const authCheck = await requireEditor(req);

    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // Parse i sanitize input
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);

    // Validacija input-a
    const validatedData = createGroupSchema.parse(sanitizedBody);

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
        members: {
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
        _count: {
          select: {
            members: true,
            expenses: true,
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