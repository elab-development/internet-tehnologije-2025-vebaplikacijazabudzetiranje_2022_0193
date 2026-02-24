import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory store za rate limiting
 * U produkciji koristiti Redis
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate Limiter Configuration
 */
export interface RateLimitConfig {
  /**
   * Maksimalan broj zahteva
   */
  max: number;

  /**
   * Vremenski prozor u milisekundama
   */
  windowMs: number;

  /**
   * Poruka koja se vraća kada se prekorači limit
   */
  message?: string;

  /**
   * Status kod koji se vraća
   */
  statusCode?: number;
}

/**
 * Default konfiguracija
 */
const defaultConfig: RateLimitConfig = {
  max: 100, // 100 zahteva
  windowMs: 15 * 60 * 1000, // 15 minuta
  message: 'Too many requests, please try again later.',
  statusCode: 429,
};

/**
 * Get client identifier (IP adresa)
 */
function getClientId(req: NextRequest): string {
  // Proveri X-Forwarded-For header (ako je iza proxy-ja)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Proveri X-Real-IP header
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback na remote address
  return req.ip || 'unknown';
}

/**
 * Clean expired entries from store
 */
function cleanStore() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Rate Limiter Middleware
 */
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const clientId = getClientId(req);
    const now = Date.now();

    // Clean expired entries periodically
    if (Math.random() < 0.01) {
      cleanStore();
    }

    // Initialize or get existing record
    if (!store[clientId] || store[clientId].resetTime < now) {
      store[clientId] = {
        count: 0,
        resetTime: now + options.windowMs,
      };
    }

    // Increment counter
    store[clientId].count++;

    // Check if limit exceeded
    if (store[clientId].count > options.max) {
      const resetTime = new Date(store[clientId].resetTime).toISOString();

      return NextResponse.json(
        {
          error: options.message,
          retryAfter: Math.ceil((store[clientId].resetTime - now) / 1000),
          resetTime,
        },
        {
          status: options.statusCode,
          headers: {
            'X-RateLimit-Limit': options.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': store[clientId].resetTime.toString(),
            'Retry-After': Math.ceil((store[clientId].resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const remaining = options.max - store[clientId].count;

    return null; // Continue to next middleware
  };
}

/**
 * Strict rate limiter for sensitive endpoints (login, register)
 */
export const strictRateLimit = rateLimit({
  max: 5, // 5 zahteva
  windowMs: 15 * 60 * 1000, // 15 minuta
  message: 'Too many attempts, please try again in 15 minutes.',
});

/**
 * Standard rate limiter for API endpoints
 */
export const apiRateLimit = rateLimit({
  max: 100, // 100 zahteva
  windowMs: 15 * 60 * 1000, // 15 minuta
});

/**
 * Lenient rate limiter for public endpoints
 */
export const publicRateLimit = rateLimit({
  max: 300, // 300 zahteva
  windowMs: 15 * 60 * 1000, // 15 minuta
});
