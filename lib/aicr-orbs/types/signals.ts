import { z } from 'zod';
import type { OrbId } from './orb';

export const SignalTypeSchema = z.enum([
  // Ask signals
  'ASK_QUERY_SUBMITTED',
  'ASK_RESPONSE_RECEIVED',
  'ASK_CITATION_CLICKED',
  // Ops signals
  'OPS_ANOMALY_DETECTED',
  'OPS_THRESHOLD_CROSSED',
  'OPS_DRIFT_DETECTED',
  'OPS_ALERT_ACKNOWLEDGED',
  // Pulse signals
  'PULSE_RECOMMENDATION_NEW',
  'PULSE_LEARNING_OPPORTUNITY',
  'PULSE_ACTION_SUGGESTED',
  'PULSE_ITEM_DISMISSED',
  // Tasks signals
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_COMPLETED',
  'TASK_BLOCKED',
  // KB signals
  'KB_DOC_UPDATED',
  'KB_SEARCH_PERFORMED',
]);

export type SignalType = z.infer<typeof SignalTypeSchema>;

export interface Signal {
  id: string;
  type: SignalType;
  orbId: OrbId;
  payload: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
}
