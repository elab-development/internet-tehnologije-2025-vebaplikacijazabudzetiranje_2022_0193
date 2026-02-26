import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { SupportedCurrency } from '@/lib/currency/types';
import { z } from 'zod';

const updateCurrencySchema = z.object({
  currency: z.nativeEnum(SupportedCurrency),
});

/**
 * @swagger
 * /api/profile/currency:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user's currency preference
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User's preferred currency
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   example: USD
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update user's currency preference
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, RSD, JPY, CAD, AUD, CHF]
 *     responses:
 *       200:
 *         description: Currency preference updated
 *       400:
 *         description: Invalid currency code
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: authCheck.user.id },
      select: { preferredCurrency: true },
    });

    return NextResponse.json({
      currency: user?.preferredCurrency || 'USD',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await req.json();
    const validatedData = updateCurrencySchema.parse(body);

    await prisma.user.update({
      where: { id: authCheck.user.id },
      data: { preferredCurrency: validatedData.currency },
    });

    return NextResponse.json({
      message: 'Currency preference updated successfully',
      currency: validatedData.currency,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
