import { NextResponse } from 'next/server';
import { loadAllPolicies, getPolicyLibraryStats } from '@/lib/data/policy-library';

/**
 * Get all policies from the policy library
 */
export async function GET() {
  try {
    const policies = loadAllPolicies();
    const stats = getPolicyLibraryStats();

    return NextResponse.json({
      policies,
      stats,
      success: true,
    });
  } catch (error) {
    console.error('Error loading policy library:', error);
    return NextResponse.json(
      { error: 'Failed to load policy library', success: false },
      { status: 500 }
    );
  }
}
