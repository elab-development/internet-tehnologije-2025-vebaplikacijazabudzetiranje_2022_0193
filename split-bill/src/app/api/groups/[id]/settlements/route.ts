import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { validateGroupAccess } from '@/lib/security/idor';
import { sanitizeObject } from '@/lib/security/sanitize';
import { sendSettlementEmail } from '@/lib/email/send';
import { z } from 'zod';

/**
 * Validation schema za settlement
 */
const settlementSchema = z.object({
  toUserId: z.string().min(1, 'To user ID is required'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999.99, 'Amount too large'),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  comment: z.string().max(500).optional(),
});

/**
 * POST /api/groups/[id]/settlements
 * Record a debt settlement between two group members
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = authCheck.user;
    const { id: groupId } = await context.params;

    // Validate group access
    const hasAccess = await validateGroupAccess(user.id, groupId);
    if (!hasAccess) {
      return createErrorResponse('Forbidden - Not a group member', 403);
    }

    // Parse and validate input
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const validatedData = settlementSchema.parse(sanitizedBody);

    // Validate that toUserId is a different user
    if (validatedData.toUserId === user.id) {
      return createErrorResponse('Cannot settle debt with yourself', 400);
    }

    // Validate that toUserId is a member of the group
    const toUserMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: validatedData.toUserId,
        isPending: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!toUserMembership) {
      return createErrorResponse(
        'To user must be a member of this group',
        400
      );
    }

    // Create settlement record
    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId: user.id,
        toUserId: validatedData.toUserId,
        amount: validatedData.amount,
        date: validatedData.date,
        comment: validatedData.comment,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        toUser: {
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
      },
    });

    // Send email notification to creditor (non-blocking)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    sendSettlementEmail(toUserMembership.user.email, {
      recipientName: toUserMembership.user.name,
      payerName: user.name || 'A user',
      amount: `$${validatedData.amount.toFixed(2)}`,
      comment: validatedData.comment,
      groupName: settlement.group.name,
      date: validatedData.date.toISOString().split('T')[0],
      groupUrl: `${baseUrl}/groups/${groupId}`,
    }).catch((err) => {
      console.error('Failed to send settlement notification email:', err);
    });

    return NextResponse.json(
      {
        message: 'Settlement recorded successfully',
        settlement,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
