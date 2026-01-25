'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressHeader } from './ProgressHeader';
import { ViewToggle } from './ViewToggle';
import { ChecklistPhaseCard } from './ChecklistPhaseCard';
import { ReferencePhaseCard } from './ReferencePhaseCard';
import { FlatStepList } from './FlatStepList';
import type { GovernanceFramework, ChecklistContent, ChecklistPhase } from '@/lib/contracts/governance-framework.contract';

type ViewMode = 'phase' | 'flat';

interface ChecklistFrameworkViewProps {
  framework: GovernanceFramework;
  engagementId?: string;
}

interface ProgressSummary {
  engagementId: string;
  frameworkId: string;
  totalSteps: number;
  completedSteps: number;
  completedStepIds: string[];
  phaseProgress: Record<string, { total: number; completed: number }>;
}

export function ChecklistFrameworkView({ framework, engagementId = 'demo-engagement' }: ChecklistFrameworkViewProps) {
  const [activeView, setActiveView] = useState<ViewMode>('phase');
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const structuredContent = framework.structuredContent as ChecklistContent | null;
  const phases: ChecklistPhase[] = structuredContent?.phases ?? [];

  // Calculate totals
  const totalSteps = phases
    .filter((p) => p.type === 'checklist')
    .reduce((sum, phase) => sum + phase.totalSteps, 0);

  // Determine current phase (first phase with incomplete steps)
  const getCurrentPhase = useCallback(() => {
    const checklistPhases = phases.filter((p) => p.type === 'checklist');
    for (const phase of checklistPhases) {
      const phaseComplete = phase.items.every((item) =>
        item.steps.every((step) =>
          completedStepIds.has(`${phase.id}.${item.id}.${step.id}`)
        )
      );
      if (!phaseComplete) return phase.number;
    }
    return checklistPhases.length;
  }, [phases, completedStepIds]);

  // Fetch progress data on mount
  useEffect(() => {
    fetchProgress();
  }, [framework.id, engagementId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/checklist-progress/summary?engagementId=${engagementId}&frameworkId=${framework.id}`
      );
      if (response.ok) {
        const data: ProgressSummary = await response.json();
        setProgressData(data);
        setCompletedStepIds(new Set(data.completedStepIds));
      }
    } catch (error) {
      console.error('Error fetching checklist progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle step toggle
  const handleStepToggle = async (stepId: string, completed: boolean) => {
    // Optimistic update
    setCompletedStepIds((prev) => {
      const next = new Set(prev);
      if (completed) {
        next.add(stepId);
      } else {
        next.delete(stepId);
      }
      return next;
    });

    // POST to API
    try {
      const response = await fetch('/api/checklist-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          frameworkId: framework.id,
          stepId,
          completed,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setCompletedStepIds((prev) => {
          const reverted = new Set(prev);
          if (completed) {
            reverted.delete(stepId);
          } else {
            reverted.add(stepId);
          }
          return reverted;
        });
      }
    } catch (error) {
      console.error('Error updating step progress:', error);
      // Revert on error
      setCompletedStepIds((prev) => {
        const reverted = new Set(prev);
        if (completed) {
          reverted.delete(stepId);
        } else {
          reverted.add(stepId);
        }
        return reverted;
      });
    }
  };

  // Calculate phase progress from local state
  const getPhaseProgress = (phase: ChecklistPhase) => {
    const total = phase.totalSteps;
    const completed = phase.items.reduce(
      (sum, item) =>
        sum +
        item.steps.filter((step) =>
          completedStepIds.has(`${phase.id}.${item.id}.${step.id}`)
        ).length,
      0
    );
    return { total, completed };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[color:var(--color-muted)]">Loading checklist...</div>
      </div>
    );
  }

  if (!structuredContent || phases.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[color:var(--color-muted)]">No checklist content available.</div>
      </div>
    );
  }

  const checklistPhases = phases.filter((p) => p.type === 'checklist');
  const referencePhases = phases.filter((p) => p.type === 'reference');
  const totalPhases = checklistPhases.length;
  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <ProgressHeader
        totalSteps={totalSteps}
        completedSteps={completedStepIds.size}
        currentPhase={currentPhase}
        totalPhases={totalPhases}
      />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
        <span className="text-xs text-[color:var(--color-muted)]">
          {checklistPhases.length} phases &bull; {totalSteps} steps
        </span>
      </div>

      {/* Content Area */}
      {activeView === 'phase' ? (
        <div className="space-y-4">
          {/* Checklist Phases */}
          {checklistPhases.map((phase, index) => (
            <ChecklistPhaseCard
              key={phase.id}
              phase={phase}
              progress={getPhaseProgress(phase)}
              onStepToggle={handleStepToggle}
              expandedByDefault={index === 0}
              completedStepIds={completedStepIds}
            />
          ))}

          {/* Reference Phases */}
          {referencePhases.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-sm font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  Reference Sections
                </h3>
              </div>
              {referencePhases.map((phase) => (
                <ReferencePhaseCard key={phase.id} phase={phase} />
              ))}
            </>
          )}
        </div>
      ) : (
        <FlatStepList
          phases={phases}
          completedStepIds={completedStepIds}
          onStepToggle={handleStepToggle}
        />
      )}
    </div>
  );
}
