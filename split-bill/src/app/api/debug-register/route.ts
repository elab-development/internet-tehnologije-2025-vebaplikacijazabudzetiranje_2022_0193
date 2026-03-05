import { NextRequest, NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT — remove after diagnosing the 405 issue on Vercel.
 * Tests: (1) Vercel recognizes this route, (2) env vars are present,
 * (3) POST method works.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    method: 'GET',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DOCKER_BUILD: process.env.DOCKER_BUILD ?? '(not set)',
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? '(not set)',
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasResendKey: !!process.env.RESEND_API_KEY,
      CORS_ORIGINS: process.env.CORS_ORIGINS ?? '(not set)',
    },
  });
}

export async function POST(req: NextRequest) {
  console.log('[debug-register] POST received');
  console.log('[debug-register] method:', req.method);
  console.log('[debug-register] url:', req.url);
  console.log('[debug-register] headers:', Object.fromEntries(req.headers.entries()));

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = '(could not parse JSON body)';
  }

  console.log('[debug-register] body:', body);

  return NextResponse.json({
    ok: true,
    method: 'POST',
    timestamp: new Date().toISOString(),
    receivedBody: body,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DOCKER_BUILD: process.env.DOCKER_BUILD ?? '(not set)',
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  });
}
