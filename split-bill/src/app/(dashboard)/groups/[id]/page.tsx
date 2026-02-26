'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';

/**
 * Group Details stranica
 * Prikazuje detalje grupe, članove i troškove
 */

interface GroupMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  joinedAt: string;
}

interface ExpenseSplit {
  id: string;
  amount: string;
  user: {
    id: string;
    name: string;
  };
}

interface Expense {
  id: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  payer: {
    id: string;
    name: string;
  };
  splits: ExpenseSplit[];
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: GroupMember[];
  expenses: Expense[];
  _count: {
    members: number;
    expenses: number;
  };
}

interface OptimizedDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface BalanceData {
  balances: Array<{
    userId: string;
    userName: string;
    balance: number;
  }>;
  optimizedDebts: OptimizedDebt[];
  summary: {
    totalDebts: number;
    totalSettled: number;
    unsettledAmount: number;
    transactionsNeeded: number;
  };
}

export default function GroupDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [settlementForm, setSettlementForm] = useState({
    toUserId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    comment: '',
  });
  const [settlingDebt, setSettlingDebt] = useState<string | null>(null);
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchBalances();
  }, [groupId]);

  const fetchBalances = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/balances`);
      if (response.ok) {
        const data = await response.json();
        setBalanceData(data);
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/groups/${groupId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Group not found');
        }
        if (response.status === 403) {
          throw new Error('You are not a member of this group');
        }
        throw new Error('Failed to load group');
      }

      const data = await response.json();
      setGroup(data.group);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/join/${group?.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const handleRecordSettlement = async (debt: OptimizedDebt) => {
    setSettlingDebt(debt.from);
    setSettlementForm({
      toUserId: debt.to,
      amount: debt.amount.toString(),
      date: new Date().toISOString().split('T')[0],
      comment: '',
    });
  };

  const handleSubmitSettlement = async () => {
    if (!settlementForm.toUserId || !settlementForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmittingSettlement(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: settlementForm.toUserId,
          amount: parseFloat(settlementForm.amount),
          date: settlementForm.date,
          comment: settlementForm.comment || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to record settlement');
      }

      // Success - reset form and refresh balances
      setSettlingDebt(null);
      setSettlementForm({
        toUserId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        comment: '',
      });
      await fetchBalances();
      alert('Settlement recorded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to record settlement');
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !group) {
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error || 'Group not found'}
            </h2>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isOwner = group.owner.id === session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  }
                >
                  Back
                </Button>
                {isOwner && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Owner
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mt-2">{group.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyInviteLink}>
                Invite Members
              </Button>
              {isOwner && (
                <Button variant="danger" size="sm" onClick={handleDeleteGroup}>
                  Delete Group
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Members */}
          <div className="lg:col-span-1">
            <Card title="Members" subtitle={`${group._count.members} members`}>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.user.name}
                          {member.user.id === group.owner.id && (
                            <span className="ml-2 text-xs text-primary-600">(Owner)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats */}
            <Card title="Statistics" className="mt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{group._count.expenses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      group.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toString()
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Expenses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
              <Button variant="primary" onClick={() => router.push(`/groups/${groupId}/expenses/create`)}>
                Add Expense
              </Button>
            </div>

            {group.expenses.length === 0 ? (
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                  <p className="text-gray-600 mb-4">Start tracking expenses in this group</p>
                  <Button variant="primary">Add First Expense</Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {group.expenses.map((expense) => (
                  <Card key={expense.id} padding="md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {expense.description}
                          </h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {expense.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Paid by <span className="font-medium">{expense.payer.name}</span> on{' '}
                          {formatDate(expense.date)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {expense.splits.map((split) => (
                            <div
                              key={split.id}
                              className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                            >
                              {split.user.name}: {formatCurrency(split.amount)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        {(expense.payer.id === session?.user?.id || group.owner.id === session?.user?.id) && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/groups/${groupId}/expenses/${expense.id}/edit`
                                )
                              }
                              leftIcon={
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              }
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Balances & Settlement Section */}
        {balanceData && balanceData.optimizedDebts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settlement</h2>

            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card padding="md">
                <p className="text-sm text-gray-600">Total Debts</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${balanceData.summary.totalDebts.toFixed(2)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Already Settled</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ${balanceData.summary.totalSettled.toFixed(2)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Unsettled Amount</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  ${balanceData.summary.unsettledAmount.toFixed(2)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Transactions Needed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {balanceData.summary.transactionsNeeded}
                </p>
              </Card>
            </div>

            {/* Optimized Debts List */}
            <Card padding="lg" variant="elevated" className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Who Owes Whom
              </h3>
              <div className="space-y-3">
                {balanceData.optimizedDebts.map((debt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        <span className="text-blue-600">{debt.fromName}</span>
                        {' owes '}
                        <span className="text-green-600">{debt.toName}</span>
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${debt.amount.toFixed(2)}
                      </p>
                    </div>
                    {session?.user?.id === debt.from && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRecordSettlement(debt)}
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Settlement Recording Form */}
            {settlingDebt && (
              <Card padding="lg" variant="elevated" className="bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Record Settlement
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={settlementForm.amount}
                      onChange={(e) =>
                        setSettlementForm({
                          ...settlementForm,
                          amount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={settlementForm.date}
                      onChange={(e) =>
                        setSettlementForm({
                          ...settlementForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <textarea
                      value={settlementForm.comment}
                      onChange={(e) =>
                        setSettlementForm({
                          ...settlementForm,
                          comment: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      placeholder="e.g., Payment via bank transfer"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setSettlingDebt(null)}
                      disabled={isSubmittingSettlement}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitSettlement}
                      isLoading={isSubmittingSettlement}
                      disabled={isSubmittingSettlement}
                      className="flex-1"
                    >
                      {isSubmittingSettlement ? 'Recording...' : 'Record Settlement'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}