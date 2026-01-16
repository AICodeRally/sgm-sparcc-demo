import { NextResponse } from 'next/server';
import { REPORT_TEMPLATES, GENERATED_REPORTS, REPORT_STATS } from '@/lib/data/synthetic/reports.data';

export async function GET() {
  return NextResponse.json({
    reports: REPORT_TEMPLATES,
    generatedReports: GENERATED_REPORTS,
    stats: REPORT_STATS,
  });
}
