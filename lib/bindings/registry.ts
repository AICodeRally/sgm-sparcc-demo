import type { IPolicyPort } from '@/lib/ports/policy.port';
import type { ITerritoryPort } from '@/lib/ports/territory.port';
import type { IApprovalPort } from '@/lib/ports/approval.port';
import type { IAuditPort } from '@/lib/ports/audit.port';
import type { ILinkPort } from '@/lib/ports/link.port';
import type { ISearchPort } from '@/lib/ports/search.port';
import type { IDocumentPort } from '@/lib/ports/document.port';
import type { IDocumentVersionPort } from '@/lib/ports/document-version.port';
import type { IFileStoragePort } from '@/lib/ports/file-storage.port';
import type { ICommitteePort } from '@/lib/ports/committee.port';
import type { IPlanTemplatePort } from '@/lib/ports/plan-template.port';
import type { IPlanPort } from '@/lib/ports/plan.port';
import type { IGovernanceFrameworkPort } from '@/lib/ports/governance-framework.port';

import type { BindingConfig } from '@/lib/config/binding-config';
import { loadBindingConfig } from '@/lib/config/binding-config';

/**
 * Provider Registry
 *
 * Resolves port interfaces to concrete provider implementations based on
 * binding configuration. Acts as a service locator for dependency injection.
 */
export class ProviderRegistry {
  private config: BindingConfig;

  constructor(config?: BindingConfig) {
    this.config = config || loadBindingConfig();
  }

  /**
   * Get Policy provider
   */
  getPolicy(): IPolicyPort {
    const mode = this.config.providers.policy;

    switch (mode) {
      case 'synthetic':
        // Import and return synthetic provider (dynamic import for tree-shaking)
        const { SyntheticPolicyProvider } = require('@/lib/bindings/synthetic/policy.synthetic');
        return new SyntheticPolicyProvider();

      case 'mapped':
        throw new Error('Mapped policy provider not implemented yet');

      case 'live':
        const { LivePolicyProvider } = require('@/lib/bindings/live/policy.live');
        return new LivePolicyProvider();

      default:
        throw new Error(`Unknown binding mode for policy: ${mode}`);
    }
  }

  /**
   * Get Territory provider
   */
  getTerritory(): ITerritoryPort {
    const mode = this.config.providers.territory;

    switch (mode) {
      case 'synthetic':
        const { SyntheticTerritoryProvider } = require('@/lib/bindings/synthetic/territory.synthetic');
        return new SyntheticTerritoryProvider();

      case 'mapped':
        throw new Error('Mapped territory provider not implemented yet');

      case 'live':
        const { LiveTerritoryProvider } = require('@/lib/bindings/live/territory.live');
        return new LiveTerritoryProvider();

      default:
        throw new Error(`Unknown binding mode for territory: ${mode}`);
    }
  }

  /**
   * Get Approval provider
   */
  getApproval(): IApprovalPort {
    const mode = this.config.providers.approval;

    switch (mode) {
      case 'synthetic':
        const { SyntheticApprovalProvider } = require('@/lib/bindings/synthetic/approval.synthetic');
        return new SyntheticApprovalProvider();

      case 'mapped':
        throw new Error('Mapped approval provider not implemented yet');

      case 'live':
        const { LiveApprovalProvider } = require('@/lib/bindings/live/approval.live');
        return new LiveApprovalProvider();

      default:
        throw new Error(`Unknown binding mode for approval: ${mode}`);
    }
  }

  /**
   * Get Audit provider
   */
  getAudit(): IAuditPort {
    const mode = this.config.providers.audit;

    switch (mode) {
      case 'synthetic':
        const { SyntheticAuditProvider } = require('@/lib/bindings/synthetic/audit.synthetic');
        return new SyntheticAuditProvider();

      case 'mapped':
        throw new Error('Mapped audit provider not implemented yet');

      case 'live':
        const { LiveAuditProvider } = require('@/lib/bindings/live/audit.live');
        return new LiveAuditProvider();

      default:
        throw new Error(`Unknown binding mode for audit: ${mode}`);
    }
  }

