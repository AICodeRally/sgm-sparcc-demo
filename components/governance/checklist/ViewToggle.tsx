'use client';

import { ListBulletIcon, LayersIcon } from '@radix-ui/react-icons';

type ViewMode = 'phase' | 'flat';

interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-[color:var(--color-border)] overflow-hidden">
      <button
        onClick={() => onViewChange('phase')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
          activeView === 'phase'
            ? 'bg-[color:var(--color-accent)] text-white'
            : 'bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]'
        }`}
      >
        <LayersIcon className="h-4 w-4" />
        Phase View
      </button>
      <button
        onClick={() => onViewChange('flat')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
          activeView === 'flat'
            ? 'bg-[color:var(--color-accent)] text-white'
            : 'bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]'
        }`}
      >
        <ListBulletIcon className="h-4 w-4" />
        Flat View
      </button>
    </div>
  );
}
