/**
 * Prisma Client Instance
 *
 * Singleton pattern for database access in LIVE binding mode.
 * CRITICAL: DATABASE_URL must include &schema=sgm_summit_demo
 */

type PrismaClient = any;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Validate that DATABASE_URL includes the required schema parameter
 */
function validateSchemaParam(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  return url.includes('schema=sgm_summit_demo');
}

/**
 * Get or create Prisma Client instance
 *
 * Guards:
 * - Requires DATABASE_URL with schema=sgm_summit_demo
 * - Throws if schema parameter is missing
 * - Returns null if in synthetic mode (binding mode check)
 */
export function getPrismaClient(): PrismaClient {
  // Allow Prisma access when DATABASE_URL is present, even if global BINDING_MODE is synthetic.
  // Individual providers may use live mode via per-provider overrides (e.g., BINDING_MODE_CHECKLIST_PROGRESS=live).

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required for live binding mode. Set BINDING_MODE=synthetic to use in-memory providers.'
    );
  }

  if (!validateSchemaParam()) {
    throw new Error(
      'DATABASE_URL must include &schema=sgm_summit_demo for proper schema isolation.\n' +
      'Example: postgresql://user:pass@host:5432/db?sslmode=require&schema=sgm_summit_demo'
    );
  }

  if (global.prisma) {
    return global.prisma;
  }

  // Lazy-require to avoid build-time dependency on generated Prisma types.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client') as {
    PrismaClient: new (args?: Record<string, unknown>) => PrismaClient;
  };

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }

  return prisma;
}

/**
 * Export singleton instance (lazy-loaded via getter)
 * This ensures Prisma is only initialized when actually accessed
 */
let _prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!_prismaInstance) {
      _prismaInstance = getPrismaClient();
    }
    return (_prismaInstance as any)[prop];
  },
});

/**
 * Disconnect helper for graceful shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  if (global.prisma) {
    await global.prisma.$disconnect();
    global.prisma = undefined;
  }
}
