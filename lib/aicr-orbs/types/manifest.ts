import { z } from 'zod';
import { OrbIdSchema } from './orb';

export const DockPositionSchema = z.enum(['bottom', 'left', 'right']);
export type DockPosition = z.infer<typeof DockPositionSchema>;

export const OrbConfigSchema = z.object({
  extends: z.string(),
  enabled: z.boolean().default(true),
  overrides: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    endpoints: z.record(z.string()).optional(),
  }).optional(),
  branding: z.object({
    gradient: z.tuple([z.string(), z.string()]).optional(),
    icon: z.string().optional(),
  }).optional(),
  signals: z.object({
    subscribes: z.array(z.string()).optional(),
  }).optional(),
});

export const OrbManifestSchema = z.object({
  app: z.string(),
  platform: z.literal('aicr'),
  version: z.string(),
  orbs: z.record(OrbIdSchema, OrbConfigSchema),
  dock: z.object({
    position: DockPositionSchema.default('bottom'),
    autoHide: z.boolean().default(false),
    magnification: z.boolean().default(true),
  }).optional(),
});

export type OrbConfig = z.infer<typeof OrbConfigSchema>;
export type OrbManifest = z.infer<typeof OrbManifestSchema>;
