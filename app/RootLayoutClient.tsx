"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@rally/app-shell";
import { aiManifest } from "../ai.manifest";
import { CommandPalette } from "@/components/CommandPalette";
import { OpsChiefOrb } from "@/components/ai/OpsChiefOrb";
import { AskDock } from "@/components/ai/AskDock";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Client-side root layout wrapper
 * Handles AppShell and AI Backbone initialization
 */
export function RootLayoutClient({ children }: RootLayoutClientProps) {
  // Default values - will be overridden by [tenant] layout context in real usage
  const tenantId = "platform";
  const appId = "sgm-sparcc";
  const tier = "edge" as const;

  // Command Palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppShell
      tenantId={tenantId}
      appId={appId}
      tier={tier}
      manifest={aiManifest}
    >
      {children}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      {/* AI Widgets */}
      <OpsChiefOrb appName="SGM SPARCC" enabled={true} />
      <AskDock appName="SGM" enabled={true} />
    </AppShell>
  );
}
