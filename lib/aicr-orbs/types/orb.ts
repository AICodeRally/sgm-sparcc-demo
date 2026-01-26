import { z } from 'zod';

export const OrbIdSchema = z.enum(['ask', 'ops', 'pulse', 'tasks', 'kb']);
export type OrbId = z.infer<typeof OrbIdSchema>;

export const OrbStatusSchema = z.enum(['connected', 'disconnected', 'checking', 'error']);
export type OrbStatus = z.infer<typeof OrbStatusSchema>;

export interface OrbDefinition {
  id: OrbId;
  name: string;
  description: string;
  icon: string;
  version: string;
  signals: {
    subscribes: string[];
    emits: string[];
  };
  endpoints: {
    invoke?: string;
    health?: string;
    history?: string;
  };
  features: {
    streaming?: boolean;
    citations?: boolean;
    contextAwareness?: boolean;
  };
}

export interface OrbState {
  id: OrbId;
  status: OrbStatus;
  badgeCount: number;
  lastActivity?: Date;
  error?: string;
}
