/**
 * AI Signals - Structured insights emitted upstream by AI systems
 *
 * Signals are high-value business intelligence that should be:
 * - Communicated to leadership dashboards
 * - Integrated into notifications
 * - Stored in telemetry for analysis
 * - Tracked for follow-up actions
 */

export type SignalSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SignalCategory =
  | 'pipeline_risk'
  | 'team_capacity'
  | 'delivery_health'
  | 'knowledge_gap'
  | 'revenue_impact'
  | 'client_satisfaction'
  | 'compliance'
  | 'opportunity';

export interface AISignal {
  id: string;
  source: 'opschief' | 'asksgm';
  category: SignalCategory;
  severity: SignalSeverity;
  title: string;
  description: string;
  metadata: Record<string, any>;
  suggestedAction?: string;
  affectedEntities: Array<{
    type: 'engagement' | 'client' | 'employee' | 'team' | 'project';
    id: string;
    name: string;
  }>;
  emittedAt: Date;
  expiresAt?: Date;
}

/**
 * Convert OpsChief insights to signals for upstream consumption
 */
export function insightToSignal(
  insight: any,
  source: 'opschief' | 'asksgm' = 'opschief'
): AISignal {
  const severityMap: Record<string, SignalSeverity> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  };

  const categoryMap: Record<string, SignalCategory> = {
    alert: 'pipeline_risk',
    warning: 'team_capacity',
    info: 'opportunity',
  };

  return {
    id: insight.id || `signal_${Date.now()}`,
    source,
    category: (categoryMap[insight.type] || 'opportunity') as SignalCategory,
    severity: (severityMap[insight.severity] || 'medium') as SignalSeverity,
    title: insight.title,
    description: insight.description,
    metadata: insight,
    suggestedAction: insight.suggestedAction,
    affectedEntities: insight.affectedEntities || [],
    emittedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour expiry
  };
}

/**
 * Broadcast signal to external systems (dashboard, notifications, etc.)
 * This is a mock implementation - real implementation would integrate with:
 * - WebSocket for real-time push
 * - Webhook endpoints
 * - Message queue (RabbitMQ, SQS, etc.)
 */
export async function broadcastSignal(signal: AISignal): Promise<void> {
  // Log signal emission
  console.log('[SGM AI Signal Emitted]', {
    id: signal.id,
    source: signal.source,
    category: signal.category,
    severity: signal.severity,
    title: signal.title,
    timestamp: signal.emittedAt.toISOString(),
  });

  // TODO: Implement actual broadcast to:
  // 1. Leadership dashboard (real-time)
  // 2. Notification system
  // 3. Telemetry storage
  // 4. Action workflow system
}

/**
 * Emit signals from OpsChief insights batch
 */
export async function emitSignalsFromInsights(
  insights: any[],
  source: 'opschief' | 'asksgm' = 'opschief'
): Promise<AISignal[]> {
  const signals = insights.map((insight) => insightToSignal(insight, source));

  // Broadcast each signal
  await Promise.all(signals.map((signal) => broadcastSignal(signal)));

  return signals;
}
