import { NextResponse } from 'next/server';
import { AUDIT_EVENTS, AUDIT_STATS, EVENT_TYPE_INFO } from '@/lib/data/synthetic/audit.data';

export async function GET() {
  return NextResponse.json({
    events: AUDIT_EVENTS,
    stats: AUDIT_STATS,
    eventTypeInfo: EVENT_TYPE_INFO,
  });
}
