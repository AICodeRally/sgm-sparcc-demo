import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';

/**
 * GET /api/sgm/search
 *
 * Full-text search across all documents.
 *
 * Query params:
 * - q: Search query (required)
 * - tenantId: Filter by tenant (default: demo-tenant-001)
 * - documentType: Filter by type
 * - status: Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const tenantId = searchParams.get('tenantId') || 'demo-tenant-001';
    const documentType = searchParams.get('documentType') || undefined;
    const status = searchParams.get('status') || undefined;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    // Perform search
    let results = await documentProvider.search(tenantId, query);

    // Apply additional filters
    if (documentType) {
      results = results.filter(d => d.documentType === documentType);
    }
    if (status) {
      results = results.filter(d => d.status === status);
    }

    // Sort by relevance (simple: prioritize title matches)
    const queryLower = query.toLowerCase();
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(queryLower) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(queryLower) ? 1 : 0;
      return bTitle - aTitle;
    });

    return NextResponse.json(
      {
        query,
        results,
        meta: {
          total: results.length,
          filters: {
            documentType: documentType || undefined,
            status: status || undefined,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
