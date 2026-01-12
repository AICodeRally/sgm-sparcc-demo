'use client';
export const dynamic = 'force-dynamic';


import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error in constructing an authorization URL.',
    OAuthCallback: 'Error in handling the response from an OAuth provider.',
    OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
    EmailCreateAccount: 'Could not create email provider user in the database.',
    Callback: 'Error in the OAuth callback handler route.',
    OAuthAccountNotLinked:
      'The email on the account is already linked, but not with this OAuth account.',
    EmailSignin: 'Sending the e-mail with the verification token failed.',
    CredentialsSignin: 'The authorize callback returned null in the Credentials provider.',
    SessionRequired: 'The content of this page requires you to be signed in at all times.',
    Default: 'Unable to sign in.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center sparcc-hero-bg">
      <div className="max-w-md w-full mx-4">
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[color:var(--color-error-bg)] rounded-full mb-4">
              <svg
                className="w-8 h-8 text-[color:var(--color-error)]"
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
            </div>

            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">Authentication Error</h1>
            <p className="text-[color:var(--color-muted)] mb-6">{errorMessage}</p>

            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-md hover:opacity-90 transition-all"
            >
              Try Again
            </Link>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-[color:var(--color-surface-alt)] rounded-md">
              <p className="text-xs text-[color:var(--color-muted)] text-center">Error Code: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center sparcc-hero-bg">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
