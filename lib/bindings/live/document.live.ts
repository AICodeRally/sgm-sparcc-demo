/**
 * Live Document Provider - Prisma-backed implementation
 *
 * Implements document operations using Prisma ORM
 */

import type { IDocumentPort } from '@/lib/ports/document.port';
import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  FileType,
} from '@/lib/contracts/document.contract';
import { getPrismaClient } from '@/lib/db/prisma';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';

export class LiveDocumentProvider implements IDocumentPort {
  private prisma = getPrismaClient();

  async findAll(filters?: DocumentFilters): Promise<Document[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.status) where.status = filters.status;
    if (filters?.documentType) where.documentType = filters.documentType;
    if (filters?.category) where.category = filters.category;

    const documents = await this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return documents as Document[];
  }

  async findById(id: string): Promise<Document | null> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    return document as Document | null;
  }

  async findByType(tenantId: string, documentType: Document['documentType']): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: { tenantId, documentType },
      orderBy: { createdAt: 'desc' },
    });

    return documents as Document[];
  }

  async findByStatus(tenantId: string, status: Document['status']): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: { tenantId, status },
      orderBy: { createdAt: 'desc' },
    });

    return documents as Document[];
  }

  async findActive(tenantId: string, asOfDate?: Date): Promise<Document[]> {
    const date = asOfDate || new Date();

    const documents = await this.prisma.document.findMany({
      where: {
        tenantId,
        status: 'active',
        effectiveDate: { lte: date },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return documents as Document[];
  }

  async findVersions(documentId: string): Promise<Document[]> {
    const document = await this.findById(documentId);
    if (!document) return [];

    const versions = await this.prisma.document.findMany({
      where: {
        tenantId: document.tenantId,
        documentCode: document.documentCode,
      },
      orderBy: { version: 'asc' },
    });

    return versions as Document[];
  }

  async findLatestVersion(tenantId: string, documentCode: string): Promise<Document | null> {
    const document = await this.prisma.document.findFirst({
      where: { tenantId, documentCode },
      orderBy: { version: 'desc' },
    });

    return document as Document | null;
  }

  async create(data: CreateDocument): Promise<Document> {
    const document = await this.prisma.document.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return document as Document;
  }

  async uploadFile(documentId: string, file: File, fileType: FileType): Promise<Document> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        filePath: `/uploads/${documentId}/${file.name}`,
        fileSize: buffer.length,
        fileType,
        checksum,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    const document = await this.findById(documentId);
    if (!document || !document.filePath) {
      throw new Error(`Document ${documentId} has no file`);
    }

    const buffer = await fs.readFile(document.filePath);
    return buffer;
  }

  async getFileUrl(documentId: string): Promise<string> {
    const document = await this.findById(documentId);
    if (!document || !document.filePath) {
      throw new Error(`Document ${documentId} has no file`);
    }

    return document.filePath;
  }

  async update(data: UpdateDocument): Promise<Document> {
    const { id, ...updates } = data;

    const document = await this.prisma.document.update({
      where: { id },
      data: {
        ...updates,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async createVersion(
    documentId: string,
    changes: Partial<Document>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Document> {
    const existing = await this.findById(documentId);
    if (!existing) {
      throw new Error(`Document ${documentId} not found`);
    }

    const currentVersion = existing.version || '1.0.0';
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    let newVersion: string;
    if (bumpType === 'major') {
      newVersion = `${major + 1}.0.0`;
    } else if (bumpType === 'minor') {
      newVersion = `${major}.${minor + 1}.0`;
    } else {
      newVersion = `${major}.${minor}.${patch + 1}`;
    }

    // Mark existing as superseded
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        supersededBy: 'pending',
        lastUpdated: new Date(),
      },
    });

    // Create new version
    const newDoc = await this.prisma.document.create({
      data: {
        tenantId: existing.tenantId,
        documentCode: existing.documentCode,
        title: changes.title || existing.title,
        description: changes.description || existing.description,
        documentType: existing.documentType,
        category: existing.category,
        tags: existing.tags as any,
        version: newVersion,
        status: 'draft',
        owner: existing.owner,
        createdBy: changes.updatedBy || existing.createdBy,
        supersedes: documentId,
      },
    });

    // Link supersededBy on old doc
    await this.prisma.document.update({
      where: { id: documentId },
      data: { supersededBy: newDoc.id },
    });

    return newDoc as Document;
  }

  async submitForReview(documentId: string, submittedBy: string): Promise<Document> {
    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'under_review',
        updatedBy: submittedBy,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async submitForApproval(documentId: string, submittedBy: string, workflowId?: string): Promise<Document> {
    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'pending_approval',
        approvalWorkflowId: workflowId,
        updatedBy: submittedBy,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async approve(documentId: string, approvedBy: string, comments?: string): Promise<Document> {
    const existing = await this.findById(documentId);
    if (!existing) {
      throw new Error(`Document ${documentId} not found`);
    }

    const currentApprovers = (existing.approvers as unknown as string[]) || [];

    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'approved',
        approvers: [...currentApprovers, approvedBy],
        updatedBy: approvedBy,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async activate(documentId: string, activatedBy: string): Promise<Document> {
    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'active',
        effectiveDate: new Date(),
        updatedBy: activatedBy,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async archive(documentId: string, archivedBy: string): Promise<Document> {
    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'archived',
        updatedBy: archivedBy,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async reject(documentId: string, rejectedBy: string, reason: string): Promise<Document> {
    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'draft',
        updatedBy: rejectedBy,
        lastUpdated: new Date(),
      },
    });

    return document as Document;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: {
        status: 'archived',
        updatedBy: deletedBy,
        lastUpdated: new Date(),
      },
    });
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.document.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.document.groupBy({
      by: ['documentType'],
      where: { tenantId },
      _count: { documentType: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.documentType] = item._count.documentType;
      return acc;
    }, {} as Record<string, number>);
  }

  async search(tenantId: string, query: string): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: {
        tenantId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents as Document[];
  }

  async findNeedingReview(tenantId: string): Promise<Document[]> {
    const now = new Date();

    const documents = await this.prisma.document.findMany({
      where: {
        tenantId,
        nextReview: { lte: now },
      },
      orderBy: { nextReview: 'asc' },
    });

    return documents as Document[];
  }

  async findPendingApproval(tenantId: string): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: {
        tenantId,
        status: 'pending_approval',
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents as Document[];
  }

  async linkDocuments(sourceDocId: string, targetDocId: string, relationType: string): Promise<void> {
    const document = await this.findById(sourceDocId);
    if (!document) {
      throw new Error(`Document ${sourceDocId} not found`);
    }

    const currentRelated = (document.relatedDocs as any[]) || [];
    const newLink = { documentId: targetDocId, relationType };

    await this.prisma.document.update({
      where: { id: sourceDocId },
      data: {
        relatedDocs: [...currentRelated, newLink],
        lastUpdated: new Date(),
      },
    });
  }

  async unlinkDocuments(sourceDocId: string, targetDocId: string): Promise<void> {
    const document = await this.findById(sourceDocId);
    if (!document) {
      throw new Error(`Document ${sourceDocId} not found`);
    }

    const currentRelated = (document.relatedDocs as any[]) || [];
    const filtered = currentRelated.filter((rel: any) => rel.documentId !== targetDocId);

    await this.prisma.document.update({
      where: { id: sourceDocId },
      data: {
        relatedDocs: filtered,
        lastUpdated: new Date(),
      },
    });
  }
}
