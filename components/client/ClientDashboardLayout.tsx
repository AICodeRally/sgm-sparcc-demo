'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  TableIcon,
  ReaderIcon,
  ClockIcon,
} from '@radix-ui/react-icons';

interface ClientDashboardLayoutProps {
  children: ReactNode;
  tenantSlug: string;
  tenantName: string;
  brandingConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    companyName?: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Client Dashboard Layout
 * Reusable shell for all BETA/PRODUCTION tier client dashboards
 * Supports white-label branding configuration
 */
export function ClientDashboardLayout({
  children,
  tenantSlug,
  tenantName,
  brandingConfig,
}: ClientDashboardLayoutProps) {
  const pathname = usePathname();

  // Navigation items
  const navItems: NavItem[] = [
    { href: `/client/${tenantSlug}`, label: 'Dashboard', icon: DashboardIcon },
    { href: `/client/${tenantSlug}/plans`, label: 'Plans', icon: FileTextIcon },
    { href: `/client/${tenantSlug}/gaps`, label: 'Gaps', icon: ExclamationTriangleIcon },
    { href: `/client/${tenantSlug}/coverage`, label: 'Coverage', icon: TableIcon },
    { href: `/client/${tenantSlug}/policies`, label: 'Policies', icon: ReaderIcon },
    { href: `/client/${tenantSlug}/roadmap`, label: 'Roadmap', icon: ClockIcon },
  ];

  // Default colors if no branding provided
  const primaryColor = brandingConfig?.primaryColor || 'var(--color-primary)';
  const secondaryColor = brandingConfig?.secondaryColor || 'var(--color-accent)';
  const companyName = brandingConfig?.companyName || tenantName;
  const hasBranding = Boolean(brandingConfig?.primaryColor || brandingConfig?.secondaryColor);
  const activeTabStyle = hasBranding
    ? { borderColor: primaryColor, background: `${primaryColor}14` }
    : {
        borderColor: 'var(--color-primary)',
        background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
      };

  return (
    <div
      className={`min-h-screen ${hasBranding ? '' : 'sparcc-hero-bg'}`}
      style={
        hasBranding
          ? {
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}15, var(--color-background))`,
            }
          : undefined
      }
    >
      {/* Header with tenant branding */}
      <header
        className="bg-[color:var(--color-surface)] shadow-sm border-b-4 border-transparent sticky top-0 z-50"
        style={{
          borderImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}) 1`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-4">
              {brandingConfig?.logo ? (
                <img
                  src={brandingConfig.logo}
                  alt={`${companyName} logo`}
                  className="h-12 w-auto"
                />
              ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{
                    background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  {(companyName || 'SG').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  {companyName}
                </h1>
                <p className="text-sm text-[color:var(--color-muted)]">Governance Dashboard</p>
              </div>
            </div>

            {/* Back to Platform Link */}
            <Link
              href="/"
              className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
            >
              ← Back to Platform
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 mt-4 border-t border-[color:var(--color-border)] pt-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href as any}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-transparent text-[color:var(--color-foreground)]'
                        : 'border-transparent hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
                    }`}
                    style={isActive ? activeTabStyle : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[color:var(--color-surface)] border-t border-[color:var(--color-border)] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-[color:var(--color-muted)]">
            Powered by SPARCC Sales Governance Platform
          </p>
          <p className="text-xs text-[color:var(--color-muted)] mt-1">
            © 2025 All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
