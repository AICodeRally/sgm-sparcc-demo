'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MoonIcon,
  SunIcon,
  PersonIcon,
  GearIcon,
  ExitIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  DashboardIcon,
  FileTextIcon,
  CheckCircledIcon,
  AvatarIcon,
  TableIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import { OpsChiefOrb } from '@/components/ai/OpsChiefOrb';
import { AskItem } from '@/components/ai/AskItem';
import { AppChatbot } from '@/components/ai/AppChatbot';
import { useTheme } from '@/components/ThemeProvider';

const navigation = [
  { name: 'Dashboard', path: '/sgm', icon: DashboardIcon },
  { name: 'Documents', path: '/sgm/documents', icon: FileTextIcon },
  { name: 'Approvals', path: '/sgm/approvals', icon: CheckCircledIcon },
  { name: 'Committees', path: '/sgm/committees', icon: AvatarIcon },
  { name: 'Governance Matrix', path: '/sgm/governance-matrix', icon: TableIcon },
  { name: 'Decision Log', path: '/sgm/decisions', icon: ClipboardIcon },
  { name: 'Search', path: '/sgm/search', icon: MagnifyingGlassIcon },
  { name: 'Compliance', path: '/sgm/compliance', icon: CheckIcon },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedMode, toggle } = useTheme();

  return (
    <div className="flex h-screen bg-[color:var(--color-surface-alt)]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[color:var(--color-surface)] border-r border-[color:var(--color-border)] transition-transform lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[color:var(--color-border)] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white font-bold">
            SGM
          </div>
          <div>
            <h1 className="text-lg font-bold text-[color:var(--color-foreground)]">SGM</h1>
            <p className="text-xs text-[color:var(--color-muted)]">Sales Governance</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path as any}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-info)]'
                      : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[color:var(--color-border)] p-4">
          <div className="text-xs text-[color:var(--color-muted)]">
            <p className="font-medium">Demo Mode</p>
            <p>Synthetic Data</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="flex h-16 items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)] lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <Cross1Icon className="h-5 w-5" />
              ) : (
                <HamburgerMenuIcon className="h-5 w-5" />
              )}
            </button>

            {/* Breadcrumb or Title */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                {navigation.find((item) => item.path === pathname)?.name || 'SGM'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AppChatbot appName="SGM Edge" enabled={true} />

            <button
              onClick={toggle}
              className="rounded-lg p-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]"
              aria-label="Toggle dark mode"
            >
              {resolvedMode === 'dark' ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2"
              >
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-sm font-medium text-[color:var(--color-foreground)]">Demo User</p>
                  <p className="text-xs text-[color:var(--color-muted)]">Administrator</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white text-sm font-semibold">
                  DU
                </div>
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-1 shadow-lg z-40">
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]">
                      <PersonIcon className="h-4 w-4" />
                      Profile
                    </button>
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]">
                      <GearIcon className="h-4 w-4" />
                      Settings
                    </button>
                    <hr className="my-1 border-[color:var(--color-border)]" />
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]">
                      <ExitIcon className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>

      {/* AI Widgets - Fixed Positioning */}
      <OpsChiefOrb appName="SGM Edge" enabled={true} />
      <AskItem appName="SGM Edge" enabled={true} />
    </div>
  );
}
