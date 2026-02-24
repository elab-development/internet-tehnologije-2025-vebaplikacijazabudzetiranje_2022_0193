'use client';

import { useState } from 'react';
import { SupportedCurrency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/lib/currency/types';

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onChange: (currency: SupportedCurrency) => void;
  disabled?: boolean;
}

export function CurrencySelector({ value, onChange, disabled }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currencies = Object.values(SupportedCurrency);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{CURRENCY_SYMBOLS[value]}</span>
            <span className="font-medium">{value}</span>
            <span className="text-sm text-gray-500">- {CURRENCY_NAMES[value]}</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => {
                  onChange(currency);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  value === currency ? 'bg-primary-50 text-primary-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CURRENCY_SYMBOLS[currency]}</span>
                  <div>
                    <div className="font-medium">{currency}</div>
                    <div className="text-sm text-gray-500">{CURRENCY_NAMES[currency]}</div>
                  </div>
                  {value === currency && (
                    <svg
                      className="w-5 h-5 text-primary-600 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
