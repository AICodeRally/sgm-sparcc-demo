'use client';

import { useState } from 'react';
import {
  Cross2Icon,
  ClockIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
import type { PulseCard as PulseCardType } from '@/lib/pulse/pulse-service';
import { dismissCard, snoozeCard, pursueCard } from '@/lib/pulse/pulse-service';

interface PulseCardProps {
  card: PulseCardType;
  onAction?: () => void;
}

const URGENCY_CONFIG = {
  critical: {
    bgClass: 'bg-[color:var(--color-error-bg)]',
    borderClass: 'border-[color:var(--color-error-border)]',
    textClass: 'text-[color:var(--color-error)]',
    badgeClass: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]',
    icon: ExclamationTriangleIcon,
  },
  high: {
    bgClass: 'bg-[color:var(--color-warning-bg)]',
    borderClass: 'border-[color:var(--color-warning-border)]',
    textClass: 'text-[color:var(--color-warning)]',
    badgeClass: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
    icon: ExclamationTriangleIcon,
  },
  medium: {
    bgClass: 'bg-[color:var(--color-warning-bg)]',
    borderClass: 'border-[color:var(--color-warning-border)]',
    textClass: 'text-[color:var(--color-warning)]',
    badgeClass: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
    icon: InfoCircledIcon,
  },
  low: {
    bgClass: 'bg-[color:var(--color-success-bg)]',
    borderClass: 'border-[color:var(--color-success-border)]',
    textClass: 'text-[color:var(--color-success)]',
    badgeClass: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
    icon: InfoCircledIcon,
  },
};

const CHIEF_LABELS: Record<string, string> = {
  governance: 'Governance',
  knowledge: 'Knowledge',
  operations: 'Operations',
  security: 'Security',
  compliance: 'Compliance',
};

export function PulseCard({ card, onAction }: PulseCardProps) {
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const urgencyConfig = URGENCY_CONFIG[card.urgency];
  const UrgencyIcon = urgencyConfig.icon;

  const handleDismiss = async () => {
    setIsProcessing(true);
    const success = await dismissCard(card.id);
    setIsProcessing(false);
    if (success) {
      onAction?.();
    }
  };

  const handleSnooze = async (preset: '1_hour' | '4_hours' | 'tomorrow' | 'next_week') => {
    setIsProcessing(true);
    setIsSnoozeOpen(false);
    const success = await snoozeCard(card.id, preset);
    setIsProcessing(false);
    if (success) {
      onAction?.();
    }
  };

  const handlePursue = async () => {
    setIsProcessing(true);
    const success = await pursueCard(card.id);
    setIsProcessing(false);
    if (success) {
      onAction?.();
    }
  };

  return (
    <div
      className={`rounded-lg border-2 ${urgencyConfig.borderClass} ${urgencyConfig.bgClass} p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <UrgencyIcon className={`w-5 h-5 mt-0.5 ${urgencyConfig.textClass}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[color:var(--color-foreground)] text-sm">
                {card.title}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyConfig.badgeClass}`}>
                {card.urgency.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[color:var(--color-muted)] mb-2">
              {card.summary}
            </p>
            <div className="flex items-center gap-3 text-xs text-[color:var(--color-muted)]">
              <span>Source: {CHIEF_LABELS[card.sourceChief] || card.sourceChief}</span>
              <span className="text-[color:var(--color-border)]">|</span>
              <span>{new Date(card.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleDismiss}
              disabled={isProcessing}
              className="p-2 rounded-lg text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-foreground)] transition-colors disabled:opacity-50"
              title="Dismiss"
            >
            <Cross2Icon className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsSnoozeOpen(!isSnoozeOpen)}
              disabled={isProcessing}
              className="p-2 rounded-lg text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-foreground)] transition-colors disabled:opacity-50 flex items-center gap-1"
              title="Snooze"
            >
              <ClockIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-3 h-3" />
            </button>

            {isSnoozeOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSnoozeOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-1 shadow-lg z-20">
                  <button
                    onClick={() => handleSnooze('1_hour')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]"
                  >
                    1 hour
                  </button>
                  <button
                    onClick={() => handleSnooze('4_hours')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]"
                  >
                    4 hours
                  </button>
                  <button
                    onClick={() => handleSnooze('tomorrow')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => handleSnooze('next_week')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]"
                  >
                    Next week
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handlePursue}
            disabled={isProcessing}
            className="px-3 py-2 rounded-lg bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-secondary)] transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-medium"
            title="Pursue"
          >
            <CheckCircledIcon className="w-4 h-4" />
            Pursue
          </button>
        </div>
      </div>
    </div>
  );
}
