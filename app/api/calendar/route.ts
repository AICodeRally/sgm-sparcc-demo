import { NextResponse } from 'next/server';
import { CALENDAR_EVENTS, EVENT_TYPE_INFO, CALENDAR_STATS } from '@/lib/data/synthetic/calendar.data';

export async function GET() {
  return NextResponse.json({
    events: CALENDAR_EVENTS,
    eventTypes: EVENT_TYPE_INFO,
    stats: CALENDAR_STATS,
  });
}
