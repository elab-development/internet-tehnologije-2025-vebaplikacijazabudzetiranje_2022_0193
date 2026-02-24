import { NextRequest, NextResponse } from 'next/server';
import { convertAmount } from '@/lib/currency';
import { SupportedCurrency } from '@/lib/currency/types';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';

/**
 * @swagger
 * /api/currency/convert:
 *   get:
 *     tags:
 *       - Currency
 *     summary: Convert currency
 *     description: Convert amount from one currency to another
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Amount to convert
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           enum: [USD, EUR, GBP, RSD, JPY, CAD, AUD, CHF]
 *         description: Source currency
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           enum: [USD, EUR, GBP, RSD, JPY, CAD, AUD, CHF]
 *         description: Target currency
 *     responses:
 *       200:
 *         description: Converted amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                   example: 100
 *                 from:
 *                   type: string
 *                   example: USD
 *                 to:
 *                   type: string
 *                   example: EUR
 *                 converted:
 *                   type: number
 *                   example: 92.15
 *                 rate:
 *                   type: number
 *                   example: 0.9215
 *       400:
 *         description: Invalid parameters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const amountStr = searchParams.get('amount');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Validate parameters
    if (!amountStr || !from || !to) {
      return createErrorResponse('Missing required parameters', 400);
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      return createErrorResponse('Invalid amount', 400);
    }

    // Validate currency codes
    if (
      !Object.values(SupportedCurrency).includes(from as SupportedCurrency) ||
      !Object.values(SupportedCurrency).includes(to as SupportedCurrency)
    ) {
      return createErrorResponse('Invalid currency code', 400);
    }

    // Convert
    const converted = await convertAmount(
      amount,
      from as SupportedCurrency,
      to as SupportedCurrency
    );

    const rate = from === to ? 1 : converted / amount;

    return NextResponse.json(
      {
        amount,
        from,
        to,
        converted: parseFloat(converted.toFixed(2)),
        rate: parseFloat(rate.toFixed(4)),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
