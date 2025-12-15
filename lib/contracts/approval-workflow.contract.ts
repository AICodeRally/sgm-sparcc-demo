import { z } from 'zod';
import type { DocumentType } from './document.contract';

/**
 * Approval Workflow Contract
 *
 * Defines workflow templates and approval routing rules for documents.
 */

export const ApprovalStepSchema = z.object({
  stepOrder: z.number().min(1),
  stepName: z.string().min(1).max(100),
  role: z.string(), // e.g., 'CFO', 'General Counsel', 'SGCC', 'CRB'
  approvers: z.array(z.string()), // User IDs
  isParallel: z.boolean().default(false), // Multiple approvers in parallel?
  requireAll: z.boolean().default(true), // All must approve or just one?
  slaHours: z.number().min(1),
});

export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;

export const RoutingRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  documentType: z.string().optional(), // If undefined, applies to all types
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  workflowId: z.string(), // Reference to workflow
});

export type RoutingRule = z.infer<typeof RoutingRuleSchema>;

export const ApprovalWorkflowSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  documentType: z.string(), // 'POLICY', 'PROCEDURE', 'TEMPLATE', etc.
  isDefault: z.boolean().default(false),

  // Workflow Steps
  steps: z.array(ApprovalStepSchema),

  // SLA tracking
  slaHours: z.number().min(1).default(48), // Total SLA for approval
  slaEscalationHours: z.number().min(1).optional(), // When to escalate

  // Statistics
  totalRequests: z.number().default(0),
  approved: z.number().default(0),
  rejected: z.number().default(0),
  pending: z.number().default(0),

  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ApprovalWorkflow = z.infer<typeof ApprovalWorkflowSchema>;

/**
 * Approval Request - Tracks a specific approval submission
 */
export const ApprovalRequestStepSchema = z.object({
  stepOrder: z.number(),
  stepName: z.string(),
  role: z.string(),
  approvers: z.array(z.object({
    approverId: z.string(),
    approverName: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    decisionAt: z.coerce.date().optional(),
    comments: z.string().optional(),
  })),
  status: z.enum(['pending', 'approved', 'rejected']),
  completedAt: z.coerce.date().optional(),
});

export type ApprovalRequestStep = z.infer<typeof ApprovalRequestStepSchema>;

export const ApprovalRequestSchema = z.object({
  id: z.string().cuid(),
  documentId: z.string(),
  workflowId: z.string(),

  // Submission info
  requestedBy: z.string(),
  requestedAt: z.coerce.date(),

  // Approval progress
  currentStep: z.number(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),

  // Steps with decisions
  steps: z.array(ApprovalRequestStepSchema),

  // Timeline
  completedAt: z.coerce.date().optional(),
  finalDecision: z.enum(['approved', 'rejected']).optional(),

  // SLA tracking
  slaDueAt: z.coerce.date().optional(),
  slaBreached: z.boolean().default(false),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const CreateApprovalRequestSchema = ApprovalRequestSchema.omit({
  id: true,
  createdAt: true,
  steps: true,
  currentStep: true,
  status: true,
  requestedAt: true,
});

export type CreateApprovalRequest = z.infer<typeof CreateApprovalRequestSchema>;
