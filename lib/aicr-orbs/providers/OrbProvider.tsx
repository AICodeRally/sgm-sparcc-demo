'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { OrbManifest, DockPosition } from '../types/manifest';
import type { OrbId, OrbState, OrbStatus } from '../types/orb';
import type { Signal } from '../types/signals';

export interface DockSettings {
  position: DockPosition;
  autoHide: boolean;
  magnification: boolean;
  bounceOnActivity: boolean;
  showBadges: boolean;
  orbOrder: OrbId[];
  orbVisibility: Record<OrbId, boolean>;
}

interface OrbContextValue {
  manifest: OrbManifest;
  orbStates: Record<OrbId, OrbState>;
  activeOrb: OrbId | null;
  setActiveOrb: (orb: OrbId | null) => void;
  dockSettings: DockSettings;
  updateDockSettings: (settings: Partial<DockSettings>) => void;
  signals: Signal[];
  markSignalRead: (signalId: string) => void;
  getOrbBadgeCount: (orbId: OrbId) => number;
}

const OrbContext = createContext<OrbContextValue | null>(null);

const DEFAULT_DOCK_SETTINGS: DockSettings = {
  position: 'bottom',
  autoHide: false,
  magnification: true,
  bounceOnActivity: true,
  showBadges: true,
  orbOrder: ['ask', 'ops', 'pulse', 'tasks', 'kb'],
  orbVisibility: {
    ask: true,
    ops: true,
    pulse: true,
    tasks: true,
    kb: true,
  },
};

interface OrbProviderProps {
  manifest: OrbManifest;
  children: ReactNode;
  /** External settings override (for integration with app-level settings) */
  externalSettings?: Partial<DockSettings>;
  /** Callback when settings change (for syncing with app-level settings) */
  onSettingsChange?: (settings: DockSettings) => void;
}

export function OrbProvider({ manifest, children, externalSettings, onSettingsChange }: OrbProviderProps) {
  const [activeOrb, setActiveOrb] = useState<OrbId | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [dockSettings, setDockSettings] = useState<DockSettings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aicr-dock-settings');
      if (saved) {
        try {
          return { ...DEFAULT_DOCK_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      ...DEFAULT_DOCK_SETTINGS,
      position: manifest.dock?.position ?? 'bottom',
      autoHide: manifest.dock?.autoHide ?? false,
      magnification: manifest.dock?.magnification ?? true,
    };
  });

  // Initialize orb states
  const [orbStates, setOrbStates] = useState<Record<OrbId, OrbState>>(() => {
    const states: Record<OrbId, OrbState> = {} as Record<OrbId, OrbState>;
    const orbIds: OrbId[] = ['ask', 'ops', 'pulse', 'tasks', 'kb'];

    for (const id of orbIds) {
      const config = manifest.orbs[id];
      states[id] = {
        id,
        status: config?.enabled ? 'checking' : 'disconnected',
        badgeCount: 0,
      };
    }
    return states;
  });

  // Sync with external settings when they change
  useEffect(() => {
    if (externalSettings) {
      setDockSettings((prev) => ({ ...prev, ...externalSettings }));
    }
  }, [externalSettings]);

  // Persist dock settings to localStorage and notify parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aicr-dock-settings', JSON.stringify(dockSettings));
    }
    onSettingsChange?.(dockSettings);
  }, [dockSettings, onSettingsChange]);

  const updateDockSettings = (newSettings: Partial<DockSettings>) => {
    setDockSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const markSignalRead = (signalId: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === signalId ? { ...s, read: true } : s))
    );
  };

  const getOrbBadgeCount = (orbId: OrbId): number => {
    return signals.filter((s) => s.orbId === orbId && !s.read).length;
  };

  const value: OrbContextValue = {
    manifest,
    orbStates,
    activeOrb,
    setActiveOrb,
    dockSettings,
    updateDockSettings,
    signals,
    markSignalRead,
    getOrbBadgeCount,
  };

  return <OrbContext.Provider value={value}>{children}</OrbContext.Provider>;
}

export function useOrbs() {
  const context = useContext(OrbContext);
  if (!context) {
    throw new Error('useOrbs must be used within an OrbProvider');
  }
  return context;
}
