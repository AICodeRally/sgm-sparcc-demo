import { NextResponse } from 'next/server';
import { GOVERNANCE_MATRIX, MATRIX_STATS, POLICY_AREAS, AUTHORITY_INFO } from '@/lib/data/synthetic/governance-matrix.data';
import type { DataType } from '@/lib/contracts/data-type.contract';

export async function GET() {
  // Synthetic data is demo data
  const dataType: DataType = 'demo';

  return NextResponse.json({
    matrix: GOVERNANCE_MATRIX,
    stats: MATRIX_STATS,
    policyAreas: POLICY_AREAS,
    authorityInfo: AUTHORITY_INFO,
    dataType,
  });
}
