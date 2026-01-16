/**
 * AI Settings Configuration
 *
 * Manages AI feature toggles for the application.
 * SUPER_ADMIN users can disable AI features for clients
 * who have policies against AI assistants.
 */

const AI_SETTINGS_KEY = 'sgm-ai-settings';

export interface AISettings {
  /** Master toggle for all AI orbs/widgets */
  aiOrbsEnabled: boolean;
  /** Individual toggles for specific features */
  features: {
    opsChief: boolean;
    askDock: boolean;
    pulse: boolean;
    tasks: boolean;
    pageKb: boolean;
  };
  /** Timestamp of last update */
  updatedAt: string;
  /** User who last updated */
  updatedBy?: string;
}

const DEFAULT_AI_SETTINGS: AISettings = {
  aiOrbsEnabled: true,
  features: {
    opsChief: true,
    askDock: true,
    pulse: true,
    tasks: true,
    pageKb: true,
  },
  updatedAt: new Date().toISOString(),
};

/**
 * Get current AI settings from localStorage
 */
export function getAISettings(): AISettings {
  if (typeof window === 'undefined') {
    return DEFAULT_AI_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(AI_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load AI settings:', error);
  }

  return DEFAULT_AI_SETTINGS;
}

/**
 * Save AI settings to localStorage
 */
export function saveAISettings(settings: Partial<AISettings>): AISettings {
  if (typeof window === 'undefined') {
    return DEFAULT_AI_SETTINGS;
  }

  const current = getAISettings();
  const updated: AISettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save AI settings:', error);
  }

  return updated;
}

/**
 * Toggle the master AI orbs switch
 */
export function toggleAIOrbs(enabled: boolean, updatedBy?: string): AISettings {
  return saveAISettings({
    aiOrbsEnabled: enabled,
    updatedBy,
  });
}

/**
 * Toggle a specific AI feature
 */
export function toggleAIFeature(
  feature: keyof AISettings['features'],
  enabled: boolean,
  updatedBy?: string
): AISettings {
  const current = getAISettings();
  return saveAISettings({
    features: {
      ...current.features,
      [feature]: enabled,
    },
    updatedBy,
  });
}

/**
 * Reset AI settings to defaults
 */
export function resetAISettings(): AISettings {
  if (typeof window === 'undefined') {
    return DEFAULT_AI_SETTINGS;
  }

  localStorage.removeItem(AI_SETTINGS_KEY);
  return DEFAULT_AI_SETTINGS;
}

/**
 * Check if a specific AI feature is enabled
 */
export function isAIFeatureEnabled(feature: keyof AISettings['features']): boolean {
  const settings = getAISettings();
  return settings.aiOrbsEnabled && settings.features[feature];
}
