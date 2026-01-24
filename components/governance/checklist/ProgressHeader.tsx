'use client';

interface ProgressHeaderProps {
  totalSteps: number;
  completedSteps: number;
  currentPhase: number;
  totalPhases: number;
}

export function ProgressHeader({
  totalSteps,
  completedSteps,
  currentPhase,
  totalPhases,
}: ProgressHeaderProps) {
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl border border-[color:var(--color-border)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
          Implementation Progress
        </h2>
        <span className="text-sm font-medium text-[color:var(--color-accent)]">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full bg-[color:var(--color-surface-alt)] overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status text */}
      <p className="text-sm text-[color:var(--color-muted)]">
        Phase {currentPhase} of {totalPhases} &bull; {completedSteps}/{totalSteps} steps complete ({percentage}%)
      </p>
    </div>
  );
}
