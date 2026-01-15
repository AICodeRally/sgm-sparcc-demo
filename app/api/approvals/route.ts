import { NextRequest, NextResponse } from 'next/server';
import {
  APPROVAL_ITEMS,
  APPROVAL_STATS,
  CRB_WINDFALL_DECISIONS,
} from '@/lib/data/synthetic/governance-approvals.data';

/**
 * GET /api/approvals
 *
 * Returns approval items with optional filtering.
 *
 * Query params:
 * - status: Filter by status (PENDING | IN_REVIEW | APPROVED | REJECTED | NEEDS_INFO)
 * - committee: Filter by committee (SGCC | CRB)
 * - type: Filter by type (POLICY | SPIF | WINDFALL | EXCEPTION | DOCUMENT)
 * - priority: Filter by priority (LOW | MEDIUM | HIGH | URGENT)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const committee = searchParams.get('committee');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let filtered = [...APPROVAL_ITEMS];

    // Apply filters
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (committee) {
      filtered = filtered.filter(a => a.committee === committee);
    }
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (priority) {
      filtered = filtered.filter(a => a.priority === priority);
    }

    // Recalculate stats based on full data (not filtered)
    const stats = {
      pending: APPROVAL_ITEMS.filter(a => a.status === 'PENDING').length,
      inReview: APPROVAL_ITEMS.filter(a => a.status === 'IN_REVIEW').length,
      approved: APPROVAL_ITEMS.filter(a => a.status === 'APPROVED').length,
      rejected: APPROVAL_ITEMS.filter(a => a.status === 'REJECTED').length,
      needsInfo: APPROVAL_ITEMS.filter(a => a.status === 'NEEDS_INFO').length,
      atRisk: APPROVAL_ITEMS.filter(
        a => a.slaStatus === 'AT_RISK' && a.status !== 'APPROVED' && a.status !== 'REJECTED'
      ).length,
      overdue: APPROVAL_ITEMS.filter(a => a.slaStatus === 'OVERDUE').length,
    };

    return NextResponse.json({
      approvals: filtered,
      stats,
      crbDecisions: CRB_WINDFALL_DECISIONS,
      meta: {
        total: filtered.length,
        filters: { status, committee, type, priority },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}
