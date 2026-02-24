import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates } from '@/lib/currency';
import { SupportedCurrency } from '@/lib/currency/types';
import { handleApiError } from '@/lib/utils/api-error';

/**
 * @swagger
 * /api/currency/rates:
 *   get:
 *     tags:
 *       - Currency
 *     summary: Get exchange rates
 *     description: Returns current exchange rates for a base currency
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           enum: [USD, EUR, GBP, RSD, JPY, CAD, AUD, CHF]
 *           default: USD
 *         description: Base currency
 *     responses:
 *       200:
 *         description: Exchange rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 base:
 *                   type: string
 *                   example: USD
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: 2024-01-20
 *                 rates:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                   example:
 *                     EUR: 0.92
 *                     GBP: 0.79
 *                     RSD: 107.50
 *       400:
 *         description: Invalid currency code
 *       503:
 *         description: Exchange rate API unavailable
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const base = searchParams.get('base') || 'USD';

    // Validate currency code
    if (!Object.values(SupportedCurrency).includes(base as SupportedCurrency)) {
      return NextResponse.json(
        { error: 'Invalid currency code' },
        { status: 400 }
      );
    }

    const rates = await getExchangeRates(base as SupportedCurrency);

    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
