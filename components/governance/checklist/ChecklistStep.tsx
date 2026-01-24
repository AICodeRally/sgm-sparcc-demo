'use client';

import { CheckboxIcon } from '@radix-ui/react-icons';

interface ChecklistStepProps {
  step: {
    id: string;
    number: number;
    text: string;
  };
  phaseId: string;
  itemId: string;
  completed: boolean;
  onToggle: (stepId: string, completed: boolean) => void;
}

export function ChecklistStepRow({
  step,
  phaseId,
  itemId,
  completed,
  onToggle,
}: ChecklistStepProps) {
  const fullStepId = `${phaseId}.${itemId}.${step.id}`;

  return (
    <label
      className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors cursor-pointer group"
    >
      <div className="mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => onToggle(fullStepId, e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            completed
              ? 'bg-[color:var(--color-accent)] border-[color:var(--color-accent)]'
              : 'border-[color:var(--color-border)] group-hover:border-[color:var(--color-accent)]'
          }`}
        >
          {completed && (
            <CheckboxIcon className="h-3.5 w-3.5 text-white" />
          )}
        </div>
      </div>
      <span
        className={`text-sm leading-relaxed transition-colors ${
          completed
            ? 'line-through text-[color:var(--color-muted)]'
            : 'text-[color:var(--color-foreground)]'
        }`}
      >
        {step.text}
      </span>
    </label>
  );
}
