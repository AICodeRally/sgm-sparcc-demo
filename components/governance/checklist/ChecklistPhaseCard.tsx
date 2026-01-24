'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ChecklistItemGroup } from './ChecklistItemGroup';
import type { ChecklistPhase } from '@/lib/contracts/governance-framework.contract';

interface ChecklistPhaseCardProps {
  phase: ChecklistPhase;
  progress: { total: number; completed: number };
  onStepToggle: (stepId: string, completed: boolean) => void;
  expandedByDefault?: boolean;
  completedStepIds: Set<string>;
}

export function ChecklistPhaseCard({
  phase,
  progress,
  onStepToggle,
  expandedByDefault = false,
  completedStepIds,
}: ChecklistPhaseCardProps) {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  // SVG circular progress
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl border border-[color:var(--color-border)] shadow-sm overflow-hidden transition-all">
      {/* Phase Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[color:var(--color-surface-alt)] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          {expanded ? (
            <ChevronDownIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
          )}
          {/* Phase number badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[color:var(--color-accent-bg)] border border-[color:var(--color-accent-border)]">
            <span className="text-sm font-bold text-[color:var(--color-accent)]">
              {phase.number}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[color:var(--color-foreground)]">
              {phase.title}
            </h3>
            <p className="text-xs text-[color:var(--color-muted)]">
              {phase.items.length} items &bull; {phase.totalSteps} steps
            </p>
          </div>
        </div>

        {/* Completion ring */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[color:var(--color-muted)]">
            {progress.completed}/{progress.total}
          </span>
          <svg width="40" height="40" className="-rotate-90">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="var(--color-surface-alt)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
        </div>
      </button>

      {/* Phase Content */}
      {expanded && (
        <div className="px-6 pb-5 pt-2 border-t border-[color:var(--color-border)] space-y-3">
          {phase.items.map((item) => (
            <ChecklistItemGroup
              key={item.id}
              item={item}
              phaseId={phase.id}
              completedStepIds={completedStepIds}
              onStepToggle={onStepToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
