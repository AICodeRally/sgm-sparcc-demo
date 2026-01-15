'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SetPageTitle } from '@/components/SetPageTitle';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ModuleSwitcher } from '@/components/settings/ModuleSwitcher';
import { getActiveModule, getAllModules } from '@/lib/config/module-registry';
import {
  CubeIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ReloadIcon,
  LightningBoltIcon,
} from '@radix-ui/react-icons';
import { applyThemeVars, getStoredTheme, SPARCC_THEMES, THEME_STORAGE_KEY, type SparccTheme } from '@/lib/config/themes';
import Link from 'next/link';
import { ThemeBadge } from '@/components/ThemeBadge';

export default function ModuleSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [moduleConfig, setModuleConfig] = useState<any>(null);
  const [activeTheme, setActiveTheme] = useState<SparccTheme>(getStoredTheme());

  useEffect(() => {
    // For demo: Skip auth checks
    // In production, uncomment these checks:
    // if (status === 'loading') return;
    // if (!session?.user) {
    //   router.push('/api/auth/signin');
    //   return;
    // }
    // if (session.user.role !== 'SUPER_ADMIN') {
    //   router.push('/');
    //   return;
    // }

    // Fetch module configuration
    fetchModuleConfig();
    applyThemeVars(getStoredTheme());
  }, [session, status, router]);

  const handleThemeSelect = (theme: SparccTheme) => {
    setActiveTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    applyThemeVars(theme);
  };

  const fetchModuleConfig = async () => {
    try {
      const response = await fetch('/api/settings/module');
      if (!response.ok) {
        throw new Error('Failed to fetch module config');
      }
      const data = await response.json();
      setModuleConfig(data);
    } catch (error) {
      console.error('Error fetching module config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-alt)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[color:var(--color-muted)]">
          <ReloadIcon className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading module settings...</span>
        </div>
      </div>
    );
  }

  // For demo: Skip permission check
  // In production, uncomment this:
  // if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
  //   return null;
  // }

  const activeModule = getActiveModule();
  const allModules = getAllModules();

  return (
    <>
      <SetPageTitle
        title="Module Settings"
        description="Configure SPARCC module and color schemes"
      />
    <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb
            items={[
              { label: 'Settings' },
              { label: 'Module Configuration' },
            ]}
            className="mb-4"
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <CubeIcon className="w-8 h-8 text-[color:var(--color-foreground)]" />
              <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
                Module Configuration
              </h1>
            </div>
            <p className="text-[color:var(--color-muted)]">
              Manage SPARCC modules and switch between different product lines
            </p>
          </div>

          {/* Module Switcher Card */}
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-2">
                  Active Module Switcher
                </h2>
                <p className="text-[color:var(--color-muted)] mb-6">
                  Switch between different SPARCC product modules. Changes will
                  reload the page to apply new color schemes and configurations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={"/themes" as any}
                  className="text-sm font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-primary)]"
                >
                  Open Theme Library →
                </Link>
                <ThemeBadge />
              </div>
              <ModuleSwitcher />
            </div>
          </div>

          {/* Theme Palette */}
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-1">Theme Palette</h2>
                <p className="text-[color:var(--color-muted)]">
                  Apply RallyForge / SPARCC gradients. Your choice is saved locally and respects light/dark.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
                <LightningBoltIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Instant apply</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SPARCC_THEMES.map((theme) => {
                const isActive = theme.id === activeTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`relative text-left rounded-xl border p-4 transition-all ${
                      isActive
                        ? 'border-[color:var(--color-accent)] shadow-lg bg-[color:var(--color-surface)]'
                        : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:shadow-md'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 text-[color:var(--color-success)]">
                        <CheckCircledIcon className="w-5 h-5" />
                      </span>
                    )}
                    <div
                      className="h-20 w-full rounded-lg mb-3"
                      style={{
                        background: `linear-gradient(120deg, ${theme.gradient.start}, ${theme.gradient.mid1}, ${theme.gradient.mid2}, ${theme.gradient.end})`,
                      }}
                    />
                    <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">{theme.name}</h3>
                    <p className="text-sm text-[color:var(--color-muted)] mt-1">{theme.description}</p>
                    <div className="mt-2 text-[10px] text-[color:var(--color-muted)] grid grid-cols-2 gap-1">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ background: theme.gradient.start }} />
                        Start
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ background: theme.gradient.mid2 }} />
                        Mid
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ background: theme.gradient.end }} />
                        End
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ background: theme.primary }} />
                        Primary
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Module Details */}
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-6">
              Current Module Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Module Info */}
              <div>
                <div className="mb-6">
                  <p className="text-sm text-[color:var(--color-muted)] mb-1">Module ID</p>
                  <p className="text-lg font-mono font-semibold text-[color:var(--color-foreground)]">
                    {activeModule.module.id}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-[color:var(--color-muted)] mb-1">Product Line</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {activeModule.module.productLine}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-[color:var(--color-muted)] mb-1">Module Name</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {activeModule.module.name}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-[color:var(--color-muted)] mb-1">Version</p>
                  <p className="text-lg font-mono text-[color:var(--color-foreground)]">
                    v{activeModule.module.version}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-[color:var(--color-muted)] mb-1">Tagline</p>
                  <p className="text-lg italic text-[color:var(--color-foreground)]">
                    {activeModule.module.tagline}
                  </p>
                </div>
              </div>

              {/* Right Column: Gradient Preview */}
              <div>
                <p className="text-sm text-[color:var(--color-muted)] mb-3">Color Gradient</p>
                <div
                  className={`h-48 rounded-xl bg-gradient-to-br ${activeModule.gradient.tailwindClass} shadow-lg mb-4`}
                />

                {/* Color Stops */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-[color:var(--color-border)] shadow-sm"
                      style={{ backgroundColor: activeModule.gradient.start }}
                    />
                    <div>
                      <p className="text-sm font-medium text-[color:var(--color-foreground)]">Start</p>
                      <p className="text-xs font-mono text-[color:var(--color-muted)]">
                        {activeModule.gradient.start}
                      </p>
                    </div>
                  </div>

                  {activeModule.gradient.mid1 && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-[color:var(--color-border)] shadow-sm"
                        style={{ backgroundColor: activeModule.gradient.mid1 }}
                      />
                      <div>
                        <p className="text-sm font-medium text-[color:var(--color-foreground)]">Mid 1</p>
                        <p className="text-xs font-mono text-[color:var(--color-muted)]">
                          {activeModule.gradient.mid1}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModule.gradient.mid2 && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-[color:var(--color-border)] shadow-sm"
                        style={{ backgroundColor: activeModule.gradient.mid2 }}
                      />
                      <div>
                        <p className="text-sm font-medium text-[color:var(--color-foreground)]">Mid 2</p>
                        <p className="text-xs font-mono text-[color:var(--color-muted)]">
                          {activeModule.gradient.mid2}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModule.gradient.mid3 && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-[color:var(--color-border)] shadow-sm"
                        style={{ backgroundColor: activeModule.gradient.mid3 }}
                      />
                      <div>
                        <p className="text-sm font-medium text-[color:var(--color-foreground)]">Mid 3</p>
                        <p className="text-xs font-mono text-[color:var(--color-muted)]">
                          {activeModule.gradient.mid3}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-[color:var(--color-border)] shadow-sm"
                      style={{ backgroundColor: activeModule.gradient.end }}
                    />
                    <div>
                      <p className="text-sm font-medium text-[color:var(--color-foreground)]">End</p>
                      <p className="text-xs font-mono text-[color:var(--color-muted)]">
                        {activeModule.gradient.end}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Colors */}
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-6">
              Mode Color Distribution
            </h2>
            <p className="text-[color:var(--color-muted)] mb-6">
              Colors automatically distributed from gradient to 4 operational modes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(activeModule.modeColors).map(([mode, color]) => (
                <div
                  key={mode}
                  className="border-2 border-[color:var(--color-border)] rounded-lg p-4"
                >
                  <div
                    className="h-24 rounded-lg mb-3 shadow-sm"
                    style={{ backgroundColor: color as string }}
                  />
                  <p className="text-sm font-bold text-[color:var(--color-foreground)] mb-1">{mode}</p>
                  <p className="text-xs font-mono text-[color:var(--color-muted)]">{color as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Available Modules */}
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">
                Available Modules
              </h2>
              <span className="px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] text-xs font-semibold rounded-full">
                {allModules.length} total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allModules.map((module) => {
                const isActive = module.module.id === activeModule.module.id;

                return (
                  <div
                    key={module.module.id}
                    className={`border-2 rounded-lg p-4 ${
                      isActive
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)]'
                        : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)]'
                    }`}
                  >
                    <div
                      className={`h-16 rounded-lg mb-3 bg-gradient-to-br ${module.gradient.tailwindClass} shadow-sm`}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-bold text-[color:var(--color-foreground)]">
                        {module.module.name}
                      </p>
                      {isActive && (
                        <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-info)]" />
                      )}
                    </div>
                    <p className="text-xs text-[color:var(--color-muted)] mb-1">
                      {module.module.productLine}
                    </p>
                    <p className="text-xs font-mono text-[color:var(--color-muted)]">
                      {module.module.id} • v{module.module.version}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[color:var(--color-surface-alt)] border-2 border-[color:var(--color-info-border)] rounded-xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <InfoCircledIcon className="w-5 h-5 text-[color:var(--color-info)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-info)] mb-2">
                  Module System Information
                </p>
                <ul className="text-sm text-[color:var(--color-info)] space-y-1">
                  <li>
                    • Module switching is a global operation that affects the entire
                    platform
                  </li>
                  <li>
                    • All color schemes, gradients, and branding will update
                    immediately
                  </li>
                  <li>
                    • The page will reload to apply new module configuration
                  </li>
                  <li>• Only SUPER_ADMIN users can switch modules</li>
                  <li>
                    • Mode colors are automatically distributed from the module's
                    gradient
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
