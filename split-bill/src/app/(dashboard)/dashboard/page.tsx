'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';

/**
 * Dashboard stranica
 * 
 * React Hooks korišćeni:
 * - useSession: Pristup trenutnoj sesiji korisnika
 * - useEffect: Fetch podataka pri mount-u
 * - useState: Upravljanje state-om grupa i loading-a
 * - useRouter: Navigacija na druge stranice
 */

interface Group {
  id: string;
  name: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    members: number;
    expenses: number;
  };
}

export default function DashboardPage() {
  // Session hook - dobijanje trenutnog korisnika
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * useEffect - Fetch grupa pri mount-u komponente
   */
  useEffect(() => {
    // Redirect na login ako nije autentifikovan
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Fetch grupa samo ako je autentifikovan
    if (status === 'authenticated') {
      fetchGroups();
    }
  }, [status, router]);

  /**
   * Fetch grupa sa API-ja
   */
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/groups');

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError('Failed to load groups. Please try again.');
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (shouldn't reach here due to middleware)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session?.user?.name}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your shared expenses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {session?.user?.role}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Groups
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {groups.length}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Expenses
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {groups.reduce((sum, g) => sum + g._count.expenses, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Members
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {groups.reduce((sum, g) => sum + g._count.members, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Groups Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Groups</h2>
          {(session?.user?.role === 'ADMIN' ||
            session?.user?.role === 'EDITOR') && (
            <Button
              variant="primary"
              onClick={() => router.push('/groups/create')}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              Create Group
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGroups}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No groups yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first group to start sharing expenses
              </p>
              {(session?.user?.role === 'ADMIN' ||
                session?.user?.role === 'EDITOR') && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/groups/create')}
                >
                  Create Your First Group
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                title={group.name}
                subtitle={group.description || undefined}
                clickable
                onClick={() => router.push(`/groups/${group.id}`)}
                footer={
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {group._count.members} members
                    </span>
                    <span className="text-gray-600">
                      {group._count.expenses} expenses
                    </span>
                  </div>
                }
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Owner: {group.owner.name}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}