/**
 * Contracts Index
 *
 * Export all entity contracts and their Zod schemas.
 * Contracts define the shape of domain entities with both TypeScript types
 * and runtime validation via Zod.
 */

// Data Type (shared enum for demo/template/client classification)
export * from './data-type.contract';

// Policy
export * from './policy.contract';

// Territory
export * from './territory.contract';

// Approval
export * from './approval.contract';

// Audit Log
export * from './audit-log.contract';

// Link (ConnectItem pattern)
export * from './link.contract';

// Index Item (Search pattern)
export * from './index-item.contract';
