'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ReportData {
  totalExpenses: number;
  count: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
  byUser: Record<string, number>;
  topExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    payer: string;
    group: string;
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    category: 'ALL',
  });
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch groups for filter dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data.groups);
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };
    fetchGroups();
  }, []);

  const fetchReports = async (filterParams?: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = filterParams || filters;
      const queryParams = new URLSearchParams();

      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.category && params.category !== 'ALL') queryParams.append('category', params.category);

      const url = `/api/reports?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const reportData = await response.json();
      setData(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const pieData = {
    labels: Object.keys(data.byCategory).length > 0 ? Object.keys(data.byCategory) : ['No data'],
    datasets: [
      {
        data: Object.keys(data.byCategory).length > 0 ? Object.values(data.byCategory) : [1],
        backgroundColor: [
          '#16a34a',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f97316',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: Object.keys(data.byUser).length > 0 ? Object.keys(data.byUser) : ['No data'],
    datasets: [
      {
        label: 'Total Paid',
        data: Object.keys(data.byUser).length > 0 ? Object.values(data.byUser) : [0],
        backgroundColor: '#16a34a',
        borderRadius: 4,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(data.byMonth).length > 0 ? Object.keys(data.byMonth) : ['No data'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.keys(data.byMonth).length > 0 ? Object.values(data.byMonth) : [0],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ['Description', 'Category', 'Amount', 'Payer', 'Group', 'Date'],
      ...data.topExpenses.map((exp) => [
        exp.description,
        exp.category,
        exp.amount.toFixed(2),
        exp.payer,
        exp.group,
        new Date(exp.date).toISOString().split('T')[0],
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Export CSV
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Categories</option>
                <option value="FOOD">Food</option>
                <option value="TRANSPORT">Transport</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="BILLS">Bills</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchReports()}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${data.totalExpenses.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">{data.count} expenses</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600">Number of Expenses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.count}</p>
            <p className="text-xs text-gray-500 mt-2">
              Avg: ${data.count > 0 ? (data.totalExpenses / data.count).toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600">Average Expense</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${data.count > 0 ? (data.totalExpenses / data.count).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Per expense</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
            <div className="relative h-64">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

          {/* User Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Person</h2>
            <div className="relative h-64">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="relative h-72">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Top Expenses */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Expenses</h2>
          {data.topExpenses.length > 0 ? (
            <div className="space-y-3">
              {data.topExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{exp.description}</p>
                    <p className="text-sm text-gray-600">
                      {exp.payer} • {exp.category} • {exp.group}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">${exp.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No expenses found</p>
          )}
        </div>
      </div>
    </div>
  );
}
