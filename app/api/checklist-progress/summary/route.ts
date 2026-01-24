import { NextRequest, NextResponse } from 'next/server';
import { SyntheticChecklistProgressProvider } from '@/lib/bindings/synthetic/checklist-progress.synthetic';

/**
 * Singleton provider instance (shared with main route via module-level state)
 */
let _provider: SyntheticChecklistProgressProvider | null = null;

function getProvider(): SyntheticChecklistProgressProvider {
  if (!_provider) {
    _provider = new SyntheticChecklistProgressProvider();
  }
  return _provider;
}

/**
 * GET /api/checklist-progress/summary
 * Return per-phase completion counts for an engagement + framework
 *
 * The summary is computed by:
 * 1. Loading the framework's structuredContent to know total steps per phase
 * 2. Counting completed steps from progress records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const engagementId = searchParams.get('engagementId');
    const frameworkId = searchParams.get('frameworkId');

    if (!engagementId || !frameworkId) {
      return NextResponse.json(
        { error: 'engagementId and frameworkId are required query parameters' },
        { status: 400 }
      );
    }

    const provider = getProvider();
    const summary = await provider.getProgressSummary(engagementId, frameworkId);

    return NextResponse.json({
      summary,
      meta: {
        engagementId,
        frameworkId,
      },
    });
  } catch (error) {
    console.error('Error fetching checklist progress summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist progress summary' },
      { status: 500 }
    );
  }
}