  /**
   * Get Link provider
   */
  getLink(): ILinkPort {
    const mode = this.config.providers.link;

    switch (mode) {
      case 'synthetic':
        const { SyntheticLinkProvider } = require('@/lib/bindings/synthetic/link.synthetic');
        return new SyntheticLinkProvider();

      case 'mapped':
        throw new Error('Mapped link provider not implemented yet');

      case 'live':
        const { LiveLinkProvider } = require('@/lib/bindings/live/link.live');
        return new LiveLinkProvider();

      default:
        throw new Error(`Unknown binding mode for link: ${mode}`);
    }
  }

  /**
   * Get Search provider
   */
  getSearch(): ISearchPort {
    const mode = this.config.providers.search;

    switch (mode) {
      case 'synthetic':
        const { SyntheticSearchProvider } = require('@/lib/bindings/synthetic/search.synthetic');
        return new SyntheticSearchProvider();

      case 'mapped':
        throw new Error('Mapped search provider not implemented yet');

      case 'live':
        const { LiveSearchProvider } = require('@/lib/bindings/live/search.live');
        return new LiveSearchProvider();

      default:
        throw new Error(`Unknown binding mode for search: ${mode}`);
    }
  }

  /**
   * Get Document provider
   */
  getDocument(): IDocumentPort {
    const mode = this.config.providers.document;

    switch (mode) {
      case 'synthetic':
        const { SyntheticDocumentProvider } = require('@/lib/bindings/synthetic/document.synthetic');
        return new SyntheticDocumentProvider();

      case 'mapped':
        throw new Error('Mapped document provider not implemented yet');

      case 'live':
        const { LiveDocumentProvider } = require('@/lib/bindings/live/document.live');
        return new LiveDocumentProvider();

      default:
        throw new Error(`Unknown binding mode for document: ${mode}`);
    }
  }

  /**
   * Get Committee provider
   */
  getCommittee(): ICommitteePort {
    const mode = this.config.providers.committee;

    switch (mode) {
      case 'synthetic':
        const { SyntheticCommitteeProvider } = require('@/lib/bindings/synthetic/committee.synthetic');
        return new SyntheticCommitteeProvider();

      case 'mapped':
        throw new Error('Mapped committee provider not implemented yet');

      case 'live':
        const { LiveCommitteeProvider } = require('@/lib/bindings/live/committee.live');
        return new LiveCommitteeProvider();

      default:
        throw new Error(`Unknown binding mode for committee: ${mode}`);
    }
  }

  /**
   * Get Plan Template provider
   */
  getPlanTemplate(): IPlanTemplatePort {
    const mode = this.config.providers.planTemplate;

    switch (mode) {
      case 'synthetic':
        const { SyntheticPlanTemplateProvider } = require('@/lib/bindings/synthetic/plan-template.synthetic');
        return new SyntheticPlanTemplateProvider();

      case 'mapped':
        throw new Error('Mapped plan template provider not implemented yet');

      case 'live':
        const { LivePlanTemplateProvider } = require('@/lib/bindings/live/plan-template.live');
        return new LivePlanTemplateProvider();

      default:
        throw new Error(`Unknown binding mode for plan template: ${mode}`);
    }
  }

  /**
   * Get Plan provider
   */
  getPlan(): IPlanPort {
    const mode = this.config.providers.plan;

    switch (mode) {
      case 'synthetic':
        const { SyntheticPlanProvider } = require('@/lib/bindings/synthetic/plan.synthetic');
        return new SyntheticPlanProvider();

      case 'mapped':
        throw new Error('Mapped plan provider not implemented yet');

      case 'live':
        const { LivePlanProvider } = require('@/lib/bindings/live/plan.live');
        return new LivePlanProvider();

      default:
        throw new Error(`Unknown binding mode for plan: ${mode}`);
    }
  }

