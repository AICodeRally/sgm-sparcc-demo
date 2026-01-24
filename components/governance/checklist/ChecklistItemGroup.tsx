'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ChecklistStepRow } from './ChecklistStep';
import type { ChecklistItem } from '@/lib/contracts/governance-framework.contract';

interface ChecklistItemGroupProps {
  item: ChecklistItem;
  phaseId: string;
  completedStepIds: Set<string>;
  onStepToggle: (stepId: string, completed: boolean) => void;
}

export function ChecklistItemGroup({
  item,
  phaseId,
  completedStepIds,
  onStepToggle,
}: ChecklistItemGroupProps) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = item.steps.filter((step) =>
    completedStepIds.has(`${phaseId}.${item.id}.${step.id}`)
  ).length;
  const totalCount = item.steps.length;

  return (
    <div className="border border-[color:var(--color-border)] rounded-lg overflow-hidden">
      {/* Item Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-alt)] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDownIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
          )}
          <span className="text-sm font-medium text-[color:var(--color-foreground)]">
            Item {item.number}: {item.title}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            completedCount === totalCount && totalCount > 0
              ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
              : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)]'
          }`}
        >
          {completedCount}/{totalCount}
        </span>
      </button>

      {/* Steps List */}
      {expanded && (
        <div className="px-4 py-2 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
          {item.steps.map((step) => (
            <ChecklistStepRow
              key={step.id}
              step={step}
              phaseId={phaseId}
              itemId={item.id}
              completed={completedStepIds.has(`${phaseId}.${item.id}.${step.id}`)}
              onToggle={onStepToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
