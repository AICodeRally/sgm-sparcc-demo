import { z } from 'zod';

/**
 * SPM Knowledge Base Contract
 * The definitive Sales Performance Management knowledge taxonomy
 *
 * Structure: Pillars → Categories → Components → Framework Cards
 */

// =============================================================================
// ENUMS
// =============================================================================

export const SPMPillarSchema = z.enum([
  'SALES_PLANNING',
  'ICM',
  'SALES_INTELLIGENCE',
  'GOVERNANCE_COMPLIANCE',
  'TECHNOLOGY_PLATFORMS',
  'STRATEGY_DESIGN',
  'IMPLEMENTATION_CHANGE',
  'LEGAL_REGULATORY',
]);
export type SPMPillar = z.infer<typeof SPMPillarSchema>;

export const SPMPillarMetadata: Record<SPMPillar, { name: string; description: string; color: string }> = {
  SALES_PLANNING: {
    name: 'Sales Planning',
    description: 'Territory, quota, capacity, and coverage models',
    color: '#2563eb', // blue
  },
  ICM: {
    name: 'Incentive Compensation Management',
    description: 'Plan design, calculations, payments, and statements',
    color: '#16a34a', // green
  },
  SALES_INTELLIGENCE: {
    name: 'Sales Intelligence & Analytics',
    description: 'Reporting, forecasting, AI/ML, and predictive analytics',
    color: '#9333ea', // purple
  },
  GOVERNANCE_COMPLIANCE: {
    name: 'Governance & Compliance',
    description: 'SOX, 409A, clawback, audit, controls, and approvals',
    color: '#dc2626', // red
  },
  TECHNOLOGY_PLATFORMS: {
    name: 'Technology & Platforms',
    description: 'SPM vendors, integrations, data architecture, and APIs',
    color: '#0891b2', // cyan
  },
  STRATEGY_DESIGN: {
    name: 'Strategy & Design',
    description: 'Pay philosophy, behavioral economics, benchmarking, and plan modeling',
    color: '#ea580c', // orange
  },
  IMPLEMENTATION_CHANGE: {
    name: 'Implementation & Change',
    description: 'Project methodology, change management, training, and adoption',
    color: '#ca8a04', // yellow
  },
  LEGAL_REGULATORY: {
    name: 'Legal & Regulatory',
    description: 'State wage laws, international requirements, employment law',
    color: '#4f46e5', // indigo
  },
};

export const CardTypeSchema = z.enum([
  'concept',    // Definition, Why, Best Practices
  'mechanic',   // + How It Works, Example, Watch Out
  'process',    // + Flow, Inputs/Outputs, Systems, Timing
  'role',       // + Responsibilities, Skills, Interactions
  'regulation', // + Legal Basis, Requirements, Penalties
]);
export type CardType = z.infer<typeof CardTypeSchema>;

export const AudienceLevelSchema = z.enum([
  'Practitioner',  // Day-to-day users (comp analysts, sales ops)
  'Executive',     // Decision makers (CRO, CFO, VP Sales)
  'Implementer',   // SI partners, consultants, admins
]);
export type AudienceLevel = z.infer<typeof AudienceLevelSchema>;

// =============================================================================
// FRAMEWORK CARD SCHEMA
// =============================================================================

export const RoleUsageSchema = z.object({
  role: z.string(),
  howTheyUseIt: z.string(),
});
export type RoleUsage = z.infer<typeof RoleUsageSchema>;

export const ProcessFlowSchema = z.object({
  upstream: z.array(z.string()).optional(),
  downstream: z.array(z.string()).optional(),
  diagram: z.string().optional(), // ASCII or mermaid diagram
});
export type ProcessFlow = z.infer<typeof ProcessFlowSchema>;

export const VendorTerminologySchema = z.record(z.string(), z.string()).optional();
export type VendorTerminology = z.infer<typeof VendorTerminologySchema>;

