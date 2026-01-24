/**
 * Binding Configuration
 *
 * Defines which provider implementation to use for each port.
 * Modes: synthetic (in-memory) | mapped (external API) | live (Prisma DB)
 */

export type BindingMode = 'synthetic' | 'mapped' | 'live';

export interface BindingConfig {
  /**
   * Provider mode selection per port
   */
  providers: {
    policy: BindingMode;
    territory: BindingMode;
    approval: BindingMode;
    audit: BindingMode;
    link: BindingMode;
    search: BindingMode;
    document: BindingMode;
    documentVersion: BindingMode;
    committee: BindingMode;
    planTemplate: BindingMode;
    plan: BindingMode;
    governanceFramework: BindingMode;
    checklistProgress: BindingMode;
    fileStorage: BindingMode;
  };

  /**
   * Data loading configuration
   * Controls which data types are loaded at startup
   */
  dataLoad: {
    /** Load demo data (sample data for demonstrations) */
    demo: boolean;
    /** Load template data (baseline governance documents) */
    templates: boolean;
  };

  /**
   * @deprecated Use dataLoad.demo instead
   */
  demoData?: {
    enabled: boolean;
  };

  /**
   * Mapped mode configuration (when mode = 'mapped')
   */
  mapped?: {
    apiBaseUrl: string;
    apiKey?: string;
    timeout?: number;
  };

  /**
   * Live mode configuration (when mode = 'live')
   */
  live?: {
    databaseUrl: string;
    poolSize?: number;
  };
}

/**
 * Default configuration (synthetic mode for all providers)
 */
export const defaultBindingConfig: BindingConfig = {
  providers: {
    policy: 'synthetic',
    territory: 'synthetic',
    approval: 'synthetic',
    audit: 'synthetic',
    link: 'synthetic',
    search: 'synthetic',
    document: 'synthetic',
    documentVersion: 'synthetic',
    committee: 'synthetic',
    planTemplate: 'synthetic',
    plan: 'synthetic',
    governanceFramework: 'synthetic',
    checklistProgress: 'synthetic',
    fileStorage: 'synthetic',
  },
  dataLoad: {
    demo: false,
    templates: false,
  },
};

/**
 * Load configuration from environment variables.
 * Auto-detects DATABASE_URL: defaults to 'live' when present, 'synthetic' otherwise.
 */
export function loadBindingConfig(): BindingConfig {
  const hasDatabase = !!process.env.DATABASE_URL;
  const defaultMode: BindingMode = hasDatabase ? 'live' : 'synthetic';
  const mode = (process.env.BINDING_MODE || defaultMode) as BindingMode;

  return {
    providers: {
      policy: (process.env.BINDING_MODE_POLICY || mode) as BindingMode,
      territory: (process.env.BINDING_MODE_TERRITORY || mode) as BindingMode,
      approval: (process.env.BINDING_MODE_APPROVAL || mode) as BindingMode,
      audit: (process.env.BINDING_MODE_AUDIT || mode) as BindingMode,
      link: (process.env.BINDING_MODE_LINK || mode) as BindingMode,
      search: (process.env.BINDING_MODE_SEARCH || mode) as BindingMode,
      document: (process.env.BINDING_MODE_DOCUMENT || mode) as BindingMode,
      documentVersion: (process.env.BINDING_MODE_DOCUMENT_VERSION || mode) as BindingMode,
      committee: (process.env.BINDING_MODE_COMMITTEE || mode) as BindingMode,
      planTemplate: (process.env.BINDING_MODE_PLAN_TEMPLATE || mode) as BindingMode,
      plan: (process.env.BINDING_MODE_PLAN || mode) as BindingMode,
      governanceFramework: (process.env.BINDING_MODE_GOVERNANCE_FRAMEWORK || mode) as BindingMode,
      checklistProgress: (process.env.BINDING_MODE_CHECKLIST_PROGRESS || mode) as BindingMode,
      fileStorage: (process.env.BINDING_MODE_FILE_STORAGE || mode) as BindingMode,
    },
    dataLoad: {
      demo: process.env.ENABLE_DEMO_DATA === 'true',
      templates: process.env.ENABLE_TEMPLATE_DATA === 'true',
    },
    // Legacy support
    demoData: {
      enabled: process.env.ENABLE_DEMO_DATA === 'true',
    },
    mapped: process.env.EXTERNAL_API_URL
      ? {
          apiBaseUrl: process.env.EXTERNAL_API_URL,
          apiKey: process.env.EXTERNAL_API_KEY,
          timeout: parseInt(process.env.API_TIMEOUT || '5000'),
        }
      : undefined,
    live: process.env.DATABASE_URL
      ? {
          databaseUrl: process.env.DATABASE_URL,
          poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
        }
      : undefined,
  };
}

/**
 * Check if demo data is enabled
 */
export function isDemoDataEnabled(): boolean {
  return process.env.ENABLE_DEMO_DATA === 'true';
}

/**
 * Check if template data is enabled
 */
export function isTemplateDataEnabled(): boolean {
  return process.env.ENABLE_TEMPLATE_DATA === 'true';
}

/**
 * Get current data load configuration
 */
export function getDataLoadConfig(): { demo: boolean; templates: boolean } {
  return {
    demo: process.env.ENABLE_DEMO_DATA === 'true',
    templates: process.env.ENABLE_TEMPLATE_DATA === 'true',
  };
}
