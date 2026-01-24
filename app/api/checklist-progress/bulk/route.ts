import { NextRequest, NextResponse } from 'next/server';
import { SyntheticChecklistProgressProvider } from '@/lib/bindings/synthetic/checklist-progress.synthetic';
import { BulkUpdateChecklistProgressSchema } from '@/lib/contracts/checklist-progress.contract';

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
 * PATCH /api/checklist-progress/bulk
 * Bulk update multiple steps' completion status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = BulkUpdateChecklistProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const provider = getProvider();
    const result = await provider.bulkUpdate(parsed.data);

    return NextResponse.json({
      success: true,
      updated: result.updated,
    });
  } catch (error) {
    console.error('Error bulk updating checklist progress:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update checklist progress' },
      { status: 500 }
    );
  }
}
