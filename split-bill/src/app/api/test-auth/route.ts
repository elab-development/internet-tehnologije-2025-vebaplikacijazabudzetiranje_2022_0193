import { NextResponse } from 'next/server';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

/**
 * Test API ruta za proveru autentifikacije
 * GET /api/test-auth
 */
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    const user = await getCurrentUser();

    return NextResponse.json({
      authenticated,
      user: user || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}