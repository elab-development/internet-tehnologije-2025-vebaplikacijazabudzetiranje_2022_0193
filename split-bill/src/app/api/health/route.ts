import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/health
 * Health check endpoint za monitoring i Docker healthcheck
 */
export async function GET() {
  try {
    // Proveri konekciju sa bazom
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
