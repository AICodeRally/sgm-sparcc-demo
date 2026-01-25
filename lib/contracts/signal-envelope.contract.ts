/**
 * SignalEnvelope Contract
 *
 * Type-safe Zod schemas for AICR telemetry signals.
 * Used by Ops, Pulse, and Task orbs to consume/emit signals.
 */

import { z } from 'zod';

// Signal severity levels
export const SignalSeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type SignalSeverity = z.infer<typeof SignalSeveritySchema>;

// Signal type prefixes
export const SignalTypePrefixSchema = z.enum([
  'OPS_ANOMALY',      // Pattern detected (anomalies, outliers)
  'OPS_THRESHOLD',    // Metric crossed threshold
  'OPS_DRIFT',        // Configuration or behavior drift
  'PULSE_RECOMMEND',  // Proactive recommendations
  'PULSE_LEARN',      // Learning opportunities
  'PULSE_ACTION',     // Suggested actions
  'AI_TEL',           // Shared AI telemetry
  'TASK_STATUS',      // Task status changes
  'TASK_ASSIGN',      // Task assignments
  'TASK_COMPLETE',    // Task completions
]);
export type SignalTypePrefix = z.infer<typeof SignalTypePrefixSchema>;

// Full signal type (prefix + specific type)
export const SignalTypeSchema = z.string().refine(
  (val) => {
    const prefixes = SignalTypePrefixSchema.options;
    return prefixes.some(prefix => val.startsWith(prefix));
  },
  { message: 'Signal type must start with a valid prefix (OPS_, PULSE_, AI_TEL_, TASK_)' }
);
export type SignalType = z.infer<typeof SignalTypeSchema>;

// Base signal metadata
export const SignalMetadataSchema = z.object({
  tenantId: z.string().optional(),
  entityType: z.string().optional(),    // e.g., 'plan', 'rep', 'territory'
  entityId: z.string().optional(),
  source: z.string().optional(),         // e.g., 'gap-analyzer', 'ops-engine'
  correlationId: z.string().optional(),  // For tracing related signals
  tags: z.array(z.string()).optional(),
}).passthrough();
export type SignalMetadata = z.infer<typeof SignalMetadataSchema>;

// Core signal envelope schema
export const SignalEnvelopeSchema = z.object({
  id: z.string(),
  type: SignalTypeSchema,
  title: z.string(),
  description: z.string(),
  severity: SignalSeveritySchema,
  timestamp: z.string().datetime(),
  metadata: SignalMetadataSchema.optional(),
  actionUrl: z.string().url().optional(),
  suggestedAction: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  acknowledged: z.boolean().optional().default(false),
  acknowledgedAt: z.string().datetime().optional(),
  acknowledgedBy: z.string().optional(),
});
export type SignalEnvelope = z.infer<typeof SignalEnvelopeSchema>;

// OPS-specific signal (anomalies, thresholds, drift)
export const OpsSignalSchema = SignalEnvelopeSchema.extend({
  type: z.string().startsWith('OPS_'),
  metrics: z.object({
    currentValue: z.number().optional(),
    expectedValue: z.number().optional(),
    threshold: z.number().optional(),
    deviation: z.number().optional(),      // % deviation from expected
    confidence: z.number().min(0).max(1).optional(),
  }).optional(),
  affectedEntities: z.array(z.object({
    type: z.string(),
    id: z.string(),
    name: z.string().optional(),
  })).optional(),
});
export type OpsSignal = z.infer<typeof OpsSignalSchema>;

// PULSE-specific signal (recommendations, learning, actions)
export const PulseSignalSchema = SignalEnvelopeSchema.extend({
  type: z.string().startsWith('PULSE_'),
  recommendation: z.object({
    category: z.enum(['optimization', 'learning', 'action', 'insight']).optional(),
    priority: z.number().min(1).max(10).optional(),
    effort: z.enum(['low', 'medium', 'high']).optional(),
    impact: z.enum(['low', 'medium', 'high']).optional(),
    steps: z.array(z.string()).optional(),
  }).optional(),
  relatedPolicies: z.array(z.string()).optional(), // Policy codes (e.g., 'SCP-001')
});
export type PulseSignal = z.infer<typeof PulseSignalSchema>;

// TASK-specific signal (status, assignments, completions)
export const TaskSignalSchema = SignalEnvelopeSchema.extend({
  type: z.string().startsWith('TASK_'),
  task: z.object({
    taskId: z.string(),
    taskType: z.string().optional(),
    assignee: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'blocked', 'cancelled']).optional(),
    progress: z.number().min(0).max(100).optional(),
  }).optional(),
});
export type TaskSignal = z.infer<typeof TaskSignalSchema>;

// AI Telemetry signal (shared AI events)
export const AITelemetrySignalSchema = SignalEnvelopeSchema.extend({
  type: z.string().startsWith('AI_TEL_'),
  aiContext: z.object({
    modelId: z.string().optional(),
    modelType: z.string().optional(),
    tokensUsed: z.object({
      input: z.number(),
      output: z.number(),
      total: z.number(),
    }).optional(),
    latencyMs: z.number().optional(),
    cached: z.boolean().optional(),
    ragChunksUsed: z.number().optional(),
  }).optional(),
});
export type AITelemetrySignal = z.infer<typeof AITelemetrySignalSchema>;

// Signal batch response (from telemetry API)
export const SignalBatchResponseSchema = z.object({
  signals: z.array(SignalEnvelopeSchema),
  count: z.number(),
  timestamp: z.string().datetime(),
  cursor: z.string().optional(),        // For pagination
  hasMore: z.boolean().optional(),
});
export type SignalBatchResponse = z.infer<typeof SignalBatchResponseSchema>;

// Signal filter options
export const SignalFilterSchema = z.object({
  types: z.array(z.string()).optional(),
  severities: z.array(SignalSeveritySchema).optional(),
  since: z.string().datetime().optional(),
  until: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  includeAcknowledged: z.boolean().optional().default(false),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  tenantId: z.string().optional(),
});
export type SignalFilter = z.infer<typeof SignalFilterSchema>;

// Helper to create signal IDs
export function createSignalId(prefix: SignalTypePrefix): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix.toLowerCase()}-${timestamp}-${random}`;
}

// Helper to validate signal type
export function isValidSignalType(type: string): boolean {
  return SignalTypeSchema.safeParse(type).success;
}

// Helper to get signal prefix
export function getSignalPrefix(type: string): SignalTypePrefix | null {
  const prefixes = SignalTypePrefixSchema.options;
  for (const prefix of prefixes) {
    if (type.startsWith(prefix)) {
      return prefix;
    }
  }
  return null;
}
