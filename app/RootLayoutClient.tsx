"use client";

import React, { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ModeProvider, useMode } from "@/lib/auth/mode-context";
import { OperationalMode } from "@/types/operational-mode";
// import { AppShell } from "@rally/app-shell"; // Rally package not yet installed
import { aiManifest } from "../ai.manifest";
import { CommandPalette } from "@/components/CommandPalette";
import { OpsChiefOrb } from "@/components/ai/OpsChiefOrb";
import { AskDock } from "@/components/ai/AskDock";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTitleProvider } from "@/components/PageTitle";
import { WhatsNewModal } from "@/components/modals/WhatsNewModal";
import { PageKbProvider } from "@/components/kb/PageKbProvider";
import { PageKbPanel } from "@/components/kb/PageKbPanel";
import { getActiveModule } from "@/lib/config/module-registry";
import { ThemeProvider } from "@/components/ThemeProvider";
import { applyThemeVars, getStoredTheme } from "@/lib/config/themes";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Inner layout component with access to mode context
 */
function LayoutWithModeContext({ children, commandPaletteOpen, setCommandPaletteOpen }: {
  children: React.ReactNode;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}) {
  const { switchMode, canSwitchMode } = useMode();

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
      <main className="flex-1 pb-24">
        {children}
      </main>
      <Footer />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      {/* What's New Modal */}
      <WhatsNewModal />
      {/* AI Widgets */}
      <OpsChiefOrb appName="SGM SPARCC" enabled={true} />
      <AskDock appName="SGM" enabled={true} />
      <PageKbPanel enabled={true} />
    </div>
  );
}

/**
 * Client-side root layout wrapper
 * Handles AI components and keyboard shortcuts initialization
 */
export function RootLayoutClient({ children }: RootLayoutClientProps) {
  // Command Palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const activeModule = getActiveModule();

  useEffect(() => {
    // Apply module defaults, then override with stored theme if present
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

  return (
    <SessionProvider>
      <ThemeProvider>
        <ModeProvider>
          <PageTitleProvider>
            <PageKbProvider>
              <LayoutWithModeContext
                commandPaletteOpen={commandPaletteOpen}
                setCommandPaletteOpen={setCommandPaletteOpen}
              >
                {children}
              </LayoutWithModeContext>
            </PageKbProvider>
          </PageTitleProvider>
        </ModeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
