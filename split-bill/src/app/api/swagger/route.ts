import { NextResponse } from 'next/server';
import { generateSwaggerSpec } from '@/lib/swagger';

/**
 * GET /api/swagger
 * Returns OpenAPI specification as JSON
 */
export async function GET() {
  const spec = generateSwaggerSpec();

  return NextResponse.json(spec, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
