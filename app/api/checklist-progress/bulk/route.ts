import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { BulkUpdateChecklistProgressSchema } from '@/lib/contracts/checklist-progress.contract';

function getProvider() {
  return getRegistry().getChecklistProgress();
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
