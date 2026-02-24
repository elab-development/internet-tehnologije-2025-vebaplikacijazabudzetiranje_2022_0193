import { ExchangeRates, SupportedCurrency } from './types';
import { ratesCache } from './cache';

/**
 * ExchangeRate-API integration
 * Free tier: 1,500 requests/month
 * API: https://www.exchangerate-api.com/
 */

const API_BASE_URL =
  process.env.EXCHANGE_RATE_API_URL ||
  'https://api.exchangerate-api.com/v4/latest';

/**
 * Fetch exchange rates from API
 */
async function fetchRatesFromAPI(base: string): Promise<ExchangeRates> {
  const url = `${API_BASE_URL}/${base}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      base: data.base,
      date: data.date,
      rates: data.rates,
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
}

/**
 * Get exchange rates with caching
 */
export async function getExchangeRates(
  base: SupportedCurrency = SupportedCurrency.USD
): Promise<ExchangeRates> {
  // Check cache first
  const cached = ratesCache.get(base);
  if (cached) {
    console.log(`💰 Using cached rates for ${base}`);
    return cached;
  }

  // Fetch from API
  console.log(`💰 Fetching fresh rates for ${base}`);
  const rates = await fetchRatesFromAPI(base);

  // Cache the result
  ratesCache.set(base, rates);

  return rates;
}

/**
 * Get specific exchange rate
 */
export async function getExchangeRate(
  from: SupportedCurrency,
  to: SupportedCurrency
): Promise<number> {
  if (from === to) {
    return 1;
  }

  const rates = await getExchangeRates(from);

  if (!rates.rates[to]) {
    throw new Error(`Exchange rate not available for ${from} to ${to}`);
  }

  return rates.rates[to];
}

/**
 * Check if API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetchRatesFromAPI('USD');
    return true;
  } catch {
    return false;
  }
}
