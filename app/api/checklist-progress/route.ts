import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { CreateChecklistProgressSchema } from '@/lib/contracts/checklist-progress.contract';

function getProvider() {
  return getRegistry().getChecklistProgress();
}

/**
 * GET /api/checklist-progress
 * Return progress records filtered by engagementId, frameworkId, and optional filters
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

    const filters: { phase?: string; completed?: boolean; search?: string } = {};

    const phase = searchParams.get('phase');
    const completed = searchParams.get('completed');
    const search = searchParams.get('search');

    if (phase) filters.phase = phase;
    if (completed !== null && completed !== '') {
      filters.completed = completed === 'true';
    }
    if (search) filters.search = search;

    const provider = getProvider();
    const progress = await provider.getProgress(engagementId, frameworkId, filters);

    return NextResponse.json({
      progress,
      meta: {
        total: progress.length,
        engagementId,
        frameworkId,
        filters,
      },
    });
  } catch (error) {
    console.error('Error fetching checklist progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist progress' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checklist-progress
 * Create or update a step's completion status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = CreateChecklistProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const provider = getProvider();
    const progress = await provider.updateStep(parsed.data);

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error('Error updating checklist progress:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist progress' },
      { status: 500 }
    );
  }
}
