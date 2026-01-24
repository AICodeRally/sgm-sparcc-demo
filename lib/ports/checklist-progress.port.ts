import type {
  ChecklistProgress,
  CreateChecklistProgress,
  BulkUpdateChecklistProgress,
  ChecklistProgressSummary,
} from '@/lib/contracts/checklist-progress.contract';

/**
 * Checklist Progress Port
 * Service interface for tracking step completion in checklist-type governance frameworks
 */
export interface IChecklistProgressPort {
  /**
   * Get progress records for an engagement + framework, with optional filters
   */
  getProgress(
    engagementId: string,
    frameworkId: string,
    filters?: {
      phase?: string;
      completed?: boolean;
      search?: string;
    }
  ): Promise<ChecklistProgress[]>;

  /**
   * Get per-phase completion summary for an engagement + framework
   */
  getProgressSummary(
    engagementId: string,
    frameworkId: string
  ): Promise<ChecklistProgressSummary>;

  /**
   * Create or update a single step's completion status
   */
  updateStep(data: CreateChecklistProgress): Promise<ChecklistProgress>;

  /**
   * Bulk update multiple steps' completion status
   */
  bulkUpdate(data: BulkUpdateChecklistProgress): Promise<{ updated: number }>;
}
