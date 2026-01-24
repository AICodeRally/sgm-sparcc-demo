/**
 * Pulse Service
 *
 * Fetches governance insights from AICR Platform Telemetry API
 * Uses the new /api/aicc/telemetry?signals=PULSE endpoint
 */

import { fetchPulseSignals, type TelemetrySignal } from '@/lib/aicr/client';

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
 * Map AICR telemetry signal to PulseCard format
 */
function mapSignalToCard(signal: TelemetrySignal): PulseCard {
  // Determine source chief from signal type prefix
  let sourceChief: PulseSourceChief = 'governance';
  if (signal.type.includes('LEARN')) {
    sourceChief = 'knowledge';
  } else if (signal.type.includes('ACTION')) {
    sourceChief = 'operations';
  }

  return {
    id: signal.id,
    title: signal.title,
    summary: signal.description,
    urgency: signal.severity,
    sourceChief,
    createdAt: signal.timestamp,
    actionUrl: signal.actionUrl,
    metadata: signal.metadata,
  };
}

/**
 * Fetch Pulse feed from AICR Platform Telemetry API
 */
export async function getPulseFeed(filters?: {
  urgency?: PulseUrgency;
  sourceChief?: PulseSourceChief;
  limit?: number;
}): Promise<PulseFeedResponse> {
  try {
    const limit = filters?.limit || 10;
    const response = await fetchPulseSignals(limit);

    if (response.signals.length === 0 && response.count === 0) {
      // Service may be unavailable or just empty
      return { cards: [], totalCount: -1, unreadCount: 0 };
    }

    // Map signals to cards
    let cards = response.signals.map(mapSignalToCard);

    // Apply client-side filters if needed
    if (filters?.urgency) {
      cards = cards.filter(c => c.urgency === filters.urgency);
    }
    if (filters?.sourceChief) {
      cards = cards.filter(c => c.sourceChief === filters.sourceChief);
    }

    return {
      cards,
      totalCount: cards.length,
      unreadCount: cards.filter(c => !c.dismissed).length,
    };
  } catch {
    return { cards: [], totalCount: -1, unreadCount: 0 };
  }
}

/**
 * Dismiss a Pulse card
 * Note: Actions are handled client-side until AICR action endpoints are available
 */
export async function dismissCard(_intentId: string, _reason?: string): Promise<boolean> {
  // TODO: Wire to AICR action endpoint when available
  // For now, handle dismissal client-side in the orb component
  return true;
}

/**
 * Snooze a Pulse card
 * Note: Actions are handled client-side until AICR action endpoints are available
 */
export async function snoozeCard(_intentId: string, _preset: '1_hour' | '4_hours' | 'tomorrow' | 'next_week'): Promise<boolean> {
  // TODO: Wire to AICR action endpoint when available
  return true;
}

/**
 * Pursue a Pulse card (mark as action taken)
 * Note: Actions are handled client-side until AICR action endpoints are available
 */
export async function pursueCard(_intentId: string): Promise<boolean> {
  // TODO: Wire to AICR action endpoint when available
  return true;
}
