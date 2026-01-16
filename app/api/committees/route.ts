import { NextResponse } from 'next/server';
import { SGCC_COMMITTEE, CRB_COMMITTEE, CRB_DECISION_OPTIONS } from '@/lib/data/synthetic/committees.data';

export async function GET() {
  return NextResponse.json({
    committees: [SGCC_COMMITTEE, CRB_COMMITTEE],
    decisionOptions: CRB_DECISION_OPTIONS,
  });
}
