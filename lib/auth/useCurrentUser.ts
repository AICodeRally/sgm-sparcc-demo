'use client';

import { useSession } from 'next-auth/react';

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  isGuest: boolean;
}

/**
 * Hook to get the current authenticated user with role information.
 * Returns null if not authenticated.
 */
export function useCurrentUser(): CurrentUser | null {
  const { data: session, status } = useSession();

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  // Admin detection - can be extended to check database roles
  const email = session.user.email || '';
  const isAdmin =
    email.includes('admin') ||
    email.endsWith('@aicr.platform') ||
    (session.user as Record<string, unknown>).role === 'admin';

  return {
    id: (session.user as Record<string, unknown>).id as string || session.user.email || 'unknown',
    email,
    name: session.user.name || null,
    isAdmin,
    isGuest: email === 'guest@sgm.local' || email.includes('guest'),
  };
}
