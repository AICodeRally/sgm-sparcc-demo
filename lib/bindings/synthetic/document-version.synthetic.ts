import crypto from 'crypto';
import type { IDocumentVersionPort } from '@/lib/ports/document-version.port';
import type {
  DocumentVersion,
  CreateDocumentVersion,
  UpdateDocumentVersion,
  VersionComparison,
  VersionTimelineEntry,
  ImportRawDocument,
  ProcessToMarkdown,
  TransitionToDraft,
  ApproveVersion,
  PublishToActive,
  VersionFilters,
  DocumentLifecycleStatus,
} from '@/lib/contracts/document-version.contract';

/**
 * Synthetic Document Version Provider
 * In-memory implementation for testing and demo purposes
 */
export class SyntheticDocumentVersionProvider implements IDocumentVersionPort {
  private versions: Map<string, DocumentVersion> = new Map();
  private isDemoDataEnabled: boolean;

  constructor() {
    this.isDemoDataEnabled = process.env.DEMO_DATA_ENABLED !== 'false';
    if (this.isDemoDataEnabled) {
      this.initializeDemoData();
    }
  }

  // ===========================================================================
  // CRUD Operations
  // ===========================================================================

  async findAll(filters?: VersionFilters): Promise<DocumentVersion[]> {
    let results = Array.from(this.versions.values());

    if (filters) {
      if (filters.tenantId) {
        results = results.filter((v) => v.tenantId === filters.tenantId);
      }
      if (filters.documentId) {
        results = results.filter((v) => v.documentId === filters.documentId);
      }
      if (filters.lifecycleStatus) {
        results = results.filter((v) => v.lifecycleStatus === filters.lifecycleStatus);
      }
      if (filters.createdBy) {
        results = results.filter((v) => v.createdBy === filters.createdBy);
      }
      if (filters.fromDate) {
        results = results.filter((v) => v.createdAt >= filters.fromDate!);
      }
      if (filters.toDate) {
        results = results.filter((v) => v.createdAt <= filters.toDate!);
      }

      // Apply offset and limit
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      results = results.slice(offset, offset + limit);
    }

    return results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findById(id: string): Promise<DocumentVersion | null> {
    return this.versions.get(id) || null;
  }

  async findByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    return Array.from(this.versions.values())
      .filter((v) => v.documentId === documentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findLatestVersion(
    documentId: string,
    status?: DocumentLifecycleStatus
  ): Promise<DocumentVersion | null> {
    const versions = await this.findByDocumentId(documentId);

    const filtered = status
      ? versions.filter((v) => v.lifecycleStatus === status)
      : versions;

    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }

  async findByVersionNumber(
    documentId: string,
    versionNumber: string
  ): Promise<DocumentVersion | null> {
    return (
      Array.from(this.versions.values()).find(
        (v) => v.documentId === documentId && v.versionNumber === versionNumber
      ) || null
    );
  }

  async create(data: CreateDocumentVersion): Promise<DocumentVersion> {
    const id = this.generateId();
    const now = new Date();

    const version: DocumentVersion = {
      id,
      ...data,
      createdAt: now,
      modifiedAt: data.modifiedBy ? now : undefined,
      approvedAt: data.approvedBy ? now : undefined,
      publishedAt: data.publishedBy ? now : undefined,
    };

    this.versions.set(id, version);
    return version;
  }

  async update(data: UpdateDocumentVersion): Promise<DocumentVersion> {
    const existing = this.versions.get(data.id);
    if (!existing) {
      throw new Error('Version not found: ' + data.id);
    }

    const updated: DocumentVersion = {
      ...existing,
      ...data,
      modifiedAt: new Date(),
    };

    this.versions.set(data.id, updated);
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const version = this.versions.get(id);
    if (!version) {
      throw new Error('Version not found: ' + id);
    }

    // Soft delete - set to ARCHIVED
    await this.update({
      id,
      lifecycleStatus: 'ARCHIVED',
      modifiedBy: deletedBy,
    });
  }

  async hardDelete(id: string): Promise<void> {
    this.versions.delete(id);
  }

  // ===========================================================================
  // Workflow Operations
  // ===========================================================================

  async importRaw(data: ImportRawDocument): Promise<DocumentVersion> {
    const content = `# RAW Document Import\n\n**Source File:** ${data.sourceFileName}\n**Type:** ${data.sourceFileType}\n\nThis is the original source document before processing.`;

    const checksum = this.calculateChecksum(content);
    const fileSize = Buffer.byteLength(content, 'utf8');

    return await this.create({
      tenantId: data.tenantId,
      documentId: data.documentId || this.generateId(),
      versionNumber: '0.1',
      versionLabel: 'Raw Import',
      lifecycleStatus: 'RAW',
      content,
      contentFormat: 'plain_text',
      sourceFileUrl: data.sourceFileUrl,
      sourceFileName: data.sourceFileName,
      sourceFileType: data.sourceFileType,
      createdBy: data.createdBy,
      changeDescription: 'Initial RAW document import',
      changeType: 'MAJOR',
      checksum,
      fileSize,
      metadata: data.metadata,
      isDemo: false,
    });
  }

  async processToMarkdown(data: ProcessToMarkdown): Promise<DocumentVersion> {
    const rawVersion = await this.findById(data.rawVersionId);
    if (!rawVersion) {
      throw new Error('RAW version not found');
    }

    if (rawVersion.lifecycleStatus !== 'RAW') {
      throw new Error('Can only process RAW versions');
    }

    const checksum = this.calculateChecksum(data.processedContent);
    const fileSize = Buffer.byteLength(data.processedContent, 'utf8');

    return await this.create({
      tenantId: rawVersion.tenantId,
      documentId: rawVersion.documentId,
      versionNumber: '1.0',
      versionLabel: 'Processed Markdown',
      lifecycleStatus: 'PROCESSED',
      content: data.processedContent,
      contentFormat: 'markdown',
      sourceFileUrl: rawVersion.sourceFileUrl,
      sourceFileName: rawVersion.sourceFileName,
      sourceFileType: rawVersion.sourceFileType,
      createdBy: data.processedBy,
      changeDescription: data.processingNotes || 'Converted RAW document to structured markdown',
      changeType: 'MAJOR',
      checksum,
      fileSize,
      previousVersionId: rawVersion.id,
      metadata: rawVersion.metadata,
      isDemo: rawVersion.isDemo,
    });
  }

  async transitionToDraft(data: TransitionToDraft): Promise<DocumentVersion> {
    const sourceVersion = await this.findById(data.versionId);
    if (!sourceVersion) {
      throw new Error('Source version not found');
    }

    if (sourceVersion.lifecycleStatus !== 'PROCESSED') {
      throw new Error('Can only transition PROCESSED versions to DRAFT');
    }

    const checksum = this.calculateChecksum(data.draftContent);
    const fileSize = Buffer.byteLength(data.draftContent, 'utf8');

    // Calculate next version number
    const nextVersion = await this.getNextVersionNumber(
      sourceVersion.documentId,
      'MINOR'
    );

    return await this.create({
      tenantId: sourceVersion.tenantId,
      documentId: sourceVersion.documentId,
      versionNumber: nextVersion,
      versionLabel: 'Draft Edit',
      lifecycleStatus: 'DRAFT',
      content: data.draftContent,
      contentFormat: sourceVersion.contentFormat,
      sourceFileUrl: sourceVersion.sourceFileUrl,
      sourceFileName: sourceVersion.sourceFileName,
      sourceFileType: sourceVersion.sourceFileType,
      createdBy: data.transitionedBy,
      changeDescription: data.changeDescription || 'Transitioned to draft for editing',
      changeType: 'MINOR',
      checksum,
      fileSize,
      previousVersionId: sourceVersion.id,
      metadata: sourceVersion.metadata,
      isDemo: sourceVersion.isDemo,
    });
  }

  async submitForReview(versionId: string, submittedBy: string): Promise<DocumentVersion> {
    return await this.update({
      id: versionId,
      lifecycleStatus: 'UNDER_REVIEW',
      modifiedBy: submittedBy,
      changeDescription: 'Submitted for stakeholder review',
    });
  }

  async approve(data: ApproveVersion): Promise<DocumentVersion> {
    const now = new Date();
    return await this.update({
      id: data.versionId,
      lifecycleStatus: 'APPROVED',
      approvedBy: data.approvedBy,
      approvedAt: now,
      approvalComments: data.approvalComments,
      modifiedBy: data.approvedBy,
    });
  }

  async reject(
    versionId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<DocumentVersion> {
    return await this.update({
      id: versionId,
      lifecycleStatus: 'DRAFT',
      modifiedBy: rejectedBy,
      approvalComments: 'REJECTED: ' + rejectionReason,
    });
  }

  async publishToActive(data: PublishToActive): Promise<DocumentVersion> {
    const version = await this.findById(data.versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    if (version.lifecycleStatus !== 'APPROVED') {
      throw new Error('Can only publish APPROVED versions');
    }

    // Find and supersede any existing ACTIVE_FINAL version
    const existingActive = await this.findLatestVersion(
      version.documentId,
      'ACTIVE_FINAL'
    );

    if (existingActive) {
      await this.update({
        id: existingActive.id,
        lifecycleStatus: 'SUPERSEDED',
        supersededBy: version.id,
        modifiedBy: data.publishedBy,
      });
    }

    const now = new Date();
    return await this.update({
      id: data.versionId,
      lifecycleStatus: 'ACTIVE_FINAL',
      publishedBy: data.publishedBy,
      publishedAt: now,
      modifiedBy: data.publishedBy,
    });
  }

  async archive(versionId: string, archivedBy: string): Promise<DocumentVersion> {
    return await this.update({
      id: versionId,
      lifecycleStatus: 'ARCHIVED',
      modifiedBy: archivedBy,
    });
  }

  // ===========================================================================
  // Version Comparison & Timeline
  // ===========================================================================

  async compareVersions(
    versionIdA: string,
    versionIdB: string
  ): Promise<VersionComparison> {
    const versionA = await this.findById(versionIdA);
    const versionB = await this.findById(versionIdB);

    if (!versionA || !versionB) {
      throw new Error('One or both versions not found');
    }

    // Simple line-based diff
    const linesA = versionA.content.split('\n');
    const linesB = versionB.content.split('\n');

    let addedLines = 0;
    let removedLines = 0;

    // Very basic diff (in production, use a real diff library)
    if (linesB.length > linesA.length) {
      addedLines = linesB.length - linesA.length;
    } else if (linesA.length > linesB.length) {
      removedLines = linesA.length - linesB.length;
    }

    return {
      versionA,
      versionB,
      differences: {
        contentDiff: 'Diff not implemented in synthetic provider',
        addedLines,
        removedLines,
        changedSections: [],
      },
    };
  }

  async getTimeline(documentId: string): Promise<VersionTimelineEntry[]> {
    const versions = await this.findByDocumentId(documentId);
    const latestActive = await this.findLatestVersion(documentId, 'ACTIVE_FINAL');

    return versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      versionLabel: v.versionLabel,
      lifecycleStatus: v.lifecycleStatus,
      createdBy: v.createdBy,
      createdAt: v.createdAt,
      changeDescription: v.changeDescription,
      changeType: v.changeType,
      isCurrent: latestActive?.id === v.id,
    }));
  }

  async getHistory(documentId: string): Promise<DocumentVersion[]> {
    return await this.findByDocumentId(documentId);
  }

  // ===========================================================================
  // Utility Operations
  // ===========================================================================

  calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async getNextVersionNumber(
    documentId: string,
    changeType: 'MAJOR' | 'MINOR' | 'PATCH'
  ): Promise<string> {
    const latest = await this.findLatestVersion(documentId);

    if (!latest) {
      return '1.0.0';
    }

    const parts = latest.versionNumber.split('.').map((p) => parseInt(p, 10));
    let [major, minor, patch] = parts;

    // Pad with zeros if needed
    if (parts.length === 2) {
      patch = 0;
    }

    switch (changeType) {
      case 'MAJOR':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'MINOR':
        minor += 1;
        patch = 0;
        break;
      case 'PATCH':
        patch += 1;
        break;
    }

    return `${major}.${minor}.${patch}`;
  }

  async canTransition(
    versionId: string,
    newStatus: DocumentLifecycleStatus
  ): Promise<{ allowed: boolean; reason?: string }> {
    const version = await this.findById(versionId);
    if (!version) {
      return { allowed: false, reason: 'Version not found' };
    }

    const currentStatus = version.lifecycleStatus;

    // Define allowed transitions
    const allowedTransitions: Record<DocumentLifecycleStatus, DocumentLifecycleStatus[]> = {
      RAW: ['PROCESSED', 'ARCHIVED'],
      PROCESSED: ['DRAFT', 'ARCHIVED'],
      DRAFT: ['UNDER_REVIEW', 'ARCHIVED'],
      UNDER_REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
      APPROVED: ['ACTIVE_FINAL', 'DRAFT', 'ARCHIVED'],
      ACTIVE_FINAL: ['SUPERSEDED', 'ARCHIVED'],
      SUPERSEDED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    const allowed = allowedTransitions[currentStatus]?.includes(newStatus) || false;

    return {
      allowed,
      reason: allowed ? undefined : `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  async getVersionStats(documentId: string): Promise<{
    totalVersions: number;
    versionsByStatus: Record<DocumentLifecycleStatus, number>;
    latestVersion: string;
    activeVersion?: string;
    firstCreated: Date;
    lastModified: Date;
  }> {
    const versions = await this.findByDocumentId(documentId);
    const activeVersion = await this.findLatestVersion(documentId, 'ACTIVE_FINAL');

    const versionsByStatus: Partial<Record<DocumentLifecycleStatus, number>> = {};
    for (const v of versions) {
      versionsByStatus[v.lifecycleStatus] = (versionsByStatus[v.lifecycleStatus] || 0) + 1;
    }

    return {
      totalVersions: versions.length,
      versionsByStatus: versionsByStatus as Record<DocumentLifecycleStatus, number>,
      latestVersion: versions[versions.length - 1]?.versionNumber || '0.0.0',
      activeVersion: activeVersion?.versionNumber,
      firstCreated: versions[0]?.createdAt || new Date(),
      lastModified: versions[versions.length - 1]?.modifiedAt || versions[versions.length - 1]?.createdAt || new Date(),
    };
  }

  async searchContent(
    tenantId: string,
    query: string,
    status?: DocumentLifecycleStatus
  ): Promise<DocumentVersion[]> {
    const versions = await this.findAll({ tenantId, lifecycleStatus: status });
    const lowerQuery = query.toLowerCase();

    return versions.filter((v) =>
      v.content.toLowerCase().includes(lowerQuery) ||
      v.versionLabel?.toLowerCase().includes(lowerQuery) ||
      v.changeDescription?.toLowerCase().includes(lowerQuery)
    );
  }

  // ===========================================================================
  // Demo Data Initialization
  // ===========================================================================

  private initializeDemoData() {
    // Will be populated with client plan versions
    console.log('[DocumentVersion] Demo data initialization ready');
  }

  private generateId(): string {
    return 'ver_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