export const FrameworkCardSchema = z.object({
  // Identity
  id: z.string(),
  keyword: z.string(),
  aliases: z.array(z.string()).default([]),

  // Classification
  pillar: SPMPillarSchema,
  category: z.string(),
  component: z.string(),
  cardType: CardTypeSchema,

  // Core Content (all cards)
  definition: z.string(),
  whyItMatters: z.string().optional(),

  // Extended Content (mechanic+ cards)
  extendedDefinition: z.string().optional(),
  howItWorks: z.string().optional(),
  example: z.string().optional(),

  // Audience & Users
  userTypes: z.array(z.string()).default([]),
  audienceLevels: z.array(AudienceLevelSchema).default(['Practitioner']),
  whoUsesIt: z.array(RoleUsageSchema).optional(),

  // Guidance
  bestPractices: z.array(z.string()).default([]),
  watchOutFor: z.array(z.string()).default([]),
  commonMistakes: z.array(z.string()).optional(),

  // Relationships
  relatedTerms: z.array(z.string()).default([]),
  oppositeTerms: z.array(z.string()).optional(),

  // Process (process cards)
  processFlow: ProcessFlowSchema.optional(),
  inputs: z.array(z.string()).optional(),
  outputs: z.array(z.string()).optional(),
  systemsInvolved: z.array(z.string()).optional(),
  timing: z.string().optional(),

  // Vendor & Industry
  vendorTerminology: VendorTerminologySchema,
  sourceAuthority: z.array(z.string()).default([]),

  // Regulatory (regulation cards)
  regulatoryNotes: z.string().optional(),
  legalBasis: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  penalties: z.string().optional(),

  // Metadata
  tags: z.array(z.string()).default([]),
  version: z.string().default('1.0.0'),
  lastUpdated: z.coerce.date().optional(),
});
export type FrameworkCard = z.infer<typeof FrameworkCardSchema>;

// =============================================================================
// CATEGORY & COMPONENT SCHEMAS
// =============================================================================

export const SPMComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  cardCount: z.number().default(0),
});
export type SPMComponent = z.infer<typeof SPMComponentSchema>;

export const SPMCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  components: z.array(SPMComponentSchema).default([]),
  cardCount: z.number().default(0),
});
export type SPMCategory = z.infer<typeof SPMCategorySchema>;

export const SPMPillarStructureSchema = z.object({
  id: z.string(),
  pillar: SPMPillarSchema,
  name: z.string(),
  description: z.string(),
  color: z.string(),
  categories: z.array(SPMCategorySchema).default([]),
  totalCards: z.number().default(0),
});
export type SPMPillarStructure = z.infer<typeof SPMPillarStructureSchema>;

// =============================================================================
// KNOWLEDGE BASE SCHEMA
// =============================================================================

export const SPMKnowledgeBaseSchema = z.object({
  version: z.string(),
  lastUpdated: z.coerce.date(),
  pillars: z.array(SPMPillarStructureSchema),
  cards: z.array(FrameworkCardSchema),
  stats: z.object({
    totalPillars: z.number(),
    totalCategories: z.number(),
    totalComponents: z.number(),
    totalCards: z.number(),
    cardsByType: z.record(CardTypeSchema, z.number()),
    cardsByPillar: z.record(SPMPillarSchema, z.number()),
  }),
});
export type SPMKnowledgeBase = z.infer<typeof SPMKnowledgeBaseSchema>;

// =============================================================================
// SEARCH & FILTER SCHEMAS
// =============================================================================

export const KBSearchFiltersSchema = z.object({
  query: z.string().optional(),
  pillar: SPMPillarSchema.optional(),
  category: z.string().optional(),
  cardType: CardTypeSchema.optional(),
  audienceLevel: AudienceLevelSchema.optional(),
  userType: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export type KBSearchFilters = z.infer<typeof KBSearchFiltersSchema>;

export const KBSearchResultSchema = z.object({
  card: FrameworkCardSchema,
  score: z.number(),
  highlights: z.record(z.string(), z.array(z.string())).optional(),
});
export type KBSearchResult = z.infer<typeof KBSearchResultSchema>;

// =============================================================================
// RAG EXPORT SCHEMA
// =============================================================================

export const RAGChunkSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  keyword: z.string(),
  chunkType: z.enum(['definition', 'howItWorks', 'bestPractices', 'process', 'full']),
  content: z.string(),
  metadata: z.object({
    pillar: SPMPillarSchema,
    category: z.string(),
    cardType: CardTypeSchema,
    audienceLevels: z.array(AudienceLevelSchema),
    tags: z.array(z.string()),
  }),
});
export type RAGChunk = z.infer<typeof RAGChunkSchema>;

// =============================================================================
// MIGRATION SCHEMA (from old glossary format)
// =============================================================================

export const LegacyGlossaryEntrySchema = z.object({
  id: z.string(),
  keyword: z.string(),
  definition: z.string(),
  userType: z.string().optional(),
});
export type LegacyGlossaryEntry = z.infer<typeof LegacyGlossaryEntrySchema>;

export const MigrationMappingSchema = z.object({
  legacyId: z.string(),
  newCardId: z.string(),
  pillar: SPMPillarSchema,
  category: z.string(),
  component: z.string(),
  cardType: CardTypeSchema,
  enrichmentNeeded: z.array(z.string()), // Fields that need content
});
export type MigrationMapping = z.infer<typeof MigrationMappingSchema>;
