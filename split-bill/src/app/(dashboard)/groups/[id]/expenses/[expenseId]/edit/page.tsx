'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

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
  groupId: string;
}

const EXPENSE_CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'ACCOMMODATION',
  'ENTERTAINMENT',
  'BILLS',
  'OTHER',
];

export default function EditExpensePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const expenseId = params.expenseId as string;

  // Form state
  const [expense, setExpense] = useState<Expense | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [date, setDate] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch expense details
  useEffect(() => {
    const fetchExpenseDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/expenses/${expenseId}`);

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Nemate dozvolu da izmenite ovaj trošak');
          }
          throw new Error('Greška pri učitavanju troška');
        }

        const data = await response.json();
        setExpense(data.expense);
        setDescription(data.expense.description);
        setAmount(data.expense.amount);
        setCategory(data.expense.category);
        setDate(data.expense.date.split('T')[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepoznata greška');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [expenseId]);

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Validation
      if (!description.trim()) {
        setError('Opis je obavezan');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Iznos mora biti veći od 0');
        return;
      }

      // API call
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: parsedAmount,
          category,
          date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri ažuriranju troška');
      }

      // Success - redirect to group page
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      setError(err.message || 'Došlo je do neočekivane greške');
      setIsSaving(false);
    }
  };

  // Delete expense
  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri brisanju troška');
      }

      // Success - redirect to group page
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      setError(err.message || 'Došlo je do neočekivane greške');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card padding="lg">
            <p className="text-red-600">{error || 'Trošak nije pronađen'}</p>
            <Button
              variant="primary"
              onClick={() => router.push(`/groups/${groupId}`)}
              className="mt-4"
            >
              Nazad
            </Button>
          </Card>
        </div>
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
              Nazad
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Izmeni trošak</h1>
              <p className="text-sm text-gray-600 mt-1">
                Platio/la {expense.payer.name}
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
              label="Opis"
              type="text"
              placeholder="npr. Večera, Gorivo, Kirija"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving || isDeleting}
              required
              helperText="Za šta je bio ovaj trošak?"
            />

            {/* Amount and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Iznos"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSaving || isDeleting}
                required
                step="0.01"
                min="0"
                helperText="Ukupan iznos troška"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorija
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSaving || isDeleting}
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
              label="Datum"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSaving || isDeleting}
              required
            />

            {/* Splits Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-3">
                  Detalji podele (ne mogu se menjati)
                </p>
                <div className="space-y-2">
                  {expense.splits.map((split) => (
                    <div key={split.id} className="flex justify-between">
                      <span className="text-blue-800">{split.user.name}</span>
                      <span className="font-medium text-blue-900">
                        ${parseFloat(split.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving || isDeleting}
                className="flex-1"
              >
                Otkaži
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                disabled={isSaving || isDeleting}
                className="flex-1"
              >
                {isSaving ? 'Čuvanje...' : 'Sačuvaj izmene'}
              </Button>
            </div>
          </form>

          {/* Delete Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm font-medium text-red-900 mb-2">
                Opasna zona
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Nakon brisanja troška, nema povratka. Budite sigurni pre nego što nastavite.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving || isDeleting}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Obriši trošak
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card padding="lg" className="max-w-sm">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-red-600 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 4v2m-6-8a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm6-8a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Obriši trošak?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Ovo će trajno obrisati „{description}". Ova radnja se ne može poništiti.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Otkaži
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Brisanje...' : 'Obriši'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}