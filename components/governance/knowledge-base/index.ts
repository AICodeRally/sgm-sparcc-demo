/**
 * SPM Knowledge Base UI Components
 *
 * Components for rendering Framework Cards from the SPM Knowledge Base.
 */

export { FrameworkCard } from './FrameworkCard';
export { FrameworkCardList } from './FrameworkCardList';

// Re-export types for convenience
export type {
  FrameworkCard as FrameworkCardType,
  SPMPillar,
  CardType,
  RoleUsage,
  ProcessFlow,
  VendorTerminology,
} from '@/lib/contracts/spm-knowledge-base.contract';

export { SPMPillarMetadata } from '@/lib/contracts/spm-knowledge-base.contract';
