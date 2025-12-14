import { z } from 'zod';

/**
 * Audit Event Type
 */
export const AuditEventTypeSchema = z.enum([
  // Entity operations
  'create',
  'update',
  'delete',
  'publish',
  'archive',

  // Approval operations
  'approve',
  'reject',
  'submit_for_approval',
  'withdraw_approval',

  // Version operations
  'create_version',
  'supersede_version',

  // Assignment operations
  'assign',
  'unassign',
  'reassign',

  // Access operations
  'view',
  'download',
  'export',

  // System operations
  'login',
  'logout',
  'config_change',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

/**
 * Audit Severity
 */
export const AuditSeveritySchema = z.enum(['info', 'warning', 'error', 'critical']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

/**
 * Audit Log Contract - Append-only event log
 *
 * Records all mutations and significant events for compliance and debugging.
 * Once written, audit logs are NEVER modified or deleted.
 */
export const AuditLogSchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),

  // Event Details
  eventType: AuditEventTypeSchema,
  severity: AuditSeveritySchema.default('info'),
  message: z.string().min(1).max(500),

  // Entity Context
  entityType: z.string(), // e.g., "policy", "territory", "approval"
  entityId: z.string(),
  entityName: z.string().optional(), // Human-readable name for UI

  // Actor
  actorId: z.string(), // User ID who performed the action
  actorName: z.string().optional(), // User name for display
  actorRole: z.string().optional(), // User role at time of action

  // Changes (for update events)
  changesBefore: z.record(z.string(), z.any()).optional(), // Previous values
  changesAfter: z.record(z.string(), z.any()).optional(), // New values

  // Request Context
  requestId: z.string().optional(), // Trace ID for debugging
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),

  // Timestamp (immutable)
  occurredAt: z.coerce.date(),

  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Create Audit Log (no ID - server-generated)
 */
export const CreateAuditLogSchema = AuditLogSchema.omit({
  id: true,
  occurredAt: true,
});

export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;

/**
 * Filter schemas for queries
 */
export const AuditLogFiltersSchema = z.object({
  tenantId: z.string().optional(),
  eventType: AuditEventTypeSchema.optional(),
  severity: AuditSeveritySchema.optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  occurredAfter: z.coerce.date().optional(),
  occurredBefore: z.coerce.date().optional(),
  search: z.string().optional(),
}).partial();

export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

/**
 * Audit Summary (aggregated stats)
 */
export const AuditSummarySchema = z.object({
  totalEvents: z.number().int(),
  eventsByType: z.record(z.string(), z.number()),
  eventsBySeverity: z.record(z.string(), z.number()),
  topActors: z.array(z.object({
    actorId: z.string(),
    actorName: z.string().optional(),
    eventCount: z.number().int(),
  })),
  recentEvents: z.array(AuditLogSchema),
});

export type AuditSummary = z.infer<typeof AuditSummarySchema>;
