import { z } from 'zod';

/**
 * Approval Status
 * - pending: Awaiting decision
 * - approved: Request approved
 * - rejected: Request rejected
 * - withdrawn: Request withdrawn by submitter
 */
export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'withdrawn']);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

/**
 * Approval Decision
 */
export const ApprovalDecisionSchema = z.enum(['approve', 'reject', 'delegate']);
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

/**
 * Approval Priority
 */
export const ApprovalPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type ApprovalPriority = z.infer<typeof ApprovalPrioritySchema>;

/**
 * Approval Contract - Approval workflow request
 *
 * Represents a request for approval (e.g., policy change, territory reassignment).
 */
export const ApprovalSchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),

  // Metadata
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: ApprovalPrioritySchema.default('medium'),
  status: ApprovalStatusSchema.default('pending'),

  // Request Details
  entityType: z.string(), // e.g., "policy", "territory", "quota"
  entityId: z.string(),
  requestType: z.string(), // e.g., "create", "update", "delete", "publish"
  requestData: z.record(z.string(), z.any()), // JSON payload with requested changes

  // Workflow
  workflowId: z.string().optional(),
  currentStep: z.number().int().min(0).default(0),
  totalSteps: z.number().int().min(1).default(1),

  // Submitter
  submittedBy: z.string(),
  submittedAt: z.coerce.date(),

  // SLA
  slaDeadline: z.coerce.date().optional(),
  escalatedAt: z.coerce.date().optional(),

  // Resolution
  decidedBy: z.string().optional(),
  decidedAt: z.coerce.date().optional(),
  decision: ApprovalDecisionSchema.optional(),
  decisionNotes: z.string().max(2000).optional(),

  // Audit
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),

  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Approval = z.infer<typeof ApprovalSchema>;

/**
 * Approval Workflow Step
 */
export const ApprovalWorkflowStepSchema = z.object({
  id: z.string().cuid(),
  approvalId: z.string(),
  sequence: z.number().int().min(0),
  approverId: z.string(),
  approverRole: z.string(), // e.g., "manager", "sales_ops", "vp_sales", "finance"
  status: ApprovalStatusSchema.default('pending'),
  decision: ApprovalDecisionSchema.optional(),
  comments: z.string().max(2000).optional(),
  decidedAt: z.coerce.date().optional(),
  slaDeadline: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
});

export type ApprovalWorkflowStep = z.infer<typeof ApprovalWorkflowStepSchema>;

/**
 * Approval Decision Input (for API)
 */
export const SubmitApprovalDecisionSchema = z.object({
  approvalId: z.string(),
  decision: ApprovalDecisionSchema,
  comments: z.string().max(2000).optional(),
  delegateTo: z.string().optional(), // If decision = delegate
  decidedBy: z.string(),
});

export type SubmitApprovalDecision = z.infer<typeof SubmitApprovalDecisionSchema>;

/**
 * Partial schemas for mutations
 */
export const CreateApprovalSchema = ApprovalSchema.omit({
  id: true,
  status: true,
  currentStep: true,
  createdAt: true,
  updatedAt: true,
  decidedBy: true,
  decidedAt: true,
  decision: true,
  decisionNotes: true,
});

export type CreateApproval = z.infer<typeof CreateApprovalSchema>;

/**
 * Filter schemas for queries
 */
export const ApprovalFiltersSchema = z.object({
  tenantId: z.string().optional(),
  status: ApprovalStatusSchema.optional(),
  priority: ApprovalPrioritySchema.optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  submittedBy: z.string().optional(),
  decidedBy: z.string().optional(),
  search: z.string().optional(),
}).partial();

export type ApprovalFilters = z.infer<typeof ApprovalFiltersSchema>;
