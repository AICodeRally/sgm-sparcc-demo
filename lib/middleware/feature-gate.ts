import { prisma } from '@/lib/db/prisma';

/**
 * Feature defaults by tenant tier.
 * Controls which modules are available at each subscription level.
 */
export function getDefaultFeatures(tier: 'DEMO' | 'BETA' | 'PRODUCTION'): Record<string, boolean> {
  switch (tier) {
    case 'DEMO':
      return {
        askSgm: true,
        policies: true,
        documents: true,
        plans: false,
        governance: false,
        analytics: false,
      };
    case 'BETA':
      return {
        askSgm: true,
        policies: true,
        documents: true,
        plans: true,
        governance: true,
        analytics: false,
      };
    case 'PRODUCTION':
      return {
        askSgm: true,
        policies: true,
        documents: true,
        plans: true,
        governance: true,
        analytics: true,
      };
    default:
      return {
        askSgm: true,
        policies: true,
        documents: true,
        plans: false,
        governance: false,
        analytics: false,
      };
  }
}

/**
 * Check whether a tenant has access to a specific feature.
 *
 * Validates:
 * 1. Tenant exists
 * 2. Tenant status is ACTIVE
 * 3. The requested feature is enabled in the tenant's features JSON
 *
 * @param tenantId - The tenant's unique identifier
 * @param feature - The feature key to check (e.g., 'askSgm', 'analytics')
 * @returns Object with allowed boolean and optional reason string
 */
export async function checkFeatureAccess(
  tenantId: string,
  feature: string
): Promise<{ allowed: boolean; reason?: string }> {
  const bindingMode = process.env.BINDING_MODE || 'synthetic';

  // In synthetic mode, allow all features for demo purposes
  if (bindingMode === 'synthetic') {
    const demoFeatures: Record<string, boolean> = {
      askSgm: true,
      policies: true,
      documents: true,
      plans: true,
      governance: true,
      analytics: false,
    };

    if (feature in demoFeatures) {
      if (!demoFeatures[feature]) {
        return {
          allowed: false,
          reason: 'Feature "' + feature + '" is not enabled for your tenant tier.',
        };
      }
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Unknown feature: "' + feature + '".',
    };
  }

  // Live mode: look up tenant from database
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        status: true,
        tier: true,
        features: true,
      },
    });

    if (!tenant) {
      return {
        allowed: false,
        reason: 'Tenant not found.',
      };
    }

    // Check tenant status
    if (tenant.status !== 'ACTIVE') {
      return {
        allowed: false,
        reason: 'Tenant is not active. Current status: ' + tenant.status + '.',
      };
    }

    // Check feature availability in tenant's features JSON
    const features = (tenant.features as Record<string, boolean>) || {};

    if (!(feature in features)) {
      return {
        allowed: false,
        reason: 'Feature "' + feature + '" is not configured for this tenant.',
      };
    }

    if (!features[feature]) {
      return {
        allowed: false,
        reason: 'Feature "' + feature + '" is not enabled for your tenant (' + tenant.name + ').',
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      allowed: false,
      reason: 'Unable to verify feature access. Please try again later.',
    };
  }
}
