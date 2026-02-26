import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS Configuration
 */
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-CSRF-Token',
  'X-Requested-With',
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // Allow all origins in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * CORS Middleware
 * Dodaje CORS headers u response
 */
export function corsMiddleware(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin');

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
    res.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
    res.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }

  return res;
}

/**
 * Create CORS headers for API responses
 */
export function createCorsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get('origin');
  const headers: HeadersInit = {};

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest(req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');

  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
