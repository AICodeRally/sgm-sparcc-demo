import { z } from 'zod';

/**
 * Territory Status
 * - active: In use
 * - inactive: Not currently assigned
 * - archived: Historical record
 */
export const TerritoryStatusSchema = z.enum(['active', 'inactive', 'archived']);
export type TerritoryStatus = z.infer<typeof TerritoryStatusSchema>;

/**
 * Territory Type
 * - geographic: Based on location (state, region, country)
 * - account: Based on account assignment
 * - industry: Based on industry vertical
 * - named: Named accounts
 */
export const TerritoryTypeSchema = z.enum(['geographic', 'account', 'industry', 'named']);
export type TerritoryType = z.infer<typeof TerritoryTypeSchema>;

/**
 * Territory Contract - Sales territory definition
 *
 * Represents a sales territory with hierarchy, assignment rules, and coverage.
 */
export const TerritorySchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),

  // Metadata
  code: z.string().min(1).max(50), // Short code (e.g., "US-WEST", "ACCT-ENT")
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: TerritoryTypeSchema,
  status: TerritoryStatusSchema,

  // Hierarchy
  parentTerritoryId: z.string().optional(),
  level: z.number().int().min(0).default(0), // 0 = root, 1 = first child, etc.
  path: z.string().optional(), // e.g., "/1/3/7" for breadcrumb navigation

  // Assignment
  assignedToUserId: z.string().optional(),
  assignedAt: z.coerce.date().optional(),

  // Coverage Rules (JSON structure for flexible rules)
  coverageRules: z.object({
    // Geographic
    countries: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    zipcodes: z.array(z.string()).optional(),

    // Account-based
    accountIds: z.array(z.string()).optional(),
    industryVerticals: z.array(z.string()).optional(),

    // Size-based
    revenueMin: z.number().optional(),
    revenueMax: z.number().optional(),
    employeeCountMin: z.number().optional(),
    employeeCountMax: z.number().optional(),
  }).partial().optional(),

  // Effective Dating
  effectiveDate: z.coerce.date(),
  expirationDate: z.coerce.date().optional(),

  // Audit
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedBy: z.string().optional(),
  updatedAt: z.coerce.date().optional(),

  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Territory = z.infer<typeof TerritorySchema>;

/**
 * Partial schemas for mutations
 */
export const CreateTerritorySchema = TerritorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  level: true,
  path: true,
});

export type CreateTerritory = z.infer<typeof CreateTerritorySchema>;

export const UpdateTerritorySchema = TerritorySchema.partial().required({
  id: true,
  updatedBy: true,
});

export type UpdateTerritory = z.infer<typeof UpdateTerritorySchema>;

/**
 * Filter schemas for queries
 */
export const TerritoryFiltersSchema = z.object({
  tenantId: z.string().optional(),
  status: TerritoryStatusSchema.optional(),
  type: TerritoryTypeSchema.optional(),
  parentTerritoryId: z.string().optional(),
  assignedToUserId: z.string().optional(),
  search: z.string().optional(),
}).partial();

export type TerritoryFilters = z.infer<typeof TerritoryFiltersSchema>;

/**
 * Territory Assignment
 */
export const TerritoryAssignmentSchema = z.object({
  id: z.string().cuid(),
  territoryId: z.string(),
  userId: z.string(),
  role: z.string(), // e.g., "owner", "contributor", "viewer"
  effectiveDate: z.coerce.date(),
  expirationDate: z.coerce.date().optional(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
});

export type TerritoryAssignment = z.infer<typeof TerritoryAssignmentSchema>;
