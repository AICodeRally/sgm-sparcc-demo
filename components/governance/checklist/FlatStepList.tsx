'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { ChecklistStepRow } from './ChecklistStep';
import type { ChecklistPhase } from '@/lib/contracts/governance-framework.contract';

type CompletionFilter = 'all' | 'incomplete' | 'complete';

interface FlatStepListProps {
  phases: ChecklistPhase[];
  completedStepIds: Set<string>;
  onStepToggle: (stepId: string, completed: boolean) => void;
}

export function FlatStepList({
  phases,
  completedStepIds,
  onStepToggle,
}: FlatStepListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');

  // Only include checklist phases (not reference)
  const checklistPhases = phases.filter((p) => p.type === 'checklist');

  // Build flat list of all steps with context
  const allSteps = useMemo(() => {
    return checklistPhases.flatMap((phase) =>
      phase.items.flatMap((item) =>
        item.steps.map((step) => ({
          step,
          phase,
          item,
          fullStepId: `${phase.id}.${item.id}.${step.id}`,
        }))
      )
    );
  }, [checklistPhases]);

  // Apply filters
  const filteredSteps = useMemo(() => {
    return allSteps.filter((entry) => {
      // Phase filter
      if (phaseFilter !== 'all' && entry.phase.id !== phaseFilter) return false;

      // Completion filter
      const isCompleted = completedStepIds.has(entry.fullStepId);
      if (completionFilter === 'complete' && !isCompleted) return false;
      if (completionFilter === 'incomplete' && isCompleted) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return entry.step.text.toLowerCase().includes(query);
      }

      return true;
    });
  }, [allSteps, phaseFilter, completionFilter, searchQuery, completedStepIds]);

  // Group filtered steps by phase for section headers
  const groupedSteps = useMemo(() => {
    const groups: { phase: ChecklistPhase; steps: typeof filteredSteps }[] = [];
    let currentPhaseId = '';

    for (const entry of filteredSteps) {
      if (entry.phase.id !== currentPhaseId) {
        currentPhaseId = entry.phase.id;
        groups.push({ phase: entry.phase, steps: [] });
      }
      groups[groups.length - 1].steps.push(entry);
    }

    return groups;
  }, [filteredSteps]);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl border border-[color:var(--color-border)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Phase dropdown */}
          <div className="relative">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="appearance-none bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 pr-8 text-sm text-[color:var(--color-foreground)] focus:outline-none focus:border-[color:var(--color-accent)]"
            >
              <option value="all">All Phases</option>
              {checklistPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  Phase {phase.number}: {phase.title}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-muted)] pointer-events-none" />
          </div>

          {/* Completion toggle */}
          <div className="inline-flex rounded-lg border border-[color:var(--color-border)] overflow-hidden">
            {(['all', 'incomplete', 'complete'] as CompletionFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setCompletionFilter(filter)}
                className={`px-3 py-2 text-xs font-medium transition-colors capitalize ${
                  completionFilter === filter
                    ? 'bg-[color:var(--color-accent)] text-white'
                    : 'bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search steps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg pl-9 pr-3 py-2 text-sm text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted)] focus:outline-none focus:border-[color:var(--color-accent)]"
            />
          </div>
        </div>

        {/* Filter count */}
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          Showing {filteredSteps.length} of {allSteps.length} steps
        </p>
      </div>

      {/* Steps List */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl border border-[color:var(--color-border)] shadow-sm overflow-hidden">
        {groupedSteps.length === 0 ? (
          <div className="p-8 text-center text-sm text-[color:var(--color-muted)]">
            No steps match the current filters.
          </div>
        ) : (
          groupedSteps.map((group) => (
            <div key={group.phase.id}>
              {/* Sticky phase header */}
              <div className="sticky top-0 z-10 px-4 py-2 bg-[color:var(--color-surface-alt)] border-b border-[color:var(--color-border)]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--color-accent-bg)] border border-[color:var(--color-accent-border)]">
                    <span className="text-xs font-bold text-[color:var(--color-accent)]">
                      {group.phase.number}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {group.phase.title}
                  </span>
                </div>
              </div>
              {/* Steps */}
              <div className="px-4 py-2">
                {group.steps.map((entry) => (
                  <ChecklistStepRow
                    key={entry.fullStepId}
                    step={entry.step}
                    phaseId={entry.phase.id}
                    itemId={entry.item.id}
                    completed={completedStepIds.has(entry.fullStepId)}
                    onToggle={onStepToggle}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
