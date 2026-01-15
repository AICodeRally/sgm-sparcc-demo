'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn('passkey', {
      passkey: email,
      callbackUrl,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center sparcc-hero-bg">
      <div className="max-w-md w-full mx-4">
        {/* Card */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
              SGM
            </h1>
            <p className="text-[color:var(--color-muted)] mt-2">Sales Governance Manager</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-md">
              <p className="text-sm text-[color:var(--color-error)]">
                {error === 'CredentialsSignin'
                  ? 'Invalid credentials. Please try again.'
                  : error === 'AccessDenied'
                  ? 'Access denied. Your tenant may not be active.'
                  : 'An error occurred during sign in'}
              </p>
            </div>
          )}

          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={isLoading}
                autoComplete="email"
                className="w-full px-4 py-3 border-2 border-[color:var(--color-border)] rounded-md focus:border-[color:var(--color-primary)] focus:outline-none disabled:opacity-50 bg-[color:var(--color-surface)]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full px-4 py-3 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white font-medium rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-[color:var(--color-muted)]">
            <p>Powered by Rally Stack</p>
            <p className="mt-1">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-[color:var(--color-primary)] hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-[color:var(--color-primary)] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-[color:var(--color-surface-alt)] rounded-md">
            <p className="text-xs text-[color:var(--color-muted)] text-center">
              <strong>Demo Mode:</strong> Enter any email to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center sparcc-hero-bg">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
