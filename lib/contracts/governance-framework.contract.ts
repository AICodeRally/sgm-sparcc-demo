import { z } from 'zod';
import { PlanTypeSchema } from './plan-template.contract';

/**
 * Governance Framework Contract
 * Defines schemas and types for SPM governance framework documents
 */

// =============================================================================
// ENUMS
// =============================================================================

export const FrameworkCategorySchema = z.enum([
  'METHODOLOGY',
  'STANDARDS',
  'COMPLIANCE',
  'BEST_PRACTICES',
  'REGULATORY',
  'INDUSTRY_SPECIFIC',
]);
export type FrameworkCategory = z.infer<typeof FrameworkCategorySchema>;

export const FrameworkStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'SUPERSEDED',
  'ARCHIVED',
]);
export type FrameworkStatus = z.infer<typeof FrameworkStatusSchema>;

// =============================================================================
// CONTENT TYPE
// =============================================================================

export const FrameworkContentTypeSchema = z.enum(['markdown', 'checklist']);
export type FrameworkContentType = z.infer<typeof FrameworkContentTypeSchema>;

// =============================================================================
// CHECKLIST SCHEMAS
// =============================================================================

export const ChecklistStepSchema = z.object({
  id: z.string(),
  number: z.number(),
  text: z.string(),
});
export type ChecklistStep = z.infer<typeof ChecklistStepSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  steps: z.array(ChecklistStepSchema),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const ChecklistPhaseSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  type: z.enum(['checklist', 'reference']),
  totalSteps: z.number(),
  items: z.array(ChecklistItemSchema),
});
export type ChecklistPhase = z.infer<typeof ChecklistPhaseSchema>;

export const ChecklistContentSchema = z.object({
  phases: z.array(ChecklistPhaseSchema),
});
export type ChecklistContent = z.infer<typeof ChecklistContentSchema>;

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const GovernanceFrameworkSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string(),
  code: z.string().regex(/^SPM-FW-\d{3}$/, 'Framework code must match pattern SPM-FW-000'),
  title: z.string().min(1).max(200),
  category: FrameworkCategorySchema,
  content: z.string().min(1), // Markdown content
  contentType: FrameworkContentTypeSchema.default('markdown'),
  structuredContent: z.any().nullable().default(null),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (x.y.z)'),
  status: FrameworkStatusSchema,
  isGlobal: z.boolean().default(false),
  isMandatory: z.boolean().default(false),
  applicableTo: z.array(PlanTypeSchema).optional(),
  createdBy: z.string().max(200),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type GovernanceFramework = z.infer<typeof GovernanceFrameworkSchema>;

// =============================================================================
// CRUD SCHEMAS
// =============================================================================

export const CreateGovernanceFrameworkSchema = GovernanceFrameworkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tenantId: z.string(),
  code: z.string().regex(/^SPM-FW-\d{3}$/),
  title: z.string().min(1).max(200),
  category: FrameworkCategorySchema,
  content: z.string().min(1),
  version: z.string().default('1.0.0'),
  status: FrameworkStatusSchema.default('DRAFT'),
  isGlobal: z.boolean().default(false),
  isMandatory: z.boolean().default(false),
});

export type CreateGovernanceFramework = z.infer<typeof CreateGovernanceFrameworkSchema>;

export const UpdateGovernanceFrameworkSchema = GovernanceFrameworkSchema.partial().required({
  id: true,
});

export type UpdateGovernanceFramework = z.infer<typeof UpdateGovernanceFrameworkSchema>;

// =============================================================================
// FILTER SCHEMAS
// =============================================================================

export const GovernanceFrameworkFiltersSchema = z.object({
  tenantId: z.string().optional(),
  category: FrameworkCategorySchema.optional(),
  status: FrameworkStatusSchema.optional(),
  isGlobal: z.boolean().optional(),
  isMandatory: z.boolean().optional(),
  applicableTo: PlanTypeSchema.optional(),
  search: z.string().optional(),
}).optional();

export type GovernanceFrameworkFilters = z.infer<typeof GovernanceFrameworkFiltersSchema>;

// =============================================================================
// APPLICABLE FRAMEWORKS SCHEMA
// =============================================================================

export const GetApplicableFrameworksSchema = z.object({
  planType: PlanTypeSchema,
  tenantId: z.string(),
  includeOptional: z.boolean().default(true), // Include non-mandatory frameworks
});

export type GetApplicableFrameworks = z.infer<typeof GetApplicableFrameworksSchema>;

export const ApplicableFrameworkSchema = z.object({
  frameworkCode: z.string(),
  title: z.string(),
  category: FrameworkCategorySchema,
  mandatoryCompliance: z.boolean(),
  relevantSections: z.array(z.string()).optional(),
  content: z.string(),
  version: z.string(),
});

export type ApplicableFramework = z.infer<typeof ApplicableFrameworkSchema>;

// =============================================================================
// IMPORT SCHEMA
// =============================================================================

export const ImportGovernanceFrameworkSchema = z.object({
  sourcePath: z.string(), // File or directory path
  tenantId: z.string(),
  createdBy: z.string().max(200),
  markAsGlobal: z.boolean().default(false),
  markAsMandatory: z.boolean().default(false),
  applicableTo: z.array(PlanTypeSchema).optional(),
  categoryMapping: z.record(z.string(), FrameworkCategorySchema).optional(), // Map file names to categories
});

export type ImportGovernanceFramework = z.infer<typeof ImportGovernanceFrameworkSchema>;

// =============================================================================
// VERSION SCHEMA
// =============================================================================

export const CreateFrameworkVersionSchema = z.object({
  frameworkId: z.string().cuid(),
  changes: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    category: FrameworkCategorySchema.optional(),
    applicableTo: z.array(PlanTypeSchema).optional(),
  }),
  bumpType: z.enum(['major', 'minor', 'patch']),
  createdBy: z.string().max(200),
});

export type CreateFrameworkVersion = z.infer<typeof CreateFrameworkVersionSchema>;
