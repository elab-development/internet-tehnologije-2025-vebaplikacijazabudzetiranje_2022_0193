import { SupportedCurrency, CURRENCY_SYMBOLS } from './types';
import { getExchangeRate } from './api';

/**
 * Currency conversion utilities
 */

/**
 * Convert amount from one currency to another
 */
export async function convertAmount(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency
): Promise<number> {
  if (from === to) {
    return amount;
  }

  const rate = await getExchangeRate(from, to);
  return amount * rate;
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency,
  options: {
    decimals?: number;
    showSymbol?: boolean;
    showCode?: boolean;
  } = {}
): string {
  const {
    decimals = 2,
    showSymbol = true,
    showCode = false,
  } = options;

  const formatted = amount.toFixed(decimals);
  const symbol = CURRENCY_SYMBOLS[currency];

  if (showSymbol && showCode) {
    return `${symbol}${formatted} ${currency}`;
  }

  if (showSymbol) {
    return `${symbol}${formatted}`;
  }

  if (showCode) {
    return `${formatted} ${currency}`;
  }

  return formatted;
}

/**
 * Convert and format amount
 */
export async function convertAndFormat(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  options?: {
    decimals?: number;
    showSymbol?: boolean;
    showCode?: boolean;
  }
): Promise<string> {
  const converted = await convertAmount(amount, from, to);
  return formatCurrency(converted, to, options);
}

/**
 * Batch convert multiple amounts
 */
export async function batchConvert(
  amounts: Array<{ amount: number; from: SupportedCurrency }>,
  to: SupportedCurrency
): Promise<number[]> {
  const promises = amounts.map((item) =>
    convertAmount(item.amount, item.from, to)
  );

  return Promise.all(promises);
}

/**
 * Get conversion rate with formatting
 */
export async function getFormattedRate(
  from: SupportedCurrency,
  to: SupportedCurrency
): Promise<string> {
  const rate = await getExchangeRate(from, to);
  return `1 ${from} = ${rate.toFixed(4)} ${to}`;
}
