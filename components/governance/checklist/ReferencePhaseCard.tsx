'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import type { ChecklistPhase } from '@/lib/contracts/governance-framework.contract';

interface ReferencePhaseCardProps {
  phase: ChecklistPhase;
}

export function ReferencePhaseCard({ phase }: ReferencePhaseCardProps) {
  const [expanded, setExpanded] = useState(false);

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
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)]">
            <span className="text-sm font-bold text-[color:var(--color-muted)]">
              {phase.number}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[color:var(--color-foreground)]">
              {phase.title}
            </h3>
            <p className="text-xs text-[color:var(--color-muted)]">
              {phase.items.length} items &bull; Reference only
            </p>
          </div>
        </div>

        {/* Reference badge */}
        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] rounded-full border border-[color:var(--color-info-border)]">
          <InfoCircledIcon className="h-3 w-3" />
          Reference
        </span>
      </button>

      {/* Reference Content */}
      {expanded && (
        <div className="px-6 pb-5 pt-2 border-t border-[color:var(--color-border)] space-y-4">
          {phase.items.map((item) => (
            <div key={item.id} className="space-y-2">
              <h4 className="text-sm font-semibold text-[color:var(--color-foreground)]">
                Item {item.number}: {item.title}
              </h4>
              <ul className="space-y-1.5 pl-4">
                {item.steps.map((step) => (
                  <li
                    key={step.id}
                    className="text-sm text-[color:var(--color-foreground)] leading-relaxed flex items-start gap-2"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--color-muted)] flex-shrink-0" />
                    {step.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
