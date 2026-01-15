import { z } from 'zod';
import { PlanTypeSchema } from './plan-template.contract';
import { DataTypeSchema, DemoMetadataSchema } from './data-type.contract';

/**
 * Plan Contract
 * Defines schemas and types for plan instances
 */

// =============================================================================
// ENUMS
// =============================================================================

export const PlanStatusSchema = z.enum([
  'DRAFT',
  'IN_PROGRESS',
  'UNDER_REVIEW',
  'PENDING_APPROVAL',
  'APPROVED',
  'PUBLISHED',
  'SUPERSEDED',
  'ARCHIVED',
]);
export type PlanStatus = z.infer<typeof PlanStatusSchema>;

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const PlanSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string(),
  planCode: z.string().regex(/^PLAN-[A-Z0-9-]+$/, 'Plan code must match pattern PLAN-XXX'),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  planType: PlanTypeSchema,
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (x.y.z)'),
  status: PlanStatusSchema,
  createdFromTemplateId: z.string().cuid().optional(),
  templateSnapshot: z.record(z.string(), z.any()).optional(),
  owner: z.string().max(200),
  createdBy: z.string().max(200),
  updatedBy: z.string().max(200).optional(),
  approvalWorkflowId: z.string().optional(),
  createdAt: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  effectiveDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  documentId: z.string().optional(),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
  completionPercentage: z.number().min(0).max(100).default(0),
  sectionsCompleted: z.number().int().min(0).default(0),
  sectionsTotal: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.any()).optional(),
  // Data Type Classification (demo, template, or client)
  dataType: DataTypeSchema.default('client'),
  demoMetadata: DemoMetadataSchema,
});

export type Plan = z.infer<typeof PlanSchema>;

// =============================================================================
// CRUD SCHEMAS
// =============================================================================

export const CreatePlanSchema = PlanSchema.omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  completionPercentage: true,
  sectionsCompleted: true,
  sectionsTotal: true,
  publishedAt: true,
  documentId: true,
  supersededBy: true,
}).extend({
  tenantId: z.string(),
  planCode: z.string().regex(/^PLAN-[A-Z0-9-]+$/),
  title: z.string().min(1).max(200),
  version: z.string().default('1.0.0'),
  status: PlanStatusSchema.default('DRAFT'),
});

export type CreatePlan = z.infer<typeof CreatePlanSchema>;

export const UpdatePlanSchema = PlanSchema.partial().required({
  id: true,
});

export type UpdatePlan = z.infer<typeof UpdatePlanSchema>;

// =============================================================================
// CREATE FROM TEMPLATE SCHEMA
// =============================================================================

export const CreatePlanFromTemplateSchema = z.object({
  templateId: z.string().cuid(),
  tenantId: z.string(),
  planCode: z.string().regex(/^PLAN-[A-Z0-9-]+$/).optional(), // Auto-generated if not provided
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  owner: z.string().max(200),
  createdBy: z.string().max(200),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  effectiveDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
  customSections: z.array(z.string()).optional(), // Section IDs to include
  sections: z.array(z.object({
    sectionKey: z.string(),
    title: z.string(),
    content: z.string().optional(),
  })).optional(), // Initial section content (wizard flow)
  fieldOverrides: z.record(z.string(), z.any()).optional(), // Override field default values
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreatePlanFromTemplate = z.infer<typeof CreatePlanFromTemplateSchema>;

// =============================================================================
// VERSION BUMP SCHEMA
// =============================================================================

export const CreatePlanVersionSchema = z.object({
  planId: z.string().cuid(),
  changes: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    effectiveDate: z.coerce.date().optional(),
    expirationDate: z.coerce.date().optional(),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  bumpType: z.enum(['major', 'minor', 'patch']),
  createdBy: z.string().max(200),
});

export type CreatePlanVersion = z.infer<typeof CreatePlanVersionSchema>;

// =============================================================================
// FILTER SCHEMAS
// =============================================================================

export const PlanFiltersSchema = z.object({
  tenantId: z.string().optional(),
  planType: PlanTypeSchema.optional(),
  status: PlanStatusSchema.optional(),
  owner: z.string().optional(),
  createdFromTemplateId: z.string().cuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
  dataType: DataTypeSchema.optional(), // Filter by data type (demo, template, client)
}).optional();

export type PlanFilters = z.infer<typeof PlanFiltersSchema>;

// =============================================================================
// LIFECYCLE SCHEMAS
// =============================================================================

export const SubmitForReviewSchema = z.object({
  planId: z.string().cuid(),
  submittedBy: z.string().max(200),
  reviewerNotes: z.string().max(1000).optional(),
});

export type SubmitForReview = z.infer<typeof SubmitForReviewSchema>;

export const SubmitForApprovalSchema = z.object({
  planId: z.string().cuid(),
  submittedBy: z.string().max(200),
  workflowId: z.string().optional(),
  approverNotes: z.string().max(1000).optional(),
});

export type SubmitForApproval = z.infer<typeof SubmitForApprovalSchema>;

export const ApprovePlanSchema = z.object({
  planId: z.string().cuid(),
  approvedBy: z.string().max(200),
  approvalNotes: z.string().max(1000).optional(),
});

export type ApprovePlan = z.infer<typeof ApprovePlanSchema>;

export const PublishPlanSchema = z.object({
  planId: z.string().cuid(),
  publishedBy: z.string().max(200),
  effectiveDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
});

export type PublishPlan = z.infer<typeof PublishPlanSchema>;

export const RejectPlanSchema = z.object({
  planId: z.string().cuid(),
  rejectedBy: z.string().max(200),
  reason: z.string().min(1).max(1000),
});

export type RejectPlan = z.infer<typeof RejectPlanSchema>;

export const ArchivePlanSchema = z.object({
  planId: z.string().cuid(),
  archivedBy: z.string().max(200),
  reason: z.string().max(1000).optional(),
});

export type ArchivePlan = z.infer<typeof ArchivePlanSchema>;

// =============================================================================
// COMPLETION TRACKING SCHEMA
// =============================================================================

export const PlanCompletionStatsSchema = z.object({
  planId: z.string().cuid(),
  completionPercentage: z.number().min(0).max(100),
  sectionsCompleted: z.number().int().min(0),
  sectionsTotal: z.number().int().min(0),
  requiredSectionsCompleted: z.number().int().min(0),
  requiredSectionsTotal: z.number().int().min(0),
  lastUpdated: z.coerce.date(),
});

export type PlanCompletionStats = z.infer<typeof PlanCompletionStatsSchema>;

// =============================================================================
// DOCUMENT GENERATION SCHEMA
// =============================================================================

export const GeneratePlanDocumentSchema = z.object({
  planId: z.string().cuid(),
  generatedBy: z.string().max(200),
  format: z.enum(['PDF', 'DOCX', 'MARKDOWN']).default('PDF'),
  includeMetadata: z.boolean().default(true),
  includeAuditTrail: z.boolean().default(false),
});

export type GeneratePlanDocument = z.infer<typeof GeneratePlanDocumentSchema>;
