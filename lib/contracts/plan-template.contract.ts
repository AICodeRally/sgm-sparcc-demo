import { z } from 'zod';
import { DataTypeSchema, DemoMetadataSchema } from './data-type.contract';

/**
 * Plan Template Contract
 * Defines schemas and types for plan templates
 */

// =============================================================================
// ENUMS
// =============================================================================

export const PlanTypeSchema = z.enum([
  'COMPENSATION_PLAN',
  'GOVERNANCE_PLAN',
  'POLICY_CREATION_PLAN',
]);
export type PlanType = z.infer<typeof PlanTypeSchema>;

export const TemplateStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'DEPRECATED',
  'ARCHIVED',
]);
export type TemplateStatus = z.infer<typeof TemplateStatusSchema>;

export const TemplateSourceSchema = z.enum([
  'SYSTEM',
  'USER_CREATED',
  'CLONED',
]);
export type TemplateSource = z.infer<typeof TemplateSourceSchema>;

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const PlanTemplateSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string(),
  code: z.string().regex(/^TPL-[A-Z]+-\d{3}$/, 'Template code must match pattern TPL-XXX-000'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  planType: PlanTypeSchema,
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (x.y.z)'),
  status: TemplateStatusSchema,
  source: TemplateSourceSchema,
  isSystemTemplate: z.boolean().default(false),
  clonedFromId: z.string().cuid().optional(),
  owner: z.string().max(200),
  createdBy: z.string().max(200),
  createdAt: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  effectiveDate: z.coerce.date().optional(),
  usageCount: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.any()).optional(),
  // Data Type Classification (demo, template, or client)
  dataType: DataTypeSchema.default('template'),
  demoMetadata: DemoMetadataSchema,
});

export type PlanTemplate = z.infer<typeof PlanTemplateSchema>;

// =============================================================================
// CRUD SCHEMAS
// =============================================================================

export const CreatePlanTemplateSchema = PlanTemplateSchema.omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  usageCount: true,
}).extend({
  tenantId: z.string(),
  code: z.string().regex(/^TPL-[A-Z]+-\d{3}$/),
  version: z.string().default('1.0.0'),
  status: TemplateStatusSchema.default('DRAFT'),
  source: TemplateSourceSchema.default('USER_CREATED'),
  isSystemTemplate: z.boolean().default(false),
});

export type CreatePlanTemplate = z.infer<typeof CreatePlanTemplateSchema>;

export const UpdatePlanTemplateSchema = PlanTemplateSchema.partial().required({
  id: true,
});

export type UpdatePlanTemplate = z.infer<typeof UpdatePlanTemplateSchema>;

export const ClonePlanTemplateSchema = z.object({
  sourceTemplateId: z.string().cuid(),
  newCode: z.string().regex(/^TPL-[A-Z]+-\d{3}$/),
  newName: z.string().min(1).max(200),
  newOwner: z.string().max(200),
  clonedBy: z.string().max(200),
  customizeSections: z.boolean().default(false),
});

export type ClonePlanTemplate = z.infer<typeof ClonePlanTemplateSchema>;

// =============================================================================
// FILTER SCHEMAS
// =============================================================================

export const PlanTemplateFiltersSchema = z.object({
  tenantId: z.string().optional(),
  planType: PlanTypeSchema.optional(),
  status: TemplateStatusSchema.optional(),
  isSystemTemplate: z.boolean().optional(),
  owner: z.string().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  dataType: DataTypeSchema.optional(), // Filter by data type (demo, template, client)
});

export type PlanTemplateFilters = z.infer<typeof PlanTemplateFiltersSchema>;

// =============================================================================
// USAGE STATISTICS SCHEMA
// =============================================================================

export const TemplateUsageStatsSchema = z.object({
  templateId: z.string().cuid(),
  templateCode: z.string(),
  templateName: z.string(),
  totalUsageCount: z.number().int().min(0),
  activePlans: z.number().int().min(0),
  completedPlans: z.number().int().min(0),
  lastUsed: z.coerce.date().optional(),
  averageCompletionTime: z.number().optional(), // in days
});

export type TemplateUsageStats = z.infer<typeof TemplateUsageStatsSchema>;
