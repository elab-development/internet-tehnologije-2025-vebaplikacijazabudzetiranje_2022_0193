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
          throw new Error('Grupa nije pronađena');
        }
        if (response.status === 403) {
          throw new Error('Nisi član ove grupe');
        }
        throw new Error('Greška pri učitavanju grupe');
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
    if (!confirm('Da li ste sigurni da želite da obrišete ovu grupu? Ova radnja se ne može poništiti.')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Greška pri brisanju grupe');
      }

      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/join/${group?.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Pozivni link je kopiran u clipboard!');
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
      alert('Molimo popunite sva obavezna polja');
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
        throw new Error(data.error || 'Greška pri beleženju poravnanja');
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
      alert('Poravnanje je uspešno zabeleženo!');
    } catch (err: any) {
      alert(err.message || 'Greška pri beleženju poravnanja');
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-Latn', {
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
              {error || 'Grupa nije pronađena'}
            </h2>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Nazad na kontrolnu tablu
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
                  Nazad
                </Button>
                {isOwner && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Vlasnik
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
                Pozovi članove
              </Button>
              {isOwner && (
                <Button variant="danger" size="sm" onClick={handleDeleteGroup}>
                  Obriši grupu
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
            <Card title="Članovi" subtitle={`${group._count.members} članova`}>
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
                            <span className="ml-2 text-xs text-primary-600">(Vlasnik)</span>
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
            <Card title="Statistike" className="mt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ukupni troškovi</p>
                  <p className="text-2xl font-bold text-gray-900">{group._count.expenses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ukupan iznos</p>
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
              <h2 className="text-xl font-bold text-gray-900">Troškovi</h2>
              <Button variant="primary" onClick={() => router.push(`/groups/${groupId}/expenses/create`)}>
                Dodaj trošak
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nema troškova</h3>
                  <p className="text-gray-600 mb-4">Počni da pratiš troškove u ovoj grupi</p>
                  <Button variant="primary">Dodaj prvi trošak</Button>
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
                          Platio/la <span className="font-medium">{expense.payer.name}</span> dana{' '}
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
                              Izmeni
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Poravnanje</h2>

            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card padding="md">
                <p className="text-sm text-gray-600">Ukupni dugovi</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${balanceData.summary.totalDebts.toFixed(2)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Već namireno</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ${balanceData.summary.totalSettled.toFixed(2)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Nenamireni iznos</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  ${balanceData.summary.unsettledAmount.toFixed(2)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Potrebne transakcije</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {balanceData.summary.transactionsNeeded}
                </p>
              </Card>
            </div>

            {/* Optimized Debts List */}
            <Card padding="lg" variant="elevated" className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ko duguje kome
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
                        {' duguje '}
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
                        Plati
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
                  Zabeleži poravnanje
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Iznos
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
                      Datum
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
                      Napomena (opciono)
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
                      placeholder="npr. Uplata putem bankovnog transfera"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setSettlingDebt(null)}
                      disabled={isSubmittingSettlement}
                      className="flex-1"
                    >
                      Otkaži
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitSettlement}
                      isLoading={isSubmittingSettlement}
                      disabled={isSubmittingSettlement}
                      className="flex-1"
                    >
                      {isSubmittingSettlement ? 'Beleženje...' : 'Zabeleži poravnanje'}
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