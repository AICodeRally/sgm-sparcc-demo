'use client';

import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { PlanSection } from '@/lib/contracts/plan-section.contract';

interface SectionNavigatorProps {
  sections: PlanSection[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  planCompletion: number;
}

export default function SectionNavigator({
  sections,
  selectedSectionId,
  onSectionSelect,
  planCompletion,
}: SectionNavigatorProps) {
  const getStatusIcon = (section: PlanSection) => {
    if (section.completionStatus === 'COMPLETED') {
      return <CheckCircleIcon className="h-5 w-5 text-[color:var(--color-success)]" />;
    } else if (section.completionStatus === 'IN_PROGRESS') {
      return <ClockIcon className="h-5 w-5 text-[color:var(--color-warning)]" />;
    } else {
      return <ExclamationCircleIcon className="h-5 w-5 text-[color:var(--color-muted)]" />;
    }
  };

  const getStatusColor = (section: PlanSection) => {
    if (section.completionStatus === 'COMPLETED') {
      return 'border-[color:var(--color-success-border)] bg-[color:var(--color-success-bg)]';
    } else if (section.completionStatus === 'IN_PROGRESS') {
      return 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-bg)]';
    } else {
      return 'border-[color:var(--color-border)] bg-[color:var(--color-surface)]';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[color:var(--color-border)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-3">Sections</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--color-muted)]">Overall Progress</span>
            <span className="font-medium text-[color:var(--color-primary)]">{planCompletion}%</span>
          </div>
          <div className="w-full bg-[color:var(--color-border)] rounded-full h-2">
            <div
              className="bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] h-2 rounded-full transition-all"
              style={{ width: `${planCompletion}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-[color:var(--color-muted)]">
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4 text-[color:var(--color-success)]" />
              {sections.filter(s => s.completionStatus === 'COMPLETED').length} Complete
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-[color:var(--color-warning)]" />
              {sections.filter(s => s.completionStatus === 'IN_PROGRESS').length} In Progress
            </div>
            <div className="flex items-center gap-1">
              <ExclamationCircleIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
              {sections.filter(s => s.completionStatus === 'NOT_STARTED').length} Not Started
            </div>
          </div>
        </div>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedSectionId === section.id
                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)] shadow-md'
                : getStatusColor(section)
            } hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-none mt-0.5">
                {getStatusIcon(section)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[color:var(--color-muted)]">
                    {index + 1}
                  </span>
                  {section.isRequired && (
                    <span className="text-xs font-medium text-[color:var(--color-error)]">*</span>
                  )}
                </div>
                <h3 className="font-medium text-[color:var(--color-foreground)] mb-1 line-clamp-2">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-xs text-[color:var(--color-muted)] line-clamp-2">
                    {section.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {section.completionPercentage !== undefined && (
                    <div className="flex-1">
                      <div className="w-full bg-[color:var(--color-border)] rounded-full h-1">
                        <div
                          className="bg-[color:var(--color-primary)] h-1 rounded-full transition-all"
                          style={{ width: `${section.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-[color:var(--color-muted)]">
                    {section.completionPercentage || 0}%
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="text-xs text-[color:var(--color-muted)]">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-[color:var(--color-error)]">*</span>
            <span>Required sections</span>
          </div>
          <p>Complete all required sections before submitting</p>
        </div>
      </div>
    </div>
  );
}
