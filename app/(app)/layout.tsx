'use client';

import React, { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ModeProvider, useMode } from '@/lib/auth/mode-context';
import { OperationalMode } from '@/types/operational-mode';
import { CommandPalette } from '@/components/CommandPalette';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageTitleProvider } from '@/components/PageTitle';
import { WhatsNewModal } from '@/components/modals/WhatsNewModal';
import { PageKbProvider } from '@/components/kb/PageKbProvider';
import { PageKbPanel } from '@/components/kb/PageKbPanel';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AISettingsProvider, useAISettings } from '@/components/ai/AISettingsProvider';
import { getActiveModule } from '@/lib/config/module-registry';
import { applyThemeVars, getStoredTheme } from '@/lib/config/themes';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Loading screen while checking auth
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse"
          style={{
            backgroundImage:
              'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
          }}
        />
        <p className="text-[color:var(--color-muted)]">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inner layout with mode context and keyboard shortcuts
 */
function AppLayoutInner({
  children,
  commandPaletteOpen,
  setCommandPaletteOpen,
}: {
  children: React.ReactNode;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}) {
  const { switchMode, canSwitchMode } = useMode();
  const { isFeatureEnabled } = useAISettings();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Command Palette: Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }

      // Mode switching: Cmd+1 through Cmd+4 / Ctrl+1 through Ctrl+4
      if ((e.metaKey || e.ctrlKey) && canSwitchMode) {
        const modeMap: Record<string, OperationalMode> = {
          '1': OperationalMode.DESIGN,
          '2': OperationalMode.OPERATE,
          '3': OperationalMode.DISPUTE,
          '4': OperationalMode.OVERSEE,
        };

        if (e.key in modeMap) {
          e.preventDefault();
          try {
            await switchMode(modeMap[e.key]);
          } catch (error) {
            console.error('Failed to switch mode:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSwitchMode, switchMode, commandPaletteOpen, setCommandPaletteOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-24">{children}</main>
      <Footer />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <WhatsNewModal />
      {/* AI Dock is rendered in RootLayoutClient via @aicr/orbs */}
      <PageKbPanel enabled={isFeatureEnabled('pageKb')} />
    </div>
  );
}

/**
 * Auth-protected layout wrapper
 */
function AuthProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const activeModule = getActiveModule();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Apply theme
  useEffect(() => {
    const g = activeModule.gradient;
    const moduleTheme = {
      gradient: {
        start: g.start,
        mid1: g.mid1 || g.start,
        mid2: g.mid2 || g.end,
        end: g.end,
      },
      primary: g.start,
      secondary: g.mid2 || g.end,
      accent: g.end,
    };
    applyThemeVars({
      id: 'module-default',
      name: activeModule.module.name,
      description: '',
      gradient: moduleTheme.gradient,
      primary: moduleTheme.primary,
      secondary: moduleTheme.secondary,
      accent: moduleTheme.accent,
    });
    const stored = getStoredTheme();
    applyThemeVars(stored);
  }, [activeModule]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return <LoadingScreen />;
  }

  return (
    <AISettingsProvider>
      <ModeProvider>
        <PageTitleProvider>
          <PageKbProvider>
            <AppLayoutInner
              commandPaletteOpen={commandPaletteOpen}
              setCommandPaletteOpen={setCommandPaletteOpen}
            >
              {children}
            </AppLayoutInner>
          </PageKbProvider>
        </PageTitleProvider>
      </ModeProvider>
    </AISettingsProvider>
  );
}

/**
 * Protected app layout
 * Wraps all authenticated pages with navbar, footer, AI components
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProtectedLayout>{children}</AuthProtectedLayout>
      </ThemeProvider>
    </SessionProvider>
  );
}
