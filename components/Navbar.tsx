'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePageTitle } from './PageTitle';
import { ModeSwitcher } from './auth/ModeSwitcher';
import { getActiveModule } from '@/lib/config/module-registry';
import {
  SunIcon,
  MoonIcon,
  DesktopIcon,
} from '@radix-ui/react-icons';
import { useTheme } from '@/components/ThemeProvider';
import { ThemeBadge } from '@/components/ThemeBadge';

export function Navbar() {
  const { title, description } = usePageTitle();
  const activeModule = getActiveModule();
  const [user, setUser] = useState({
    name: 'Sarah Chen',
    role: 'Governance Administrator',
    email: 'sarah.chen@henryschein.com'
  });
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  return (
    <nav
      className="bg-[color:var(--color-surface)] shadow-sm sticky top-0 z-50 border-b-4 border-transparent"
      style={{
        borderImage:
          'linear-gradient(to right, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end)) 1',
      }}
    >
      <div className="w-full px-6">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Left side: SPARCC text logo + SGM circle + module info */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-4 group">
              {/* SPARCC Text Logo */}
              <div className="flex flex-col items-center">
                <span
                  className="text-3xl font-bold bg-clip-text text-transparent tracking-tight"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  SPARCC
                </span>
                <span className="text-[8px] text-[color:var(--color-muted)] uppercase tracking-widest -mt-1">
                  {activeModule.module.tagline}
                </span>
              </div>

              {/* SGM Circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                }}
              >
                <span className="text-white font-bold text-xl">SGM</span>
              </div>

              {/* SGM Module Info */}
              <div className="border-l border-[color:var(--color-border)] pl-6">
                <h1
                  className="text-lg font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  {title}
                </h1>
                <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                  {description}
                </p>
              </div>
            </Link>
          </div>

          {/* Right side: Mode Switcher + User info */}
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Link
              href="/themes"
              className="hidden md:inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-3 py-1 text-xs font-medium text-[color:var(--color-foreground)] hover:border-[color:var(--color-accent-border)]"
            >
              Themes
            </Link>
            <div className="flex items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] p-1">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`rounded-full p-1.5 transition-colors ${
                  themeMode === 'light'
                    ? 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] shadow-sm'
                    : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
                }`}
                aria-label="Light mode"
              >
                <SunIcon />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`rounded-full p-1.5 transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] shadow-sm'
                    : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
                }`}
                aria-label="Dark mode"
              >
                <MoonIcon />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`rounded-full p-1.5 transition-colors ${
                  themeMode === 'system'
                    ? 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] shadow-sm'
                    : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
                }`}
                aria-label="System theme"
              >
                <DesktopIcon />
              </button>
            </div>
            <ThemeBadge className="hidden lg:inline-flex" />
            <div className="border-l border-[color:var(--color-border)] pl-4 text-right">
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">{user.name}</p>
              <p className="text-xs text-[color:var(--color-muted)]">{user.role}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
              }}
            >
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
