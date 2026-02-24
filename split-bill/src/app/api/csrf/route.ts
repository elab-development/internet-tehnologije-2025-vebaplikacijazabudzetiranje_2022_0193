import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfTokenCookie } from '@/lib/security/csrf';

/**
 * @swagger
 * /api/csrf:
 *   get:
 *     tags:
 *       - Utility
 *     summary: Get CSRF token
 *     description: Generates and returns a CSRF token for state-changing operations
 *     responses:
 *       200:
 *         description: CSRF token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
 *         headers:
 *           Set-Cookie:
 *             description: CSRF token cookie
 *             schema:
 *               type: string
 *               example: csrf-token=a1b2c3d4...; HttpOnly; Secure; SameSite=Strict
 */

/**
 * GET /api/csrf
 * Generiše i vraća CSRF token
 */
export async function GET() {
  const token = generateCsrfToken();

  const response = NextResponse.json({
    csrfToken: token,
  });

  // Postavi token u cookie
  setCsrfTokenCookie(response, token);

  return response;
}
