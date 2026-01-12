import { z } from 'zod';

/**
 * Link Type (relationship semantics)
 */
export const LinkTypeSchema = z.enum([
  // Hierarchical
  'parent_of',
  'child_of',

  // Versioning
  'supersedes',
  'superseded_by',

  // Approval
  'requires_approval_from',
  'approved_by',

  // Territory
  'covers_territory',
  'covered_by_policy',

  // Reference
  'references',
  'referenced_by',

  // Dependency
  'depends_on',
  'dependency_of',

  // Association (generic)
  'related_to',
]);

export type LinkType = z.infer<typeof LinkTypeSchema>;

/**
 * Link Contract - Entity relationships (ConnectItem pattern)
 *
 * Represents directed relationships between entities.
 * Enables graph traversal, coverage matrices, and impact analysis.
 */
export const LinkSchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),

  // Source Entity (from)
  sourceEntityType: z.string(), // e.g., "policy", "territory"
  sourceEntityId: z.string(),
  sourceEntityName: z.string().optional(), // For display

  // Target Entity (to)
  targetEntityType: z.string(),
  targetEntityId: z.string(),
  targetEntityName: z.string().optional(),

  // Link Semantics
  linkType: LinkTypeSchema,
  bidirectional: z.boolean().default(false), // If true, implies reverse link exists

  // Metadata
  strength: z.number().min(0).max(1).optional(), // 0-1 for weighted graphs
  confidence: z.number().min(0).max(1).optional(), // 0-1 for probabilistic links
  description: z.string().max(500).optional(),

  // Lifecycle
  effectiveDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),

  // Audit
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  deletedBy: z.string().optional(),
  deletedAt: z.coerce.date().optional(),

  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Link = z.infer<typeof LinkSchema>;

/**
 * Create Link
 */
export const CreateLinkSchema = LinkSchema.omit({
  id: true,
  createdAt: true,
  deletedBy: true,
  deletedAt: true,
});

export type CreateLink = z.infer<typeof CreateLinkSchema>;

/**
 * Link Query Filters
 */
export const LinkFiltersSchema = z.object({
  tenantId: z.string().optional(),
  sourceEntityType: z.string().optional(),
  sourceEntityId: z.string().optional(),
  targetEntityType: z.string().optional(),
  targetEntityId: z.string().optional(),
  linkType: LinkTypeSchema.optional(),
  includeDeleted: z.boolean().default(false),
}).partial();

export type LinkFilters = z.infer<typeof LinkFiltersSchema>;

/**
 * Link Graph Node (for UI rendering)
 */
export const LinkGraphNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  data: z.record(z.string(), z.any()).optional(),
});

export type LinkGraphNode = z.infer<typeof LinkGraphNodeSchema>;

/**
 * Link Graph Edge (for UI rendering)
 */
export const LinkGraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  linkType: LinkTypeSchema,
  label: z.string().optional(),
});

export type LinkGraphEdge = z.infer<typeof LinkGraphEdgeSchema>;

/**
 * Link Graph (for visualization)
 */
export const LinkGraphSchema = z.object({
  nodes: z.array(LinkGraphNodeSchema),
  edges: z.array(LinkGraphEdgeSchema),
});

export type LinkGraph = z.infer<typeof LinkGraphSchema>;

/**
 * Coverage Matrix (Entity A x Entity B relationships)
 */
export const CoverageMatrixSchema = z.object({
  rowEntityType: z.string(), // e.g., "policy"
  columnEntityType: z.string(), // e.g., "territory"
  rows: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  columns: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  cells: z.array(z.object({
    rowId: z.string(),
    columnId: z.string(),
    covered: z.boolean(),
    linkId: z.string().optional(),
  })),
});

export type CoverageMatrix = z.infer<typeof CoverageMatrixSchema>;
