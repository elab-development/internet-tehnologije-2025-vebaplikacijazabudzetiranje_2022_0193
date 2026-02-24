'use client';

import { useState, useEffect } from 'react';
import { SupportedCurrency } from '@/lib/currency/types';

interface UseCurrencyReturn {
  preferredCurrency: SupportedCurrency;
  isLoading: boolean;
  error: string | null;
  updateCurrency: (currency: SupportedCurrency) => Promise<void>;
}

/**
 * Hook for managing user's currency preference
 */
export function useCurrency(): UseCurrencyReturn {
  const [preferredCurrency, setPreferredCurrency] = useState<SupportedCurrency>(
    SupportedCurrency.USD
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's currency preference
  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/profile/currency');

      if (!response.ok) {
        throw new Error('Failed to fetch currency preference');
      }

      const data = await response.json();
      setPreferredCurrency(data.currency);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrency = async (currency: SupportedCurrency) => {
    try {
      setError(null);

      const response = await fetch('/api/profile/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency }),
      });

      if (!response.ok) {
        throw new Error('Failed to update currency preference');
      }

      setPreferredCurrency(currency);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    preferredCurrency,
    isLoading,
    error,
    updateCurrency,
  };
}

/**
 * Hook for converting amounts
 */
export function useCurrencyConverter() {
  const [isConverting, setIsConverting] = useState(false);

  const convert = async (
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency
  ): Promise<number | null> => {
    if (from === to) return amount;

    try {
      setIsConverting(true);

      const response = await fetch(
        `/api/currency/convert?amount=${amount}&from=${from}&to=${to}`
      );

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data = await response.json();
      return data.converted;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  return { convert, isConverting };
}
