import { z } from 'zod';

/**
 * Data Type Classification
 *
 * Distinguishes between different data sources:
 * - demo: Sample data for demonstrations (orange badge)
 * - template: Baseline governance documents for consultants (teal badge)
 * - client: Real client data (no badge)
 */
export const DataTypeSchema = z.enum(['demo', 'template', 'client']);
export type DataType = z.infer<typeof DataTypeSchema>;

/**
 * Demo Metadata Schema
 *
 * Optional metadata for demo items to provide context
 * (year, business unit, division, category).
 */
export const DemoMetadataSchema = z.object({
  year: z.number().optional(),
  bu: z.string().optional(),
  division: z.string().optional(),
  category: z.string().optional(),
}).optional().nullable();

export type DemoMetadata = z.infer<typeof DemoMetadataSchema>;

/**
 * Helper to check if data type should show a badge
 */
export function shouldShowBadge(dataType: DataType): boolean {
  // All data types now show badges
  return dataType === 'demo' || dataType === 'template' || dataType === 'client';
}

/**
 * Helper to get badge color class for data type
 */
export function getDataTypeBadgeClass(dataType: DataType): string {
  switch (dataType) {
    case 'demo':
      return 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400';
    case 'template':
      return 'bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400';
    case 'client':
      return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400';
    default:
      return '';
  }
}
