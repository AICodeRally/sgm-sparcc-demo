'use client';

import { useEffect, useState } from 'react';
import { DotFilledIcon } from '@radix-ui/react-icons';
import { getStoredTheme, type SparccTheme } from '@/lib/config/themes';

export function ThemeBadge({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<SparccTheme | null>(null);

  useEffect(() => {
    setTheme(getStoredTheme());

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sparcc-active-theme') {
        setTheme(getStoredTheme());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!theme) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-xs font-medium text-[color:var(--color-foreground)] ${className}`}
    >
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.start}, ${theme.gradient.mid2}, ${theme.gradient.end})`,
        }}
      >
        <DotFilledIcon className="w-3 h-3 text-white" />
      </span>
      {theme.name}
    </div>
  );
}
