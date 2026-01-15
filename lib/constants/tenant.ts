/**
 * Tenant Constants
 *
 * Centralized tenant configuration to avoid hardcoded values.
 * Use these constants instead of hardcoding 'demo-tenant-001' throughout the codebase.
 */

export const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'demo-tenant-001';
export const DEFAULT_TENANT_SLUG = 'demo';
export const DEFAULT_TENANT_NAME = 'Demo Organization';
export const DEFAULT_TENANT_TIER = 'DEMO';

/**
 * Get tenant ID from context or fall back to default.
 * Use this function when you need a tenant ID but may not have session context.
 */
export function getTenantIdOrDefault(tenantId?: string | null): string {
  return tenantId || DEFAULT_TENANT_ID;
}
