import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { createExpenseSchema } from '@/lib/validations/expense';
import { validateGroupAccess } from '@/lib/security/idor';
import { sanitizeObject } from '@/lib/security/sanitize';
import { sendBulkEmails } from '@/lib/email/send';

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     tags:
 *       - Expenses
 *     summary: Get expenses for a group
 *     description: Returns a list of all expenses in a specific group
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: Group ID to filter expenses
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 total:
 *                   type: integer
 *                   example: 15
 *       400:
 *         description: Group ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a group member
 *
 *   post:
 *     tags:
 *       - Expenses
 *     summary: Create a new expense
 *     description: Creates a new expense in a group with splits
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseInput'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense created successfully
 *                 expense:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation error or split amounts don't match total
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a group member
 */

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

    // Parse i sanitize input
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);

    // Validacija input-a
    const validatedData = createExpenseSchema.parse(sanitizedBody);

    // IDOR Protection: Proveri pristup grupi
    const hasAccess = await validateGroupAccess(user.id, validatedData.groupId);
    if (!hasAccess) {
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
        group: {
          select: {
            name: true,
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

    // Wire email notifications (non-blocking)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const emailPayloads = expense.splits
      .filter((split) => split.userId !== user.id) // ne slati platiocu
      .map((split) => ({
        to: split.user.email,
        data: {
          recipientName: split.user.name,
          payerName: expense.payer.name,
          groupName: expense.group.name,
          expenseDescription: expense.description,
          totalAmount: `$${expense.amount}`,
          yourShare: `$${split.amount}`,
          category: expense.category,
          date: expense.date.toISOString().split('T')[0],
          groupUrl: `${baseUrl}/groups/${validatedData.groupId}`,
        },
      }));

    // Send emails without awaiting to not block response
    if (emailPayloads.length > 0) {
      sendBulkEmails(emailPayloads).catch((err) => {
        console.error('Failed to send expense notification emails:', err);
      });
    }

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