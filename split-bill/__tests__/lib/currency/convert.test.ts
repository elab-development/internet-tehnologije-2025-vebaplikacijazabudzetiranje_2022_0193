import { describe, it, expect } from '@jest/globals';
import { convertAmount, formatCurrency } from '@/lib/currency/convert';
import { SupportedCurrency } from '@/lib/currency/types';

// Mock API
jest.mock('@/lib/currency/api', () => ({
  getExchangeRate: jest.fn((from: string, to: string) => {
    if (from === to) return Promise.resolve(1);
    if (from === 'USD' && to === 'EUR') return Promise.resolve(0.92);
    if (from === 'USD' && to === 'GBP') return Promise.resolve(0.79);
    if (from === 'USD' && to === 'RSD') return Promise.resolve(107.5);
    return Promise.resolve(1);
  }),
}));

describe('Currency Conversion', () => {
  describe('convertAmount', () => {
    it('should return same amount for same currency', async () => {
      const result = await convertAmount(100, SupportedCurrency.USD, SupportedCurrency.USD);
      expect(result).toBe(100);
    });

    it('should convert USD to EUR', async () => {
      const result = await convertAmount(100, SupportedCurrency.USD, SupportedCurrency.EUR);
      expect(result).toBe(92);
    });

    it('should convert USD to GBP', async () => {
      const result = await convertAmount(100, SupportedCurrency.USD, SupportedCurrency.GBP);
      expect(result).toBe(79);
    });

    it('should convert USD to RSD', async () => {
      const result = await convertAmount(100, SupportedCurrency.USD, SupportedCurrency.RSD);
      expect(result).toBe(10750);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD with symbol', () => {
      const result = formatCurrency(100, SupportedCurrency.USD);
      expect(result).toBe('$100.00');
    });

    it('should format EUR with symbol', () => {
      const result = formatCurrency(100, SupportedCurrency.EUR);
      expect(result).toBe('€100.00');
    });

    it('should format with custom decimals', () => {
      const result = formatCurrency(100.123, SupportedCurrency.USD, { decimals: 3 });
      expect(result).toBe('$100.123');
    });

    it('should format without symbol', () => {
      const result = formatCurrency(100, SupportedCurrency.USD, { showSymbol: false });
      expect(result).toBe('100.00');
    });

    it('should format with code', () => {
      const result = formatCurrency(100, SupportedCurrency.USD, { showCode: true });
      expect(result).toBe('$100.00 USD');
    });
  });
});
