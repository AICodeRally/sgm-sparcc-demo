'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy Henry Schein Route Redirect
 * Redirects /henryschein to /client/henryschein
 *
 * @deprecated This route is deprecated. Use /client/henryschein instead.
 */
export default function HenryScheinLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new client dashboard
    router.replace('/client/henryschein');
  }, [router]);

  return (
    <div className="min-h-screen sparcc-hero-bg flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-accent)] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">Redirecting...</h1>
        <p className="text-[color:var(--color-muted)]">
          This page has moved to the new client dashboard.
        </p>
        <p className="text-sm text-[color:var(--color-muted)] mt-4">
          Please update your bookmarks to: <br />
          <code className="bg-[color:var(--color-surface-alt)] px-2 py-1 rounded">/client/henryschein</code>
        </p>
      </div>
    </div>
  );
}
