/**
 * Live Checklist Progress Provider - Prisma-backed implementation
 *
 * Implements checklist progress operations using Prisma ORM against SQLite.
 */

import type { IChecklistProgressPort } from '@/lib/ports/checklist-progress.port';
import type {
  ChecklistProgress,
  CreateChecklistProgress,
  BulkUpdateChecklistProgress,
  ChecklistProgressSummary,
} from '@/lib/contracts/checklist-progress.contract';
import type { ChecklistContent } from '@/lib/contracts/governance-framework.contract';
import { getPrismaClient } from '@/lib/db/prisma';
import { syntheticGovernanceFrameworks } from '@/lib/data/synthetic/governance-frameworks.data';

export class LiveChecklistProgressProvider implements IChecklistProgressPort {
  private prisma = getPrismaClient();

  async getProgress(
    engagementId: string,
    frameworkId: string,
    filters?: {
      phase?: string;
      completed?: boolean;
      search?: string;
    }
  ): Promise<ChecklistProgress[]> {
    const where: any = { engagementId, frameworkId };

    if (filters?.completed !== undefined) {
      where.completed = filters.completed;
    }

    if (filters?.phase) {
      // Step IDs follow pattern: step-{phaseNumber}-{itemNumber}-{stepNumber}
      where.stepId = { startsWith: `step-${filters.phase}-` };
    }

    if (filters?.search) {
      where.OR = [
        { stepId: { contains: filters.search } },
        { notes: { contains: filters.search } },
      ];
    }

    const records = await this.prisma.checklistProgress.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return records.map(this.mapToContract);
  }

  async getProgressSummary(
    engagementId: string,
    frameworkId: string
  ): Promise<ChecklistProgressSummary> {
    // Load the framework to get phase structure and total step counts
    // Check database first, fall back to synthetic data
    let structuredContent: ChecklistContent | null = null;
    const dbFramework = await this.prisma.governanceFramework.findUnique({
      where: { id: frameworkId },
    });
    if (dbFramework?.structuredContent) {
      structuredContent = dbFramework.structuredContent as ChecklistContent;
    } else {
      const syntheticFramework = syntheticGovernanceFrameworks.find((f) => f.id === frameworkId);
      structuredContent = (syntheticFramework?.structuredContent as ChecklistContent) || null;
    }

    const phases: Record<string, { total: number; completed: number }> = {};
    let overallTotal = 0;
    let overallCompleted = 0;

    if (structuredContent?.phases) {
      for (const phase of structuredContent.phases) {
        if (phase.type === 'reference') continue;

        const phaseId = phase.id;
        const totalSteps = phase.totalSteps;

        // Count completed steps for this phase
        const completedCount = await this.prisma.checklistProgress.count({
          where: {
            engagementId,
            frameworkId,
            completed: true,
            stepId: { startsWith: `step-${phase.number}-` },
          },
        });

        phases[phaseId] = {
          total: totalSteps,
          completed: completedCount,
        };

        overallTotal += totalSteps;
        overallCompleted += completedCount;
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
    const now = new Date();

    const record = await this.prisma.checklistProgress.upsert({
      where: {
        engagementId_frameworkId_stepId: {
          engagementId: data.engagementId,
          frameworkId: data.frameworkId,
          stepId: data.stepId,
        },
      },
      update: {
        completed: data.completed,
        completedDate: data.completed ? now : null,
        completedBy: data.completedBy || null,
        notes: data.notes || null,
        updatedAt: now,
      },
      create: {
        engagementId: data.engagementId,
        frameworkId: data.frameworkId,
        stepId: data.stepId,
        completed: data.completed,
        completedDate: data.completed ? now : null,
        completedBy: data.completedBy || null,
        notes: data.notes || null,
      },
    });

    return this.mapToContract(record);
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

  private mapToContract(record: any): ChecklistProgress {
    return {
      id: record.id,
      engagementId: record.engagementId,
      frameworkId: record.frameworkId,
      stepId: record.stepId,
      completed: record.completed,
      completedDate: record.completedDate?.toISOString() || null,
      completedBy: record.completedBy || null,
      notes: record.notes || null,
      createdAt: record.createdAt?.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
    };
  }
}
