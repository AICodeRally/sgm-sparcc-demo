'use client';

import React, { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

// Shell imports - using unified Shell component
import {
  Shell,
  PageTitleProvider,
  usePageTitle,
  type ShellContentConfig,
  type NavbarUser,
  type FooterLink,
} from '@aicr/shell';
import {
  rcmBrand,
  rcmContentStyle,
  rcmModules,
  rcmNavigation,
  getIconComponent,
} from '@/lib/config/shell-config';

// Local imports (keeping AI components and other local features)
import { ModeProvider, useMode } from '@/lib/auth/mode-context';
import { OperationalMode } from '@/types/operational-mode';
import { CommandPalette } from '@/components/CommandPalette';
import { OpsChiefOrb } from '@/components/ai/OpsChiefOrb';
import { AskItem } from '@/components/ai/AskItem';
import { PulseOrb } from '@/components/ai/PulseOrb';
import { TaskOrb } from '@/components/ai/TaskOrb';
import { WhatsNewModal } from '@/components/modals/WhatsNewModal';
import { PageKbProvider } from '@/components/kb/PageKbProvider';
import { PageKbPanel } from '@/components/kb/PageKbPanel';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AISettingsProvider, useAISettings } from '@/components/ai/AISettingsProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Loading screen while checking auth
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${rcmBrand.gradient[0]}, ${rcmBrand.gradient[1]})`,
          }}
        />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Footer links
 */
const footerLinks: FooterLink[] = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
];

/**
 * Shell configuration for RCM (tiles style)
 */
const shellConfig: ShellContentConfig = {
  contentStyle: rcmContentStyle,
  brand: rcmBrand,
  navigation: rcmNavigation,
  modules: rcmModules,
};

/**
 * Inner layout with unified Shell component
 */
function AppLayoutInner({
  children,
  commandPaletteOpen,
  setCommandPaletteOpen,
  user,
}: {
  children: React.ReactNode;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  user: NavbarUser;
}) {
  const { switchMode, canSwitchMode } = useMode();
  const { isFeatureEnabled } = useAISettings();
  const { title, description } = usePageTitle();

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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <Shell
        config={shellConfig}
        user={user}
        pageTitle={title}
        pageDescription={description}
        onSignOut={handleSignOut}
        footerLinks={footerLinks}
        footerTagline="Powered by AICR Platform"
        showSearch={true}
        getIcon={getIconComponent}
      >
        {children}
      </Shell>

      {/* Overlays and Modals */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <WhatsNewModal />

      {/* AI Widgets */}
      <OpsChiefOrb appName="RCM SPARCC" enabled={isFeatureEnabled('opsChief')} />
      <PulseOrb enabled={isFeatureEnabled('pulse')} />
      <TaskOrb enabled={isFeatureEnabled('tasks')} />
      <AskItem appName="RCM" enabled={isFeatureEnabled('askItem')} />
      <PageKbPanel enabled={isFeatureEnabled('pageKb')} />
    </>
  );
}

/**
 * Auth-protected layout wrapper
 */
function AuthProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return <LoadingScreen />;
  }

  // Build user object for navbar
  const user: NavbarUser = {
    name: session?.user?.name || 'Guest',
    email: session?.user?.email || '',
  };

  return (
    <AISettingsProvider>
      <ModeProvider>
        <PageTitleProvider>
          <PageKbProvider>
            <AppLayoutInner
              commandPaletteOpen={commandPaletteOpen}
              setCommandPaletteOpen={setCommandPaletteOpen}
              user={user}
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
 * Wraps all authenticated pages with shell components
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
