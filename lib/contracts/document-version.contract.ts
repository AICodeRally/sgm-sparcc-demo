import { z } from 'zod';
import { DataTypeSchema } from './data-type.contract';

/**
 * Document Lifecycle Status Enum
 * Tracks the full provenance from RAW source through ACTIVE_FINAL
 */
export const DocumentLifecycleStatusSchema = z.enum([
  'RAW',            // Original source file uploaded (PDF, DOCX, etc.)
  'PROCESSED',      // Converted to markdown/structured format
  'DRAFT',          // Being edited by users, not ready for review
  'UNDER_REVIEW',   // Submitted for stakeholder review
  'APPROVED',       // Approved by stakeholders, ready to publish
  'ACTIVE_FINAL',   // Published and in active use
  'SUPERSEDED',     // Replaced by a newer version
  'ARCHIVED',       // Retired, kept for historical records
]);

export type DocumentLifecycleStatus = z.infer<typeof DocumentLifecycleStatusSchema>;

/**
 * Change Type Enum
 * Indicates the magnitude of changes in a version
 */
export const ChangeTypeSchema = z.enum([
  'MAJOR',      // Significant changes, breaks compatibility
  'MINOR',      // New features, backward compatible
  'PATCH',      // Bug fixes, minor corrections
  'EMERGENCY',  // Urgent hotfix
]);

export type ChangeType = z.infer<typeof ChangeTypeSchema>;

/**
 * Content Format Enum
 */
export const ContentFormatSchema = z.enum([
  'markdown',
  'json',
  'html',
  'plain_text',
]);

export type ContentFormat = z.infer<typeof ContentFormatSchema>;

/**
 * Document Version Schema
 * Full provenance tracking for all document versions
 */
export const DocumentVersionSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string(),
  documentId: z.string(),

  // Version Identity
  versionNumber: z.string().regex(/^\d+\.\d+(\.\d+)?$/), // "1.0", "1.1", "2.0.1"
  versionLabel: z.string().max(100).optional(),

  // Lifecycle Status
  lifecycleStatus: DocumentLifecycleStatusSchema,

  // Content Storage
  content: z.string(),
  contentFormat: ContentFormatSchema.default('markdown'),

  // Source File Tracking
  sourceFileUrl: z.string().max(500).optional(),
  sourceFileName: z.string().max(255).optional(),
  sourceFileType: z.string().max(50).optional(), // pdf, docx, xlsx

  // Provenance & Audit Trail
  createdBy: z.string().max(200),
  createdAt: z.coerce.date(),
  modifiedBy: z.string().max(200).optional(),
  modifiedAt: z.coerce.date().optional(),
  changeDescription: z.string().max(2000).optional(),
  changeType: ChangeTypeSchema.default('MINOR'),

  // Approval Tracking
  approvedBy: z.string().max(200).optional(),
  approvedAt: z.coerce.date().optional(),
  approvalComments: z.string().max(2000).optional(),

  // Published/Active Tracking
  publishedBy: z.string().max(200).optional(),
  publishedAt: z.coerce.date().optional(),

  // Data Integrity
  checksum: z.string().max(64), // MD5/SHA256 hash
  fileSize: z.number().int().default(0),

  // Relationships
  previousVersionId: z.string().optional(),
  supersededBy: z.string().optional(),

  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),

  // Data Type Classification (demo, template, or client)
  dataType: DataTypeSchema.default('client'),
});

export type DocumentVersion = z.infer<typeof DocumentVersionSchema>;

/**
 * Create Document Version Schema
 */
export const CreateDocumentVersionSchema = DocumentVersionSchema.omit({
  id: true,
  createdAt: true,
  modifiedAt: true,
  approvedAt: true,
  publishedAt: true,
});

export type CreateDocumentVersion = z.infer<typeof CreateDocumentVersionSchema>;

/**
 * Update Document Version Schema
 */
export const UpdateDocumentVersionSchema = DocumentVersionSchema.partial().required({
  id: true,
});

export type UpdateDocumentVersion = z.infer<typeof UpdateDocumentVersionSchema>;

/**
 * Version Comparison Schema
 * For comparing two versions side-by-side
 */
export const VersionComparisonSchema = z.object({
  versionA: DocumentVersionSchema,
  versionB: DocumentVersionSchema,
  differences: z.object({
    contentDiff: z.string().optional(), // Unified diff format
    addedLines: z.number().int(),
    removedLines: z.number().int(),
    changedSections: z.array(z.string()).optional(),
  }),
});

export type VersionComparison = z.infer<typeof VersionComparisonSchema>;

/**
 * Version Timeline Entry Schema
 * Simplified view for timeline visualization
 */
export const VersionTimelineEntrySchema = z.object({
  id: z.string(),
  versionNumber: z.string(),
  versionLabel: z.string().optional(),
  lifecycleStatus: DocumentLifecycleStatusSchema,
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  changeDescription: z.string().optional(),
  changeType: ChangeTypeSchema,
  isCurrent: z.boolean().default(false),
});

export type VersionTimelineEntry = z.infer<typeof VersionTimelineEntrySchema>;

/**
 * Import RAW Document Request Schema
 * For importing original source files
 */
export const ImportRawDocumentSchema = z.object({
  tenantId: z.string(),
  documentId: z.string().optional(), // If undefined, creates new document
  sourceFileUrl: z.string().max(500),
  sourceFileName: z.string().max(255),
  sourceFileType: z.string().max(50),
  createdBy: z.string().max(200),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type ImportRawDocument = z.infer<typeof ImportRawDocumentSchema>;

/**
 * Process to Markdown Request Schema
 * For converting RAW to PROCESSED markdown
 */
export const ProcessToMarkdownSchema = z.object({
  rawVersionId: z.string(),
  processedContent: z.string(),
  processedBy: z.string().max(200),
  processingNotes: z.string().max(2000).optional(),
});

export type ProcessToMarkdown = z.infer<typeof ProcessToMarkdownSchema>;

/**
 * Transition to Draft Request Schema
 */
export const TransitionToDraftSchema = z.object({
  versionId: z.string(),
  draftContent: z.string(),
  transitionedBy: z.string().max(200),
  changeDescription: z.string().max(2000).optional(),
});

export type TransitionToDraft = z.infer<typeof TransitionToDraftSchema>;

/**
 * Approve Version Request Schema
 */
export const ApproveVersionSchema = z.object({
  versionId: z.string(),
  approvedBy: z.string().max(200),
  approvalComments: z.string().max(2000).optional(),
});

export type ApproveVersion = z.infer<typeof ApproveVersionSchema>;

/**
 * Publish to Active Request Schema
 */
export const PublishToActiveSchema = z.object({
  versionId: z.string(),
  publishedBy: z.string().max(200),
  effectiveDate: z.coerce.date().optional(),
});

export type PublishToActive = z.infer<typeof PublishToActiveSchema>;

/**
 * Version Filters Schema
 */
export const VersionFiltersSchema = z.object({
  tenantId: z.string(),
  documentId: z.string().optional(),
  lifecycleStatus: DocumentLifecycleStatusSchema.optional(),
  createdBy: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type VersionFilters = z.infer<typeof VersionFiltersSchema>;
