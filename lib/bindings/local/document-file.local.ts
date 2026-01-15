import type { IDocumentPort } from '@/lib/ports/document.port';
import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  FileType,
} from '@/lib/contracts/document.contract';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

/**
 * Local File Storage Document Provider
 *
 * Stores document metadata in SQLite and files on local filesystem
 * Privacy-first: All data stays on user's machine
 */
export class LocalFileDocumentProvider implements IDocumentPort {
  private documentRoot: string;

  constructor() {
    this.documentRoot = process.env.DOCUMENT_ROOT || './data/documents';
  }

  /**
   * Ensure document directory exists
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(content: Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get local file path for document
   */
  private getFilePath(documentCode: string, version: string, fileType: FileType): string {
    return path.join(this.documentRoot, documentCode, `${version}.${fileType}`);
  }

  async findAll(filters: DocumentFilters): Promise<Document[]> {
    const where: any = {
      tenantId: filters.tenantId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.documentType) where.documentType = filters.documentType;
    if (filters.category) where.category = filters.category;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { documentCode: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { lastUpdated: 'desc' },
    });

    return documents.map(this.mapPrismaToDocument);
  }

  async findById(id: string): Promise<Document | null> {
    const doc = await prisma.document.findUnique({ where: { id } });
    return doc ? this.mapPrismaToDocument(doc) : null;
  }

  async findByType(tenantId: string, documentType: Document['documentType']): Promise<Document[]> {
    const documents = await prisma.document.findMany({
      where: { tenantId, documentType },
      orderBy: { lastUpdated: 'desc' },
    });
    return documents.map(this.mapPrismaToDocument);
  }

  async findByStatus(tenantId: string, status: Document['status']): Promise<Document[]> {
    const documents = await prisma.document.findMany({
      where: { tenantId, status },
      orderBy: { lastUpdated: 'desc' },
    });
    return documents.map(this.mapPrismaToDocument);
  }

  async findActive(tenantId: string, asOfDate?: Date): Promise<Document[]> {
    const targetDate = asOfDate || new Date();
    const documents = await prisma.document.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        effectiveDate: { lte: targetDate },
        OR: [
          { expirationDate: null },
          { expirationDate: { gt: targetDate } },
        ],
      },
      orderBy: { lastUpdated: 'desc' },
    });
    return documents.map(this.mapPrismaToDocument);
  }

  async findVersions(documentId: string): Promise<Document[]> {
    const doc = await this.findById(documentId);
    if (!doc) return [];

    const documents = await prisma.document.findMany({
      where: {
        documentCode: doc.documentCode,
        tenantId: doc.tenantId,
      },
      orderBy: { version: 'desc' },
    });
    return documents.map(this.mapPrismaToDocument);
  }

  async findLatestVersion(tenantId: string, documentCode: string): Promise<Document | null> {
    const doc = await prisma.document.findFirst({
      where: { tenantId, documentCode },
      orderBy: { version: 'desc' },
    });
    return doc ? this.mapPrismaToDocument(doc) : null;
  }

  async create(data: CreateDocument): Promise<Document> {
    const doc = await prisma.document.create({
      data: {
        tenantId: data.tenantId,
        documentCode: data.documentCode,
        title: data.title,
        description: data.description || '',
        documentType: data.documentType,
        category: data.category || '',
        tags: data.tags || [],
        version: data.version,
        status: data.status,
        fileType: data.fileType,
        filePath: data.filePath,
        fileSize: data.fileSize,
        owner: data.owner,
        createdBy: data.createdBy,
        retentionPeriod: data.retentionPeriod,
        legalReviewStatus: data.legalReviewStatus,
        effectiveDate: data.effectiveDate,
        expirationDate: data.expirationDate,
        approvalWorkflowId: data.approvalWorkflowId,
        relatedDocs: [],
        referencedBy: [],
        complianceFlags: [],
      },
    });

    return this.mapPrismaToDocument(doc);
  }

  async update(data: UpdateDocument): Promise<Document> {
    const doc = await prisma.document.update({
      where: { id: data.id },
      data: {
        ...data,
        lastUpdated: new Date(),
      },
    });

    return this.mapPrismaToDocument(doc);
  }

  async uploadFile(documentId: string, file: File, fileType: FileType): Promise<Document> {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate checksum
    const checksum = this.calculateChecksum(buffer);

    // Determine file path
    const filePath = this.getFilePath(doc.documentCode, doc.version, fileType);

    // Ensure directory exists
    await this.ensureDirectoryExists(filePath);

    // Write file to local filesystem
    await fs.writeFile(filePath, buffer);

    // Update document metadata
    return this.update({
      id: documentId,
      updatedBy: doc.owner,
      filePath,
      fileSize: buffer.length,
      checksum,
      fileType,
    });
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);

    const fullPath = path.isAbsolute(doc.filePath)
      ? doc.filePath
      : path.join(process.cwd(), doc.filePath);

    return fs.readFile(fullPath);
  }

  async getFileUrl(documentId: string): Promise<string> {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);

    // For local files, return file:// URL
    const fullPath = path.isAbsolute(doc.filePath)
      ? doc.filePath
      : path.join(process.cwd(), doc.filePath);

    return `file://${fullPath}`;
  }

  async createVersion(
    documentId: string,
    changes: Partial<Document>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Document> {
    const existing = await this.findById(documentId);
    if (!existing) throw new Error(`Document not found: ${documentId}`);

    // Calculate new version
    const [major, minor, patch] = existing.version.split('.').map(Number);
    let newVersion: string;

    if (bumpType === 'major') newVersion = `${major + 1}.0.0`;
    else if (bumpType === 'minor') newVersion = `${major}.${minor + 1}.0`;
    else newVersion = `${major}.${minor}.${patch + 1}`;

    // Create new document version
    return this.create({
      tenantId: existing.tenantId,
      documentCode: existing.documentCode,
      title: changes.title || existing.title,
      description: changes.description || existing.description,
      documentType: existing.documentType,
      category: existing.category,
      tags: existing.tags,
      version: newVersion,
      status: 'DRAFT',
      fileType: existing.fileType,
      filePath: this.getFilePath(existing.documentCode, newVersion, existing.fileType),
      fileSize: 0,
      owner: existing.owner,
      createdBy: changes.updatedBy || existing.owner,
      retentionPeriod: existing.retentionPeriod,
      legalReviewStatus: 'NOT_REQUIRED',
      dataType: existing.dataType || 'client',
    });
  }

  async submitForReview(documentId: string, submittedBy: string): Promise<Document> {
    return this.update({ id: documentId, updatedBy: submittedBy, status: 'UNDER_REVIEW' });
  }

  async submitForApproval(documentId: string, submittedBy: string, workflowId?: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: submittedBy,
      status: 'PENDING_APPROVAL',
      approvalWorkflowId: workflowId,
    });
  }

  async approve(documentId: string, approvedBy: string, comments?: string): Promise<Document> {
    return this.update({ id: documentId, updatedBy: approvedBy, status: 'APPROVED' });
  }

  async activate(documentId: string, activatedBy: string): Promise<Document> {
    return this.update({ id: documentId, updatedBy: activatedBy, status: 'ACTIVE' });
  }

  async archive(documentId: string, archivedBy: string): Promise<Document> {
    return this.update({ id: documentId, updatedBy: archivedBy, status: 'ARCHIVED' });
  }

  async reject(documentId: string, rejectedBy: string, reason: string): Promise<Document> {
    return this.update({ id: documentId, updatedBy: rejectedBy, status: 'DRAFT' });
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await prisma.document.delete({ where: { id } });
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const counts = await prisma.document.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    return counts.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const counts = await prisma.document.groupBy({
      by: ['documentType'],
      where: { tenantId },
      _count: true,
    });

    return counts.reduce((acc: Record<string, number>, item: { documentType: string; _count: number }) => {
      acc[item.documentType] = item._count;
      return acc;
    }, {} as Record<string, number>);
  }

  async search(tenantId: string, query: string): Promise<Document[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findNeedingReview(tenantId: string): Promise<Document[]> {
    const now = new Date();
    const documents = await prisma.document.findMany({
      where: {
        tenantId,
        nextReview: { lte: now },
      },
      orderBy: { nextReview: 'asc' },
    });
    return documents.map(this.mapPrismaToDocument);
  }

  async findPendingApproval(tenantId: string): Promise<Document[]> {
    return this.findByStatus(tenantId, 'PENDING_APPROVAL');
  }

  async linkDocuments(sourceDocId: string, targetDocId: string, relationType: string): Promise<void> {
    const source = await prisma.document.findUnique({ where: { id: sourceDocId } });
    if (!source) throw new Error(`Source document not found: ${sourceDocId}`);

    const relatedDocs = source.relatedDocs as string[];
    if (!relatedDocs.includes(targetDocId)) {
      await prisma.document.update({
        where: { id: sourceDocId },
        data: {
          relatedDocs: [...relatedDocs, targetDocId],
        },
      });
    }
  }

  async unlinkDocuments(sourceDocId: string, targetDocId: string): Promise<void> {
    const source = await prisma.document.findUnique({ where: { id: sourceDocId } });
    if (!source) throw new Error(`Source document not found: ${sourceDocId}`);

    const relatedDocs = source.relatedDocs as string[];
    await prisma.document.update({
      where: { id: sourceDocId },
      data: {
        relatedDocs: relatedDocs.filter((id) => id !== targetDocId),
      },
    });
  }

  /**
   * Map Prisma document to contract Document type
   */
  private mapPrismaToDocument(doc: any): Document {
    return {
      id: doc.id,
      tenantId: doc.tenantId,
      documentCode: doc.documentCode,
      title: doc.title,
      description: doc.description,
      documentType: doc.documentType,
      category: doc.category,
      tags: doc.tags,
      version: doc.version,
      status: doc.status,
      fileType: doc.fileType,
      filePath: doc.filePath,
      fileSize: doc.fileSize,
      owner: doc.owner,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      lastUpdated: doc.lastUpdated,
      effectiveDate: doc.effectiveDate,
      expirationDate: doc.expirationDate,
      retentionPeriod: doc.retentionPeriod,
      legalReviewStatus: doc.legalReviewStatus,
      updatedBy: doc.updatedBy,
      approvalWorkflowId: doc.approvalWorkflowId,
      checksum: doc.checksum,
      relatedDocs: doc.relatedDocs,
      referencedBy: doc.referencedBy,
      supersedes: doc.supersedes,
      supersededBy: doc.supersededBy,
      complianceFlags: doc.complianceFlags,
      metadata: doc.metadata,
      nextReview: doc.nextReview,
      approvers: doc.approvers,
      dataType: doc.dataType || 'client',
      demoMetadata: doc.demoMetadata,
    };
  }
}
