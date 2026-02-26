import { CachedRates, ExchangeRates } from './types';

/**
 * In-memory cache for exchange rates
 * In production, use Redis or similar
 */

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

class RatesCache {
  private cache: Map<string, CachedRates> = new Map();

  /**
   * Get cached rates for a base currency
   */
  get(base: string): ExchangeRates | null {
    const cached = this.cache.get(base);

    if (!cached) {
      return null;
    }

    // Check if cache expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(base);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached rates
   */
  set(base: string, data: ExchangeRates): void {
    const cached: CachedRates = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };

    this.cache.set(base, cached);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const ratesCache = new RatesCache();
