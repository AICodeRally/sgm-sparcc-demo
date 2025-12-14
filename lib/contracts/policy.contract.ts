import { z } from 'zod';

/**
 * Policy Status Lifecycle
 * - draft: Initial creation, can be edited freely
 * - published: Active policy in use
 * - superseded: Replaced by newer version
 * - retired: No longer in use
 */
export const PolicyStatusSchema = z.enum(['draft', 'published', 'superseded', 'retired']);
export type PolicyStatus = z.infer<typeof PolicyStatusSchema>;

/**
 * Policy Contract - Core governance policy entity
 *
 * Represents a governance policy document with versioning, effective dating,
 * and approval workflows. Policies define rules and standards for sales
 * compensation programs.
 */
export const PolicySchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),

  // Metadata
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().optional(), // e.g., "compensation", "territory", "quota"

  // Versioning (semantic: major.minor.patch)
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (e.g., 1.0.0)'),
  status: PolicyStatusSchema,

  // Effective Dating
  effectiveDate: z.coerce.date(),
  expirationDate: z.coerce.date().optional(),

  // Content
  content: z.string(), // Markdown or rich text

  // Relationships
  parentPolicyId: z.string().optional(), // For policy hierarchies
  supersededByPolicyId: z.string().optional(), // Link to newer version

  // Approval
  approvalRequired: z.boolean().default(true),
  approvalWorkflowId: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.coerce.date().optional(),

  // Audit
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedBy: z.string().optional(),
  updatedAt: z.coerce.date().optional(),

  // Metadata (flexible JSON for client-specific fields)
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Policy = z.infer<typeof PolicySchema>;

/**
 * Partial schemas for mutations
 */
export const CreatePolicySchema = PolicySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreatePolicy = z.infer<typeof CreatePolicySchema>;

export const UpdatePolicySchema = PolicySchema.partial().required({
  id: true,
  updatedBy: true,
});

export type UpdatePolicy = z.infer<typeof UpdatePolicySchema>;

/**
 * Filter schemas for queries
 */
export const PolicyFiltersSchema = z.object({
  tenantId: z.string().optional(),
  status: PolicyStatusSchema.optional(),
  category: z.string().optional(),
  effectiveBefore: z.coerce.date().optional(),
  effectiveAfter: z.coerce.date().optional(),
  createdBy: z.string().optional(),
  search: z.string().optional(), // Full-text search
}).partial();

export type PolicyFilters = z.infer<typeof PolicyFiltersSchema>;

/**
 * Version comparison helper
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }

  return 0;
}

/**
 * Next version calculator
 */
export function nextVersion(currentVersion: string, bump: 'major' | 'minor' | 'patch'): string {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (bump) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
  }
}
