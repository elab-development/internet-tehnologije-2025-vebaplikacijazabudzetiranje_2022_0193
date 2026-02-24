'use client';

import { useState } from 'react';
import { ExpenseCategory } from '@prisma/client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [groupId, setGroupId] = useState('');

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (groupId) params.append('groupId', groupId);
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);

    try {
      const response = await fetch(`/api/expenses/search?${params}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.expenses);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setCategory('');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setGroupId('');
    setResults([]);
    setTotal(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Expenses</h1>
        <p className="text-gray-600 mb-8">Find expenses by description, category, date, or amount</p>

        {/* Search Filters Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Text Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Description
              </label>
              <input
                type="text"
                placeholder="e.g., dinner, hotel..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {Object.values(ExpenseCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group (optional)
              </label>
              <input
                type="text"
                placeholder="Group ID"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                placeholder="1000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Count */}
        {total > 0 && !isLoading && (
          <div className="mb-4">
            <p className="text-gray-700">
              Found <strong>{total}</strong> expense{total !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {results.map((expense) => (
            <div key={expense.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      {expense.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Paid by <strong>{expense.payer.name}</strong> in{' '}
                    <strong>{expense.group.name}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${Number(expense.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {expense.splits.length} participant{expense.splits.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!isLoading && results.length === 0 && total === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No expenses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters or add new expenses
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
