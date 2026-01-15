import { NextRequest, NextResponse } from 'next/server';
import {
  CASE_ITEMS,
  CASE_STATS,
  CASE_TYPE_INFO,
} from '@/lib/data/synthetic/cases.data';

/**
 * GET /api/cases
 *
 * Returns case items with optional filtering.
 *
 * Query params:
 * - status: Filter by status (NEW | UNDER_REVIEW | PENDING_INFO | ESCALATED | RESOLVED | CLOSED)
 * - type: Filter by type (EXCEPTION | DISPUTE | TERRITORY_CHANGE | PLAN_MODIFICATION | QUOTA_ADJUSTMENT)
 * - priority: Filter by priority (LOW | MEDIUM | HIGH | URGENT)
 * - committee: Filter by committee (SGCC | CRB)
 * - search: Search by title or case number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const committee = searchParams.get('committee');
    const search = searchParams.get('search');

    let filtered = [...CASE_ITEMS];

    // Apply filters
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }
    if (priority) {
      filtered = filtered.filter(c => c.priority === priority);
    }
    if (committee) {
      filtered = filtered.filter(c => c.committee === committee);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.caseNumber.toLowerCase().includes(searchLower)
      );
    }

    // Sort by most recent first
    filtered.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // Recalculate stats based on full data (not filtered)
    const stats = {
      new: CASE_ITEMS.filter(c => c.status === 'NEW').length,
      underReview: CASE_ITEMS.filter(c => c.status === 'UNDER_REVIEW').length,
      pendingInfo: CASE_ITEMS.filter(c => c.status === 'PENDING_INFO').length,
      escalated: CASE_ITEMS.filter(c => c.status === 'ESCALATED').length,
      resolved: CASE_ITEMS.filter(c => c.status === 'RESOLVED').length,
      closed: CASE_ITEMS.filter(c => c.status === 'CLOSED').length,
      avgResolutionDays: 10.5,
    };

    return NextResponse.json({
      cases: filtered,
      stats,
      typeInfo: CASE_TYPE_INFO,
      meta: {
        total: filtered.length,
        filters: { status, type, priority, committee, search },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}
