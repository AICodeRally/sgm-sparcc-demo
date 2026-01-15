import { z } from 'zod';
import { DataTypeSchema, DemoMetadataSchema } from './data-type.contract';

/**
 * Document Type
 * - FRAMEWORK: Governance infrastructure (charters, frameworks)
 * - POLICY: Rules and standards
 * - PROCEDURE: Step-by-step operational processes
 * - TEMPLATE: Ready-to-use forms
 * - CHECKLIST: Implementation tracking
 * - GUIDE: Training materials
 */
export const DocumentTypeSchema = z.enum([
  'FRAMEWORK',
  'POLICY',
  'PROCEDURE',
  'TEMPLATE',
  'CHECKLIST',
  'GUIDE',
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

/**
 * Document Status Lifecycle
 * - DRAFT: Initial creation, can be edited freely
 * - UNDER_REVIEW: Submitted for review by stakeholders
 * - PENDING_APPROVAL: Ready for formal approval
 * - APPROVED: Fully approved, ready to activate
 * - ACTIVE: Currently in effect
 * - ARCHIVED: No longer in use, retained for compliance
 */
export const DocumentStatusSchema = z.enum([
  'DRAFT',
  'UNDER_REVIEW',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'ARCHIVED',
]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

/**
 * File Type
 */
export const FileTypeSchema = z.enum(['md', 'docx', 'pdf', 'xlsx', 'pptx']);
export type FileType = z.infer<typeof FileTypeSchema>;

/**
 * Legal Review Status
 */
export const LegalReviewStatusSchema = z.enum([
  'NOT_REQUIRED',
  'PENDING',
  'APPROVED',
  'REJECTED',
]);
export type LegalReviewStatus = z.infer<typeof LegalReviewStatusSchema>;

/**
 * Governance Document Contract - Core document management entity
 *
 * Represents a governance document (policy, procedure, template, etc.)
 * with versioning, effective dating, approval workflows, and file storage.
 */
export const DocumentSchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),
  documentCode: z.string(), // e.g., "SCP-001", "PROC-008"

  // Metadata
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  documentType: DocumentTypeSchema,
  category: z.string().optional(), // e.g., "Compensation", "Territory"
  tags: z.array(z.string()).optional(),

  // Versioning (semantic: major.minor.patch)
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (e.g., 1.0.0)'),
  status: DocumentStatusSchema,

  // Lifecycle Dates
  createdAt: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  effectiveDate: z.coerce.date().optional(), // When document becomes active
  expirationDate: z.coerce.date().optional(), // When document expires
  nextReview: z.coerce.date().optional(), // Scheduled review date

  // File Storage
  fileType: FileTypeSchema,
  filePath: z.string(), // Local or S3 path
  fileSize: z.number(), // In bytes
  checksum: z.string().optional(), // SHA-256 for integrity

  // Ownership & Approval
  owner: z.string(), // User ID or name
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  approvers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    approvedAt: z.coerce.date().optional(),
    comments: z.string().optional(),
  })).optional(),
  approvalWorkflowId: z.string().optional(),
  legalReviewStatus: LegalReviewStatusSchema.default('NOT_REQUIRED'),

  // Relationships
  relatedDocs: z.array(z.string()).optional(), // Document codes
  referencedBy: z.array(z.string()).optional(), // Docs that reference this
  supersedes: z.string().optional(), // Previous version document ID
  supersededBy: z.string().optional(), // Newer version document ID

  // Compliance
  retentionPeriod: z.number().default(7), // Years
  complianceFlags: z.array(z.string()).optional(), // e.g., CA_LABOR_CODE, SECTION_409A

  // Metadata (flexible JSON for client-specific fields)
  metadata: z.record(z.string(), z.any()).optional(),

  // Data Type Classification (demo, template, or client)
  dataType: DataTypeSchema.default('client'),
  demoMetadata: DemoMetadataSchema,
});

export type Document = z.infer<typeof DocumentSchema>;

/**
 * Partial schemas for mutations
 */
export const CreateDocumentSchema = DocumentSchema.omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
}).extend({
  file: z.instanceof(File).optional(), // For multipart uploads
});

export type CreateDocument = z.infer<typeof CreateDocumentSchema>;

export const UpdateDocumentSchema = DocumentSchema.partial().required({
  id: true,
  updatedBy: true,
});

export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;

/**
 * Filter schemas for queries
 */
export const DocumentFiltersSchema = z.object({
  tenantId: z.string().optional(),
  documentType: DocumentTypeSchema.optional(),
  status: DocumentStatusSchema.optional(),
  category: z.string().optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(), // Full-text search
  effectiveBefore: z.coerce.date().optional(),
  effectiveAfter: z.coerce.date().optional(),
  dataType: DataTypeSchema.optional(), // Filter by data type (demo, template, client)
}).partial();

export type DocumentFilters = z.infer<typeof DocumentFiltersSchema>;

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
