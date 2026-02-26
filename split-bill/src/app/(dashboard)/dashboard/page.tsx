'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

interface DashboardStats {
  totalBalance: number;
  totalOwed: number;
  totalOwing: number;
  groupsCount: number;
  expensesCount: number;
  membersCount: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RSD: 'RSD ',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF ',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const { preferredCurrency, isLoading: currencyLoading } = useCurrency();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!preferredCurrency || preferredCurrency === 'USD') {
      setConversionRate(1);
      return;
    }

    const fetchRate = async () => {
      try {
        const response = await fetch('/api/currency/rates');
        if (!response.ok) return;
        const data = await response.json();
        const rate = data.rates?.[preferredCurrency];
        if (rate) setConversionRate(rate);
      } catch {
        // fallback: ostavi rate 1
      }
    };

    fetchRate();
  }, [preferredCurrency]);

  const convert = (amount: number) => (amount * conversionRate).toFixed(2);
  const symbol = CURRENCY_SYMBOLS[preferredCurrency] ?? preferredCurrency + ' ';

  if (isLoading || currencyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Failed to load dashboard'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwing = stats.totalBalance < 0;
  const absBalance = Math.abs(stats.totalBalance);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your expense summary.</p>
        </div>

        <div
          className={`rounded-lg shadow-md p-8 mb-8 text-white ${
            isOwing ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          <p className="text-lg opacity-90">Your Balance</p>
          <p className="text-5xl font-bold mt-2">{symbol}{convert(absBalance)}</p>
          <p className="text-lg opacity-90 mt-4">
            {isOwing ? 'You owe' : 'You are owed'} money
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">You Paid</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {symbol}{convert(stats.totalOwed)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">You Owe</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {symbol}{convert(stats.totalOwing)}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Groups</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.groupsCount}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.expensesCount}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.membersCount}</p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Expense</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {symbol}{stats.expensesCount > 0 ? convert((stats.totalOwed + stats.totalOwing) / stats.expensesCount) : '0.00'}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/groups">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900">Manage Groups</h3>
              <p className="text-gray-600 mt-2">View and manage your groups</p>
              <div className="mt-4 text-primary-600 font-medium">Go to Groups →</div>
            </div>
          </Link>

          <Link href="/reports">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900">View Reports</h3>
              <p className="text-gray-600 mt-2">Analyze your expense trends</p>
              <div className="mt-4 text-primary-600 font-medium">Go to Reports →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
