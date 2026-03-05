'use client';
import { useState, FormEvent, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';

/**
 * Login stranica
 * 
 * React Hooks korišćeni:
 * - useState: Upravljanje form state-om
 * - useRouter: Navigacija nakon login-a
 * - useSearchParams: Čitanje error parametara iz URL-a
 */
function LoginForm() {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Next.js hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL params from NextAuth or verify-email redirect
  const urlError = searchParams.get('error');
  const verified = searchParams.get('verified');

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validacija
      if (!email || !password) {
        setError('Molimo popuni sva polja');
        setIsLoading(false);
        return;
      }

      // NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Ne redirektuj automatski
      });

      if (result?.error) {
        // NextAuth wraps custom errors as 'CredentialsSignin'.
        // We re-check by attempting to distinguish via the error detail.
        if (result.error === 'Please verify your email before logging in') {
          setError('Molimo verifikuj email pre prijave. Proveri sandučić.');
        } else {
          setError('Nevažeći email ili lozinka');
        }
        setIsLoading(false);
      } else {
        // Login uspešan - redirektuj na dashboard
        router.push('/dashboard');
        router.refresh(); // Refresh server components
      }
    } catch (err) {
      setError('Došlo je do neočekivane greške');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            SplitBill
          </h1>
          <p className="text-gray-600">
            Deli troškove sa prijateljima i porodicom
          </p>
        </div>

        {/* Login Card */}
        <Card padding="lg" variant="elevated">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Prijavi se
          </h2>

          {/* Success: email verified */}
          {verified === '1' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✅ Email je verifikovan! Sada se možeš prijaviti.
              </p>
            </div>
          )}

          {/* Info: already verified */}
          {verified === 'already' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Tvoj email je već verifikovan. Molimo prijavi se.
              </p>
            </div>
          )}

          {/* Error: invalid/expired link */}
          {urlError === 'invalid_link' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Nevažeći ili istekli link za verifikaciju. Molimo registruj se ponovo ili kontaktiraj podršku.
              </p>
            </div>
          )}

          {/* Error Messages */}
          {(error || (urlError && urlError !== 'invalid_link')) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {error || 'Greška pri autentikaciji. Molimo pokušaj ponovo.'}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email adresa"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
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
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <Input
              label="Lozinka"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">ILI</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Nemaš nalog?{' '}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Registruj se
              </Link>
            </p>
          </div>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Test podaci za prijavu:
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Admin: admin@splitbill.com / Admin123!</p>
              <p>Editor: editor@splitbill.com / Editor123!</p>
              <p>User: user@splitbill.com / User123!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}