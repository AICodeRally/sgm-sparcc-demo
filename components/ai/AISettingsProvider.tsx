'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AISettings,
  getAISettings,
  saveAISettings,
  toggleAIOrbs,
  toggleAIFeature,
  resetAISettings,
} from '@/lib/config/ai-settings';

interface AISettingsContextType {
  settings: AISettings;
  /** Check if AI orbs are globally enabled */
  aiEnabled: boolean;
  /** Check if a specific feature is enabled */
  isFeatureEnabled: (feature: keyof AISettings['features']) => boolean;
  /** Toggle master AI switch */
  setAIEnabled: (enabled: boolean, updatedBy?: string) => void;
  /** Toggle a specific feature */
  setFeatureEnabled: (feature: keyof AISettings['features'], enabled: boolean, updatedBy?: string) => void;
  /** Update multiple settings at once */
  updateSettings: (settings: Partial<AISettings>) => void;
  /** Reset to defaults */
  reset: () => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export function AISettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(getAISettings);

  // Sync with localStorage on mount and listen for changes
  useEffect(() => {
    // Load initial settings
    setSettings(getAISettings());

    // Listen for storage events (changes from other tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sgm-ai-settings') {
        setSettings(getAISettings());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const aiEnabled = settings.aiOrbsEnabled;

  const isFeatureEnabled = useCallback(
    (feature: keyof AISettings['features']) => {
      return settings.aiOrbsEnabled && settings.features[feature];
    },
    [settings]
  );

  const setAIEnabled = useCallback((enabled: boolean, updatedBy?: string) => {
    const updated = toggleAIOrbs(enabled, updatedBy);
    setSettings(updated);
  }, []);

  const setFeatureEnabled = useCallback(
    (feature: keyof AISettings['features'], enabled: boolean, updatedBy?: string) => {
      const updated = toggleAIFeature(feature, enabled, updatedBy);
      setSettings(updated);
    },
    []
  );

  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    const updated = saveAISettings(newSettings);
    setSettings(updated);
  }, []);

  const reset = useCallback(() => {
    const defaults = resetAISettings();
    setSettings(defaults);
  }, []);

  return (
    <AISettingsContext.Provider
      value={{
        settings,
        aiEnabled,
        isFeatureEnabled,
        setAIEnabled,
        setFeatureEnabled,
        updateSettings,
        reset,
      }}
    >
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
}

/**
 * Hook for checking if a specific AI feature is enabled
 * Useful for conditional rendering of AI components
 */
export function useAIFeature(feature: keyof AISettings['features']): boolean {
  const { isFeatureEnabled } = useAISettings();
  return isFeatureEnabled(feature);
}
