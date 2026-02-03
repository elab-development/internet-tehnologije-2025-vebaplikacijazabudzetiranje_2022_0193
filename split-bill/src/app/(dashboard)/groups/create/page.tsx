'use client';

import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

/**
 * Create Group stranica
 * 
 * React Hooks korišćeni:
 * - useState: Form state management
 * - useSession: Provera role korisnika
 * - useRouter: Navigacija nakon kreiranja
 */
export default function CreateGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validacija
      if (!name.trim()) {
        setError('Group name is required');
        setIsLoading(false);
        return;
      }

      // API call
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }

      // Success - redirect to group page
      router.push(`/groups/${data.group.id}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check permissions
  if (
    session?.user?.role !== 'ADMIN' &&
    session?.user?.role !== 'EDITOR'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card padding="lg" className="max-w-md">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              Only EDITOR and ADMIN users can create groups.
            </p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              }
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Group
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Start sharing expenses with friends and family
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card padding="lg" variant="elevated">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Group Name"
              type="text"
              placeholder="e.g., Apartment Expenses, Weekend Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              helperText="Choose a descriptive name for your group"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:opacity-50"
                rows={4}
                placeholder="Optional: Add a description for this group"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You will be added as the group owner</li>
                    <li>You can invite members via email</li>
                    <li>Start adding expenses to track spending</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}