'use client';

import { useState, useEffect } from 'react';
import { getClientName, DEFAULT_CLIENT } from '@/lib/config/client-config';

/**
 * Hook to get the configured client name
 * Returns the client name from localStorage or default
 */
export function useClientName(): string {
  const [clientName, setClientName] = useState(DEFAULT_CLIENT);

  useEffect(() => {
    setClientName(getClientName());

    // Listen for storage changes (in case user updates in another tab)
    const handleStorage = () => {
      setClientName(getClientName());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return clientName;
}
