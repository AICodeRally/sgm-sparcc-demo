'use client';
export const dynamic = 'force-dynamic';


import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/auth/signin' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center sparcc-hero-bg">
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg shadow-2xl p-8">
        <p className="text-[color:var(--color-foreground)]">Signing you out...</p>
      </div>
    </div>
  );
}
