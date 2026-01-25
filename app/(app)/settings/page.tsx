'use client';

import Link from 'next/link';
import { SetPageTitle } from '@/components/SetPageTitle';
import { PersonIcon, GearIcon, MixerHorizontalIcon, BellIcon, BarChartIcon, AvatarIcon, ReaderIcon } from '@radix-ui/react-icons';
import { useCurrentUser } from '@/lib/auth';

export default function SettingsPage() {
  const user = useCurrentUser();
  const settingsSections = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      href: '/settings/profile',
      icon: PersonIcon,
    },
    {
      title: 'Module Settings',
      description: 'Configure module-specific options and themes',
      href: '/settings/module',
      icon: MixerHorizontalIcon,
    },
    {
      title: 'Metric Stacks',
      description: 'Configure which metrics appear in dashboard stacks',
      href: '/settings/metrics',
      icon: BarChartIcon,
    },
    {
      title: 'Client Name',
      description: 'Set the demo client name used throughout the app',
      href: '/settings/client',
      icon: AvatarIcon,
    },
    {
      title: 'Notifications',
      description: 'Control how you receive alerts and updates',
      href: '/notifications',
      icon: BellIcon,
    },
  ];

  const adminSections = [
    {
      title: 'Tenant Management',
      description: 'Manage tenants and client configurations',
      href: '/admin/tenants',
      icon: AvatarIcon,
    },
  ];

  return (
    <>
      <SetPageTitle title="Settings" description="Configure your account and preferences" />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">Settings</h1>
            <p className="text-[color:var(--color-muted)] mt-1">Manage your account and application preferences</p>
          </div>

          <div className="grid gap-4">
            {settingsSections.map((section) => (
              <Link
                key={section.href}
                href={section.href as any}
                className="flex items-center gap-4 p-6 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] hover:border-[color:var(--color-primary)] hover:shadow-md transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-alt)]">
                  <section.icon className="h-6 w-6 text-[color:var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[color:var(--color-foreground)]">{section.title}</h3>
                  <p className="text-sm text-[color:var(--color-muted)]">{section.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Admin Section - Only visible to admin users */}
          {user?.isAdmin && (
            <>
              <div className="mt-12 mb-8">
                <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Administration</h2>
                <p className="text-[color:var(--color-muted)] mt-1">System administration and monitoring</p>
              </div>

              <div className="grid gap-4">
                {adminSections.map((section) => (
                  <Link
                    key={section.href}
                    href={section.href as any}
                    className="flex items-center gap-4 p-6 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] hover:border-[color:var(--color-accent)] hover:shadow-md transition-all"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-accent-bg)]">
                      <section.icon className="h-6 w-6 text-[color:var(--color-accent)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[color:var(--color-foreground)]">{section.title}</h3>
                      <p className="text-sm text-[color:var(--color-muted)]">{section.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
