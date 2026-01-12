'use client';

import {
  FileIcon,
  GearIcon,
  Pencil1Icon,
  EyeOpenIcon,
  CheckCircledIcon,
  RocketIcon,
  UpdateIcon,
  ArchiveIcon
} from '@radix-ui/react-icons';

export interface VersionTimelineEntry {
  id: string;
  versionNumber: string;
  versionLabel?: string;
  lifecycleStatus: 'RAW' | 'PROCESSED' | 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE_FINAL' | 'SUPERSEDED' | 'ARCHIVED';
  createdBy: string;
  createdAt: Date | string;
  changeDescription?: string;
  changeType: 'MAJOR' | 'MINOR' | 'PATCH' | 'EMERGENCY';
  isCurrent: boolean;
}

interface VersionTimelineProps {
  timeline: VersionTimelineEntry[];
  onVersionClick?: (version: VersionTimelineEntry) => void;
}

export function VersionTimeline({ timeline, onVersionClick }: VersionTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RAW':
        return <FileIcon className="w-5 h-5" />;
      case 'PROCESSED':
        return <GearIcon className="w-5 h-5" />;
      case 'DRAFT':
        return <Pencil1Icon className="w-5 h-5" />;
      case 'UNDER_REVIEW':
        return <EyeOpenIcon className="w-5 h-5" />;
      case 'APPROVED':
        return <CheckCircledIcon className="w-5 h-5" />;
      case 'ACTIVE_FINAL':
        return <RocketIcon className="w-5 h-5" />;
      case 'SUPERSEDED':
        return <UpdateIcon className="w-5 h-5" />;
      case 'ARCHIVED':
        return <ArchiveIcon className="w-5 h-5" />;
      default:
        return <FileIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RAW':
        return {
          bg: 'bg-[color:var(--color-surface-alt)]',
          border: 'border-[color:var(--color-border)]',
          text: 'text-[color:var(--color-foreground)]',
          icon: 'text-[color:var(--color-muted)]',
          dot: 'bg-[color:var(--color-border)]',
        };
      case 'PROCESSED':
        return {
          bg: 'bg-[color:var(--color-info-bg)]',
          border: 'border-[color:var(--color-info-border)]',
          text: 'text-[color:var(--color-info)]',
          icon: 'text-[color:var(--color-info)]',
          dot: 'bg-[color:var(--color-surface-alt)]0',
        };
      case 'DRAFT':
        return {
          bg: 'bg-[color:var(--color-warning-bg)]',
          border: 'border-[color:var(--color-warning-border)]',
          text: 'text-[color:var(--color-warning)]',
          icon: 'text-[color:var(--color-warning)]',
          dot: 'bg-transparent',
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-[color:var(--color-warning-bg)]',
          border: 'border-[color:var(--color-warning-border)]',
          text: 'text-[color:var(--color-warning)]',
          icon: 'text-[color:var(--color-warning)]',
          dot: 'bg-[color:var(--color-warning)]',
        };
      case 'APPROVED':
        return {
          bg: 'bg-[color:var(--color-surface-alt)]',
          border: 'border-[color:var(--color-border)]',
          text: 'text-[color:var(--color-accent)]',
          icon: 'text-[color:var(--color-primary)]',
          dot: 'bg-[color:var(--color-surface-alt)]0',
        };
      case 'ACTIVE_FINAL':
        return {
          bg: 'bg-[color:var(--color-success-bg)]',
          border: 'border-[color:var(--color-success-border)]',
          text: 'text-[color:var(--color-success)]',
          icon: 'text-[color:var(--color-success)]',
          dot: 'bg-transparent',
        };
      case 'SUPERSEDED':
        return {
          bg: 'bg-[color:var(--color-surface-alt)]',
          border: 'border-[color:var(--color-border)]',
          text: 'text-[color:var(--color-muted)]',
          icon: 'text-[color:var(--color-muted)]',
          dot: 'bg-[color:var(--color-border)]',
        };
      case 'ARCHIVED':
        return {
          bg: 'bg-[color:var(--color-surface-alt)]',
          border: 'border-[color:var(--color-border)]',
          text: 'text-[color:var(--color-muted)]',
          icon: 'text-[color:var(--color-muted)]',
          dot: 'bg-[color:var(--color-border)]',
        };
      default:
        return {
          bg: 'bg-[color:var(--color-surface-alt)]',
          border: 'border-[color:var(--color-border)]',
          text: 'text-[color:var(--color-foreground)]',
          icon: 'text-[color:var(--color-muted)]',
          dot: 'bg-[color:var(--color-border)]',
        };
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
      case 'MINOR':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]';
      case 'PATCH':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'EMERGENCY':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Version History Timeline</h2>
        <div className="text-sm text-[color:var(--color-muted)]">
          {timeline.length} version{timeline.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[linear-gradient(180deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))]"></div>

        {/* Timeline Entries */}
        <div className="space-y-8">
          {timeline.map((entry, index) => {
            const colors = getStatusColor(entry.lifecycleStatus);
            const isLast = index === timeline.length - 1;

            return (
              <div key={entry.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div className={'absolute left-0 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-lg ' + colors.bg}>
                  <div className={colors.icon}>
                    {getStatusIcon(entry.lifecycleStatus)}
                  </div>
                </div>

                {/* Content Card */}
                <div
                  className={'rounded-xl border-2 p-5 transition-all ' + (entry.isCurrent ? 'border-[color:var(--color-primary)] shadow-xl bg-[color:var(--color-surface)]' : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-border)] hover:shadow-lg') + (onVersionClick ? ' cursor-pointer' : '')}
                  onClick={() => onVersionClick?.(entry)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg text-[color:var(--color-foreground)]">
                        v{entry.versionNumber}
                      </span>
                      <span className={'px-3 py-1 rounded-full text-xs font-bold border ' + colors.bg + ' ' + colors.border + ' ' + colors.text}>
                        {entry.lifecycleStatus.replace('_', ' ')}
                      </span>
                      <span className={'px-2 py-0.5 rounded text-xs font-semibold border ' + getChangeTypeColor(entry.changeType)}>
                        {entry.changeType}
                      </span>
                      {entry.isCurrent && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[color:var(--color-primary)] text-white">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="text-right text-sm text-[color:var(--color-muted)]">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {entry.versionLabel && (
                    <div className="font-semibold text-[color:var(--color-foreground)] mb-2">
                      {entry.versionLabel}
                    </div>
                  )}

                  {entry.changeDescription && (
                    <p className="text-[color:var(--color-foreground)] mb-3 text-sm">
                      {entry.changeDescription}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)]">
                    <div>
                      <span className="font-medium">Created by:</span> {entry.createdBy}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="text-center text-sm text-[color:var(--color-muted)] pt-4 border-t border-[color:var(--color-border)]">
        Complete version history with full provenance tracking
      </div>
    </div>
  );
}
