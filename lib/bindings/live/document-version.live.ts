/**
 * Live Document Version Provider - Prisma-backed implementation
 *
 * Implements document version operations with full provenance tracking
 */

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
import { getPrismaClient } from '@/lib/db/prisma';
import * as crypto from 'crypto';

/**
 * Valid lifecycle transitions
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  RAW: ['PROCESSED', 'ARCHIVED'],
  PROCESSED: ['DRAFT', 'ARCHIVED'],
  DRAFT: ['UNDER_REVIEW', 'ARCHIVED'],
  UNDER_REVIEW: ['APPROVED', 'DRAFT', 'ARCHIVED'],
  APPROVED: ['ACTIVE_FINAL', 'DRAFT', 'ARCHIVED'],
  ACTIVE_FINAL: ['SUPERSEDED', 'ARCHIVED'],
  SUPERSEDED: ['ARCHIVED'],
  ARCHIVED: [],
};

export class LiveDocumentVersionProvider implements IDocumentVersionPort {
  private prisma = getPrismaClient();

  async findAll(filters?: VersionFilters): Promise<DocumentVersion[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.documentId) where.documentId = filters.documentId;
    if (filters?.lifecycleStatus) where.lifecycleStatus = filters.lifecycleStatus;
    if (filters?.createdBy) where.createdBy = filters.createdBy;

    const versions = await this.prisma.documentVersion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return versions as DocumentVersion[];
  }

  async findById(id: string): Promise<DocumentVersion | null> {
    const version = await this.prisma.documentVersion.findUnique({
      where: { id },
    });

    return version as DocumentVersion | null;
  }

  async findByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    const versions = await this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'asc' },
    });

    return versions as DocumentVersion[];
  }

  async findLatestVersion(
    documentId: string,
    status?: DocumentLifecycleStatus
  ): Promise<DocumentVersion | null> {
    const where: any = { documentId };
    if (status) where.lifecycleStatus = status;

    const version = await this.prisma.documentVersion.findFirst({
      where,
      orderBy: { versionNumber: 'desc' },
    });

    return version as DocumentVersion | null;
  }

  async findByVersionNumber(
    documentId: string,
    versionNumber: string
  ): Promise<DocumentVersion | null> {
    const version = await this.prisma.documentVersion.findFirst({
      where: { documentId, versionNumber },
    });

    return version as DocumentVersion | null;
  }

  async create(data: CreateDocumentVersion): Promise<DocumentVersion> {
    const version = await this.prisma.documentVersion.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return version as DocumentVersion;
  }

  async update(data: UpdateDocumentVersion): Promise<DocumentVersion> {
    const { id, ...updates } = data;

    const version = await this.prisma.documentVersion.update({
      where: { id },
      data: {
        ...updates,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
        modifiedAt: new Date(),
      },
    });

    return version as DocumentVersion;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.documentVersion.update({
      where: { id },
      data: {
        lifecycleStatus: 'ARCHIVED',
        modifiedBy: deletedBy,
        modifiedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.documentVersion.delete({
      where: { id },
    });
  }

  async importRaw(data: ImportRawDocument): Promise<DocumentVersion> {
    const documentId = data.documentId || '';
    const nextVersion = await this.getNextVersionNumber(documentId, 'MAJOR');

    const version = await this.prisma.documentVersion.create({
      data: {
        tenantId: data.tenantId,
        documentId: documentId,
        versionNumber: nextVersion,
        versionLabel: `RAW Import ${nextVersion}`,
        lifecycleStatus: 'RAW',
        content: '',
        contentFormat: 'plain_text',
        sourceFileUrl: data.sourceFileUrl,
        sourceFileName: data.sourceFileName,
        sourceFileType: data.sourceFileType,
        createdBy: data.createdBy,
        changeDescription: 'Raw document import',
        changeType: 'MAJOR',
        checksum: '',
        fileSize: 0,
      },
    });

    return version as DocumentVersion;
  }

  async processToMarkdown(data: ProcessToMarkdown): Promise<DocumentVersion> {
    const sourceVersion = await this.findById(data.rawVersionId);
    if (!sourceVersion) {
      throw new Error(`Source version ${data.rawVersionId} not found`);
    }

    const nextVersion = await this.getNextVersionNumber(sourceVersion.documentId, 'MINOR');

    const version = await this.prisma.documentVersion.create({
      data: {
        tenantId: sourceVersion.tenantId,
        documentId: sourceVersion.documentId,
        versionNumber: nextVersion,
        versionLabel: `Processed ${nextVersion}`,
        lifecycleStatus: 'PROCESSED',
        content: data.processedContent,
        contentFormat: 'markdown',
        createdBy: data.processedBy,
        changeDescription: data.processingNotes || 'Processed to markdown',
        changeType: 'MINOR',
        previousVersionId: data.rawVersionId,
        checksum: this.calculateChecksum(data.processedContent),
        fileSize: Buffer.byteLength(data.processedContent, 'utf8'),
      },
    });

    return version as DocumentVersion;
  }

  async transitionToDraft(data: TransitionToDraft): Promise<DocumentVersion> {
    const sourceVersion = await this.findById(data.versionId);
    if (!sourceVersion) {
      throw new Error(`Source version ${data.versionId} not found`);
    }

    const nextVersion = await this.getNextVersionNumber(sourceVersion.documentId, 'MINOR');
    const draftContent = data.draftContent || sourceVersion.content || '';

    const version = await this.prisma.documentVersion.create({
      data: {
        tenantId: sourceVersion.tenantId,
        documentId: sourceVersion.documentId,
        versionNumber: nextVersion,
        versionLabel: `Draft ${nextVersion}`,
        lifecycleStatus: 'DRAFT',
        content: draftContent,
        contentFormat: sourceVersion.contentFormat,
        createdBy: data.transitionedBy,
        changeDescription: data.changeDescription || 'Transitioned to draft',
        changeType: 'MINOR',
        previousVersionId: data.versionId,
        checksum: this.calculateChecksum(draftContent),
        fileSize: Buffer.byteLength(draftContent, 'utf8'),
      },
    });

    return version as DocumentVersion;
  }

  async submitForReview(versionId: string, submittedBy: string): Promise<DocumentVersion> {
    const version = await this.prisma.documentVersion.update({
      where: { id: versionId },
      data: {
        lifecycleStatus: 'UNDER_REVIEW',
        modifiedBy: submittedBy,
        modifiedAt: new Date(),
      },
    });

    return version as DocumentVersion;
  }

  async approve(data: ApproveVersion): Promise<DocumentVersion> {
    const version = await this.prisma.documentVersion.update({
      where: { id: data.versionId },
      data: {
        lifecycleStatus: 'APPROVED',
        approvedBy: data.approvedBy,
        approvedAt: new Date(),
        approvalComments: data.approvalComments,
        modifiedBy: data.approvedBy,
        modifiedAt: new Date(),
      },
    });

    return version as DocumentVersion;
  }

  async reject(
    versionId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<DocumentVersion> {
    const version = await this.prisma.documentVersion.update({
      where: { id: versionId },
      data: {
        lifecycleStatus: 'DRAFT',
        approvalComments: rejectionReason,
        modifiedBy: rejectedBy,
        modifiedAt: new Date(),
      },
    });

    return version as DocumentVersion;
  }

  async publishToActive(data: PublishToActive): Promise<DocumentVersion> {
    const version = await this.findById(data.versionId);
    if (!version) {
      throw new Error(`Version ${data.versionId} not found`);
    }

    // Supersede any existing ACTIVE_FINAL version
    const currentActive = await this.findLatestVersion(version.documentId, 'ACTIVE_FINAL' as DocumentLifecycleStatus);
    if (currentActive) {
      await this.prisma.documentVersion.update({
        where: { id: currentActive.id },
        data: {
          lifecycleStatus: 'SUPERSEDED',
          supersededBy: data.versionId,
          modifiedAt: new Date(),
        },
      });
    }

    const updated = await this.prisma.documentVersion.update({
      where: { id: data.versionId },
      data: {
        lifecycleStatus: 'ACTIVE_FINAL',
        publishedBy: data.publishedBy,
        publishedAt: new Date(),
        modifiedBy: data.publishedBy,
        modifiedAt: new Date(),
      },
    });

    return updated as DocumentVersion;
  }

  async archive(versionId: string, archivedBy: string): Promise<DocumentVersion> {
    const version = await this.prisma.documentVersion.update({
      where: { id: versionId },
      data: {
        lifecycleStatus: 'ARCHIVED',
        modifiedBy: archivedBy,
        modifiedAt: new Date(),
      },
    });

    return version as DocumentVersion;
  }

  async compareVersions(
    versionIdA: string,
    versionIdB: string
  ): Promise<VersionComparison> {
    const versionA = await this.findById(versionIdA);
    const versionB = await this.findById(versionIdB);

    if (!versionA || !versionB) {
      throw new Error('One or both versions not found');
    }

    const contentA = versionA.content || '';
    const contentB = versionB.content || '';

    const linesA = contentA.split('\n');
    const linesB = contentB.split('\n');

    return {
      versionA: versionA,
      versionB: versionB,
      differences: {
        contentDiff: `--- ${versionA.versionNumber}\n+++ ${versionB.versionNumber}\n`,
        addedLines: linesB.filter((line: string) => !linesA.includes(line)).length,
        removedLines: linesA.filter((line: string) => !linesB.includes(line)).length,
      },
    } as VersionComparison;
  }

  async getTimeline(documentId: string): Promise<VersionTimelineEntry[]> {
    const versions = await this.findByDocumentId(documentId);

    return versions.map((v: DocumentVersion) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      versionLabel: v.versionLabel,
      lifecycleStatus: v.lifecycleStatus,
      createdBy: v.createdBy,
      createdAt: v.createdAt,
      changeDescription: v.changeDescription,
      changeType: v.changeType,
    })) as VersionTimelineEntry[];
  }

  async getHistory(documentId: string): Promise<DocumentVersion[]> {
    return this.findByDocumentId(documentId);
  }

  calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  async getNextVersionNumber(
    documentId: string,
    changeType: 'MAJOR' | 'MINOR' | 'PATCH'
  ): Promise<string> {
    const latest = await this.findLatestVersion(documentId);

    if (!latest) {
      return '1.0.0';
    }

    const currentVersion = latest.versionNumber || '0.0.0';
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    if (changeType === 'MAJOR') {
      return `${major + 1}.0.0`;
    } else if (changeType === 'MINOR') {
      return `${major}.${minor + 1}.0`;
    } else {
      return `${major}.${minor}.${patch + 1}`;
    }
  }

  async canTransition(
    versionId: string,
    newStatus: DocumentLifecycleStatus
  ): Promise<{ allowed: boolean; reason?: string }> {
    const version = await this.findById(versionId);
    if (!version) {
      return { allowed: false, reason: 'Version not found' };
    }

    const currentStatus = version.lifecycleStatus as string;
    const validTargets = VALID_TRANSITIONS[currentStatus] || [];

    if (validTargets.includes(newStatus as string)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTargets.join(', ')}`,
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

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        versionsByStatus: {} as Record<DocumentLifecycleStatus, number>,
        latestVersion: '0.0.0',
        firstCreated: new Date(),
        lastModified: new Date(),
      };
    }

    const versionsByStatus: Record<string, number> = {};
    versions.forEach((v: DocumentVersion) => {
      const status = v.lifecycleStatus as string;
      versionsByStatus[status] = (versionsByStatus[status] || 0) + 1;
    });

    const activeVersion = versions.find(
      (v: DocumentVersion) => v.lifecycleStatus === 'ACTIVE_FINAL'
    );

    const sorted = [...versions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      totalVersions: versions.length,
      versionsByStatus: versionsByStatus as Record<DocumentLifecycleStatus, number>,
      latestVersion: sorted[0].versionNumber,
      activeVersion: activeVersion?.versionNumber,
      firstCreated: versions[0].createdAt,
      lastModified: sorted[0].modifiedAt || sorted[0].createdAt,
    };
  }

  async searchContent(
    tenantId: string,
    query: string,
    status?: DocumentLifecycleStatus
  ): Promise<DocumentVersion[]> {
    const where: any = {
      tenantId,
      content: { contains: query, mode: 'insensitive' },
    };

    if (status) {
      where.lifecycleStatus = status;
    }

    const versions = await this.prisma.documentVersion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return versions as DocumentVersion[];
  }
}
