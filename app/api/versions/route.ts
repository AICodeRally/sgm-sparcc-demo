import { NextResponse } from 'next/server';
import { DOCUMENT_VERSIONS, VERSION_STATS } from '@/lib/data/synthetic/versions.data';

export async function GET() {
  return NextResponse.json({
    versions: DOCUMENT_VERSIONS,
    comparisons: [], // Comparisons are computed on demand - not pre-computed
    stats: VERSION_STATS,
  });
}
