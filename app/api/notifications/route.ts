import { NextResponse } from 'next/server';
import { NOTIFICATIONS, NOTIFICATION_STATS, NOTIFICATION_TYPE_INFO } from '@/lib/data/synthetic/notifications.data';

export async function GET() {
  return NextResponse.json({
    notifications: NOTIFICATIONS,
    stats: NOTIFICATION_STATS,
    typeInfo: NOTIFICATION_TYPE_INFO,
  });
}
