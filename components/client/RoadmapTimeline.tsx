'use client';

import React from 'react';
import { CheckCircledIcon, CircleIcon, ClockIcon, CrossCircledIcon } from '@radix-ui/react-icons';

interface Milestone {
  title: string;
  completed: boolean;
}

interface RoadmapPhase {
  id: string;
  phase: string;
  title: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  completionPct: number;
  milestones: Milestone[];
  startDate?: string;
  targetEndDate?: string;
}

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
}

/**
 * Roadmap Timeline Component
 * Display implementation roadmap phases with milestones
 */
export function RoadmapTimeline({ phases }: RoadmapTimelineProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
      case 'IN_PROGRESS':
        return 'text-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-info-border)]';
      case 'COMPLETED':
        return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]';
      case 'BLOCKED':
        return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
      default:
        return 'text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return <CircleIcon className="w-5 h-5" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="w-5 h-5" />;
      case 'COMPLETED':
        return <CheckCircledIcon className="w-5 h-5" />;
      case 'BLOCKED':
        return <CrossCircledIcon className="w-5 h-5" />;
      default:
        return <CircleIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6">
      {/* Header */}
      <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-6">Implementation Roadmap</h2>

      {/* Timeline */}
      <div className="space-y-6">
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;
          const completedMilestones = phase.milestones.filter((m) => m.completed).length;

          return (
            <div key={phase.id} className="relative">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[color:var(--color-accent-border)] -mb-6" />
              )}

              {/* Phase Card */}
              <div className={`border-2 rounded-lg p-6 ${getStatusColor(phase.status)} relative`}>
                {/* Phase Icon */}
                <div className="absolute -left-3 top-6 bg-[color:var(--color-surface)] rounded-full p-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getStatusColor(phase.status)}`}>
                    {getStatusIcon(phase.status)}
                  </div>
                </div>

                <div className="ml-12">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-[color:var(--color-foreground)]">{phase.phase}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded uppercase">
                          {phase.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-[color:var(--color-foreground)]">{phase.title}</p>
                      {phase.description && (
                        <p className="text-sm text-[color:var(--color-foreground)] mt-1">{phase.description}</p>
                      )}
                    </div>

                    {/* Completion Percentage */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[color:var(--color-accent)]">{phase.completionPct}%</p>
                      <p className="text-xs text-[color:var(--color-muted)]">Complete</p>
                    </div>
                  </div>

                  {/* Dates */}
                  {(phase.startDate || phase.targetEndDate) && (
                    <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)] mb-3">
                      {phase.startDate && (
                        <span>
                          <strong>Start:</strong> {new Date(phase.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {phase.targetEndDate && (
                        <span>
                          <strong>Target:</strong> {new Date(phase.targetEndDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-[color:var(--color-surface)] rounded-full overflow-hidden border border-[color:var(--color-border)]">
                      <div
                        className="h-full bg-[color:var(--color-primary)] transition-all"
                        style={{ width: `${phase.completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <p className="text-xs font-semibold text-[color:var(--color-foreground)] uppercase tracking-wide mb-2">
                      Milestones ({completedMilestones}/{phase.milestones.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {phase.milestones.map((milestone, mIndex) => (
                        <div
                          key={mIndex}
                          className="flex items-center gap-2 text-sm"
                        >
                          {milestone.completed ? (
                            <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-success)] flex-shrink-0" />
                          ) : (
                            <CircleIcon className="w-4 h-4 text-[color:var(--color-muted)] flex-shrink-0" />
                          )}
                          <span className={milestone.completed ? 'text-[color:var(--color-foreground)] line-through' : 'text-[color:var(--color-foreground)]'}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
