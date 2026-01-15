import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { DocumentFiltersSchema } from '@/lib/contracts/document.contract';

/**
 * GET /api/sgm/documents
 *
 * Query documents with optional filters.
 *
 * Query params:
 * - tenantId: Filter by tenant (default: demo-tenant-001)
 * - status: Filter by status (DRAFT | UNDER_REVIEW | PENDING_APPROVAL | APPROVED | ACTIVE | ARCHIVED)
 * - documentType: Filter by type (FRAMEWORK | POLICY | PROCEDURE | TEMPLATE | CHECKLIST | GUIDE)
 * - category: Filter by category
 * - search: Full-text search query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const filters = DocumentFiltersSchema.parse({
      tenantId: searchParams.get('tenantId') || 'demo-tenant-001',
      status: searchParams.get('status') || undefined,
      documentType: searchParams.get('documentType') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    const documents = await documentProvider.findAll(filters);

    // Get counts by status and type
    const allDocs = await documentProvider.findAll({ tenantId: filters.tenantId });
    const countsByStatus = {
      DRAFT: allDocs.filter(d => d.status === 'DRAFT').length,
      UNDER_REVIEW: allDocs.filter(d => d.status === 'UNDER_REVIEW').length,
      PENDING_APPROVAL: allDocs.filter(d => d.status === 'PENDING_APPROVAL').length,
      APPROVED: allDocs.filter(d => d.status === 'APPROVED').length,
      ACTIVE: allDocs.filter(d => d.status === 'ACTIVE').length,
      ARCHIVED: allDocs.filter(d => d.status === 'ARCHIVED').length,
    };

    const countsByType = {
      FRAMEWORK: allDocs.filter(d => d.documentType === 'FRAMEWORK').length,
      POLICY: allDocs.filter(d => d.documentType === 'POLICY').length,
      PROCEDURE: allDocs.filter(d => d.documentType === 'PROCEDURE').length,
      TEMPLATE: allDocs.filter(d => d.documentType === 'TEMPLATE').length,
      CHECKLIST: allDocs.filter(d => d.documentType === 'CHECKLIST').length,
      GUIDE: allDocs.filter(d => d.documentType === 'GUIDE').length,
    };

    return NextResponse.json(
      {
        documents,
        meta: {
          total: documents.length,
          countsByStatus,
          countsByType,
          filters,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}

/**
 * POST /api/sgm/documents
 *
 * Create a new document (metadata only, file upload handled separately).
 *
 * Body: CreateDocument
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    // Create document with defaults
    const document = await documentProvider.create({
      tenantId: body.tenantId || 'demo-tenant-001',
      documentCode: body.documentCode,
      title: body.title,
      description: body.description,
      documentType: body.documentType,
      category: body.category,
      tags: body.tags || [],
      version: body.version || '1.0.0',
      status: body.status || 'DRAFT',
      fileType: body.fileType || 'md',
      filePath: body.filePath || `documents/${body.documentCode}.${body.fileType || 'md'}`,
      fileSize: body.fileSize || 0,
      owner: body.owner || 'system',
      createdBy: body.createdBy || 'system',
      retentionPeriod: body.retentionPeriod || 7,
      legalReviewStatus: body.legalReviewStatus || 'NOT_REQUIRED',
      dataType: body.dataType || 'client',
      demoMetadata: body.demoMetadata,
    });

    return NextResponse.json(
      {
        document,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}
