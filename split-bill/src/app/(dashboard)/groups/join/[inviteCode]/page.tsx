'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function JoinGroupPage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    // Auto-join if valid invite code
    if (inviteCode) {
      handleJoin();
    }
  }, [inviteCode]);

  const handleJoin = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group');
      }

      setGroupName(data.groupName);

      // Redirect to group page after 2 seconds
      setTimeout(() => {
        router.push(`/groups/${data.groupId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary-600"
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

        {!isLoading && !error && !groupName && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Group</h2>
            <p className="text-gray-600 mb-6">
              You've been invited to join a group on SplitBill
            </p>
          </>
        )}

        {isLoading && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Joining Group...</h2>
            <p className="text-gray-600 mb-6">Please wait while we add you to the group</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </>
        )}

        {error && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {groupName && (
          <>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <svg
                className="w-8 h-8 text-green-600 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-600 font-medium">Successfully joined!</p>
            </div>
            <p className="text-gray-600 mb-4">You've joined <strong>{groupName}</strong></p>
            <p className="text-sm text-gray-500">Redirecting to group...</p>
          </>
        )}
      </div>
    </div>
  );
}