  /**
   * Get Governance Framework provider
   */
  getGovernanceFramework(): IGovernanceFrameworkPort {
    const mode = this.config.providers.governanceFramework || 'synthetic';

    switch (mode) {
      case 'synthetic':
        const { SyntheticGovernanceFrameworkProvider } = require('@/lib/bindings/synthetic/governance-framework.synthetic');
        return new SyntheticGovernanceFrameworkProvider();

      case 'mapped':
        throw new Error('Mapped governance framework provider not implemented yet');

      case 'live':
        const { LiveGovernanceFrameworkProvider } = require('@/lib/bindings/live/governance-framework.live');
        return new LiveGovernanceFrameworkProvider();

      default:
        throw new Error(`Unknown binding mode for governance framework: ${mode}`);
    }
  }

  /**
   * Get Document Version provider
   * Full provenance tracking for document versions
   */
  getDocumentVersion(): IDocumentVersionPort {
    const mode = this.config.providers.documentVersion;

    switch (mode) {
      case 'synthetic':
        const { SyntheticDocumentVersionProvider } = require('@/lib/bindings/synthetic/document-version.synthetic');
        return new SyntheticDocumentVersionProvider();

      case 'mapped':
        throw new Error('Mapped document version provider not implemented yet');

      case 'live':
        const { LiveDocumentVersionProvider } = require('@/lib/bindings/live/document-version.live');
        return new LiveDocumentVersionProvider();

      default:
        throw new Error(`Unknown binding mode for document version: ${mode}`);
    }
  }

  /**
   * Get File Storage provider
   */
  getFileStorage(): IFileStoragePort {
    const mode = this.config.providers.fileStorage;

    switch (mode) {
      case 'synthetic':
        const { SyntheticFileStorageProvider } = require('@/lib/bindings/synthetic/file-storage.synthetic');
        return new SyntheticFileStorageProvider();

      case 'mapped':
        throw new Error('Mapped file storage provider not implemented yet');

      case 'live':
        const { LiveFileStorageProvider } = require('@/lib/bindings/live/file-storage.live');
        return new LiveFileStorageProvider();

      default:
        throw new Error(`Unknown binding mode for file storage: ${mode}`);
    }
  }

  /**
   * Get current binding configuration
   */
  getConfig(): BindingConfig {
    return this.config;
  }

  /**
   * Get diagnostic information about active bindings
   */
  getDiagnostics() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const hasSchemaParam = databaseUrl.includes('schema=sgm_summit_demo');
    const hasLiveProvider = Object.values(this.config.providers).some(
      (mode) => mode === 'live'
    );

    return {
      providers: this.config.providers,
      modes: {
        policy: this.config.providers.policy,
        territory: this.config.providers.territory,
        approval: this.config.providers.approval,
        audit: this.config.providers.audit,
        link: this.config.providers.link,
        search: this.config.providers.search,
        document: this.config.providers.document,
        documentVersion: this.config.providers.documentVersion,
        committee: this.config.providers.committee,
        planTemplate: this.config.providers.planTemplate,
        plan: this.config.providers.plan,
        governanceFramework: this.config.providers.governanceFramework,
        fileStorage: this.config.providers.fileStorage,
      },
      hasExternalDependencies: Object.values(this.config.providers).some(
        (mode) => mode !== 'synthetic'
      ),
      database: {
        hasUrl: !!databaseUrl,
        hasSchemaParam,
        schemaTarget: hasSchemaParam ? 'sgm_summit_demo' : 'MISSING/INVALID',
        isLiveMode: hasLiveProvider,
      },
    };
  }
}

/**
 * Singleton registry instance
 */
let _registry: ProviderRegistry | null = null;

export function getRegistry(): ProviderRegistry {
  if (!_registry) {
    _registry = new ProviderRegistry();
  }
  return _registry;
}

/**
 * Reset registry (useful for testing)
 */
export function resetRegistry(): void {
  _registry = null;
}
