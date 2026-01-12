/**
 * Pulse Service
 *
 * Fetches governance insights from AICR Platform Pulse API
 */

const AICR_API_BASE = process.env.NEXT_PUBLIC_AICR_API_BASE || 'https://app.aicoderally.com';
const TENANT_ID = 'sgm-sparcc';

export type PulseUrgency = 'critical' | 'high' | 'medium' | 'low';
export type PulseSourceChief = 'governance' | 'knowledge' | 'operations' | 'security' | 'compliance';

export interface PulseCard {
  id: string;
  title: string;
  summary: string;
  urgency: PulseUrgency;
  sourceChief: PulseSourceChief;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  snoozedUntil?: string;
  dismissed?: boolean;
}

export interface PulseFeedResponse {
  cards: PulseCard[];
  totalCount: number;
  unreadCount: number;
}

/**
 * Fetch Pulse feed from AICR Platform
 */
export async function getPulseFeed(filters?: {
  urgency?: PulseUrgency;
  sourceChief?: PulseSourceChief;
  limit?: number;
}): Promise<PulseFeedResponse> {
  try {
    const params = new URLSearchParams({
      tenantId: TENANT_ID,
      ...(filters?.urgency && { urgency: filters.urgency }),
      ...(filters?.sourceChief && { sourceChief: filters.sourceChief }),
      ...(filters?.limit && { limit: filters.limit.toString() }),
    });

    const response = await fetch(`${AICR_API_BASE}/api/pulse?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Pulse API error:', response.status, response.statusText);
      return { cards: [], totalCount: 0, unreadCount: 0 };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Pulse feed:', error);
    return { cards: [], totalCount: 0, unreadCount: 0 };
  }
}

/**
 * Dismiss a Pulse card
 */
export async function dismissCard(intentId: string, reason?: string): Promise<boolean> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/pulse/dismiss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        intentId,
        reason,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to dismiss card:', error);
    return false;
  }
}

/**
 * Snooze a Pulse card
 */
export async function snoozeCard(intentId: string, preset: '1_hour' | '4_hours' | 'tomorrow' | 'next_week'): Promise<boolean> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/pulse/snooze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        intentId,
        snoozePreset: preset,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to snooze card:', error);
    return false;
  }
}

/**
 * Pursue a Pulse card (mark as action taken)
 */
export async function pursueCard(intentId: string): Promise<boolean> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/pulse/pursue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        intentId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to pursue card:', error);
    return false;
  }
}
