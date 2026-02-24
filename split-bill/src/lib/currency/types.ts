/**
 * Currency types and interfaces
 */

export enum SupportedCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  RSD = 'RSD',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CHF = 'CHF',
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CachedRates {
  data: ExchangeRates;
  timestamp: number;
  expiresAt: number;
}

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RSD: 'RSD',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
};

export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  RSD: 'Serbian Dinar',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
};
