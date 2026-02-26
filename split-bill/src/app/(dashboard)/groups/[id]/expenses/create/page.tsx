'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

interface GroupMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Split {
  userId: string;
  amount: number;
}

const EXPENSE_CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'ACCOMMODATION',
  'ENTERTAINMENT',
  'BILLS',
  'OTHER',
];

export default function CreateExpensePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch group members
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/groups/${groupId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch group');
        }

        const data = await response.json();
        setMembers(data.group.members);

        // Initialize splits with empty amounts
        setSplits(
          data.group.members.map((member: GroupMember) => ({
            userId: member.user.id,
            amount: 0,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

  // Auto-split calculation (divide by number of selected members)
  const handleAutoSplit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount first');
      return;
    }

    const selectedMembers = members.length;
    if (selectedMembers === 0) {
      setError('No members in group');
      return;
    }

    const splitAmount = Math.round((parsedAmount / selectedMembers) * 100) / 100;
    const remainder = Math.round((parsedAmount * 100) % selectedMembers) / 100;

    const newSplits = members.map((member, index) => ({
      userId: member.user.id,
      amount:
        index === 0 ? splitAmount + remainder : splitAmount,
    }));

    setSplits(newSplits);
  };

  // Update split amount
  const handleSplitChange = (userId: string, newAmount: number) => {
    setSplits(
      splits.map((split) =>
        split.userId === userId ? { ...split, amount: newAmount } : split
      )
    );
  };

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Validation
      if (!description.trim()) {
        setError('Description is required');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Amount must be greater than 0');
        return;
      }

      // Check splits sum
      const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
      const roundedAmount = Math.round(parsedAmount * 100) / 100;
      const roundedTotal = Math.round(totalSplits * 100) / 100;

      if (Math.abs(roundedAmount - roundedTotal) > 0.01) {
        setError(
          `Split amounts (${roundedTotal.toFixed(2)}) must equal total (${roundedAmount.toFixed(2)})`
        );
        return;
      }

      const activeSplits = splits.filter((split) => split.amount > 0);
      if (activeSplits.length === 0) {
        setError('At least one person must be included in the split');
        return;
      }

      // API call
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          description: description.trim(),
          amount: parsedAmount,
          category,
          date,
          splits: activeSplits,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create expense');
      }

      // Success - redirect to group page
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
              <p className="text-sm text-gray-600 mt-1">
                Create a new expense and split it among group members
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
            {/* Description */}
            <Input
              label="Description"
              type="text"
              placeholder="e.g., Dinner, Gas, Rent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              required
              helperText="What was this expense for?"
            />

            {/* Amount and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSaving}
                required
                step="0.01"
                min="0"
                helperText="Total expense amount"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:opacity-50"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() +
                        cat.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSaving}
              required
            />

            {/* Splits Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Split Between Members
                </label>
                {amount && parseFloat(amount) > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoSplit}
                    disabled={isSaving}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                  >
                    Auto Split
                  </button>
                )}
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-600">No group members</p>
                ) : (
                  members.map((member) => {
                    const split = splits.find(
                      (s) => s.userId === member.user.id
                    );
                    return (
                      <div
                        key={member.user.id}
                        className="flex items-center gap-3"
                      >
                        <span className="flex-1 text-sm font-medium text-gray-700">
                          {member.user.name}
                          {member.user.id === session?.user?.id && (
                            <span className="ml-2 text-xs text-gray-500">
                              (You)
                            </span>
                          )}
                        </span>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="0.00"
                            value={split?.amount || ''}
                            onChange={(e) =>
                              handleSplitChange(
                                member.user.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={isSaving}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:opacity-50 text-right"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Split Summary */}
              {splits.length > 0 && amount && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm space-y-1">
                    <p className="text-blue-900">
                      <span className="font-medium">Total:</span> $
                      {parseFloat(amount).toFixed(2) || '0.00'}
                    </p>
                    <p className="text-blue-700">
                      <span className="font-medium">Assigned:</span> $
                      {splits
                        .reduce((sum, split) => sum + split.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                disabled={isSaving || members.length === 0}
                className="flex-1"
              >
                {isSaving ? 'Creating...' : 'Create Expense'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
