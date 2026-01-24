import type { IChecklistProgressPort } from '@/lib/ports/checklist-progress.port';
import type {
  ChecklistProgress,
  CreateChecklistProgress,
  BulkUpdateChecklistProgress,
  ChecklistProgressSummary,
} from '@/lib/contracts/checklist-progress.contract';
import { syntheticGovernanceFrameworks } from '@/lib/data/synthetic/governance-frameworks.data';
import type { ChecklistContent } from '@/lib/contracts/governance-framework.contract';

/**
 * SyntheticChecklistProgressProvider
 *
 * In-memory implementation of IChecklistProgressPort for demo purposes.
 * Stores progress records in a Map keyed by "engagementId:frameworkId:stepId".
 */
export class SyntheticChecklistProgressProvider implements IChecklistProgressPort {
  private progressMap: Map<string, ChecklistProgress> = new Map();

  private getKey(engagementId: string, frameworkId: string, stepId: string): string {
    return `${engagementId}:${frameworkId}:${stepId}`;
  }

  async getProgress(
    engagementId: string,
    frameworkId: string,
    filters?: {
      phase?: string;
      completed?: boolean;
      search?: string;
    }
  ): Promise<ChecklistProgress[]> {
    let results = Array.from(this.progressMap.values()).filter(
      (p) => p.engagementId === engagementId && p.frameworkId === frameworkId
    );

    if (filters?.completed !== undefined) {
      results = results.filter((p) => p.completed === filters.completed);
    }

    if (filters?.phase) {
      // Filter by phase prefix in stepId (e.g., "step-1-" for phase 1)
      const phasePrefix = `step-${filters.phase}-`;
      results = results.filter((p) => p.stepId.startsWith(phasePrefix));
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.stepId.toLowerCase().includes(query) ||
          (p.notes && p.notes.toLowerCase().includes(query))
      );
    }

    return results;
  }

  async getProgressSummary(
    engagementId: string,
    frameworkId: string
  ): Promise<ChecklistProgressSummary> {
    // Find the framework to get total step counts
    const framework = syntheticGovernanceFrameworks.find((f) => f.id === frameworkId);
    const structuredContent = framework?.structuredContent as ChecklistContent | null;

    const phases: Record<string, { total: number; completed: number }> = {};
    let overallTotal = 0;
    let overallCompleted = 0;

    if (structuredContent?.phases) {
      for (const phase of structuredContent.phases) {
        const phaseId = phase.id;
        const totalSteps = phase.totalSteps;

        // Count completed steps for this phase
        const completedSteps = Array.from(this.progressMap.values()).filter(
          (p) =>
            p.engagementId === engagementId &&
            p.frameworkId === frameworkId &&
            p.completed &&
            this.stepBelongsToPhase(p.stepId, phase.number)
        ).length;

        phases[phaseId] = {
          total: totalSteps,
          completed: completedSteps,
        };

        overallTotal += totalSteps;
        overallCompleted += completedSteps;
      }
    }

    return {
      phases,
      overall: {
        total: overallTotal,
        completed: overallCompleted,
      },
    };
  }

  async updateStep(data: CreateChecklistProgress): Promise<ChecklistProgress> {
    const key = this.getKey(data.engagementId, data.frameworkId, data.stepId);
    const now = new Date().toISOString();

    const existing = this.progressMap.get(key);

    const progress: ChecklistProgress = {
      id: existing?.id || `cp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      engagementId: data.engagementId,
      frameworkId: data.frameworkId,
      stepId: data.stepId,
      completed: data.completed,
      completedDate: data.completed ? now : null,
      completedBy: data.completedBy || null,
      notes: data.notes || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.progressMap.set(key, progress);
    return progress;
  }

  async bulkUpdate(data: BulkUpdateChecklistProgress): Promise<{ updated: number }> {
    let updated = 0;

    for (const step of data.steps) {
      await this.updateStep({
        engagementId: data.engagementId,
        frameworkId: data.frameworkId,
        stepId: step.stepId,
        completed: step.completed,
      });
      updated++;
    }

    return { updated };
  }

  /**
   * Determine if a stepId belongs to a given phase number.
   * Step IDs follow the pattern: step-{phaseNumber}-{itemNumber}-{stepNumber}
   */
  private stepBelongsToPhase(stepId: string, phaseNumber: number): boolean {
    const parts = stepId.split('-');
    // Pattern: step-{phaseNumber}-{itemNumber}-{stepNumber}
    if (parts.length >= 3 && parts[0] === 'step') {
      return parseInt(parts[1], 10) === phaseNumber;
    }
    return false;
  }
}
