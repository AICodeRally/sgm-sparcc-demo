import { z } from 'zod';

/**
 * Checklist Progress Contract
 * Defines schemas and types for tracking step completion in checklist-type governance frameworks
 */

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const ChecklistProgressSchema = z.object({
  id: z.string(),
  engagementId: z.string(),
  frameworkId: z.string(),
  stepId: z.string(),
  completed: z.boolean(),
  completedDate: z.string().datetime().nullable(),
  completedBy: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ChecklistProgress = z.infer<typeof ChecklistProgressSchema>;

// =============================================================================
// CRUD SCHEMAS
// =============================================================================

export const CreateChecklistProgressSchema = z.object({
  engagementId: z.string(),
  frameworkId: z.string(),
  stepId: z.string(),
  completed: z.boolean().default(false),
  completedBy: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateChecklistProgress = z.infer<typeof CreateChecklistProgressSchema>;

// =============================================================================
// BULK UPDATE SCHEMA
// =============================================================================

export const BulkUpdateChecklistProgressSchema = z.object({
  engagementId: z.string(),
  frameworkId: z.string(),
  steps: z.array(z.object({
    stepId: z.string(),
    completed: z.boolean(),
  })),
});

export type BulkUpdateChecklistProgress = z.infer<typeof BulkUpdateChecklistProgressSchema>;

// =============================================================================
// SUMMARY SCHEMA
// =============================================================================

export const ChecklistProgressSummarySchema = z.object({
  phases: z.record(z.string(), z.object({
    total: z.number(),
    completed: z.number(),
  })),
  overall: z.object({
    total: z.number(),
    completed: z.number(),
  }),
});

export type ChecklistProgressSummary = z.infer<typeof ChecklistProgressSummarySchema>;
