'use client';

import { useState, useEffect } from 'react';
import { PulseCard } from './PulseCard';
import { getPulseFeed } from '@/lib/pulse/pulse-service';
import type { PulseCard as PulseCardType, PulseUrgency, PulseSourceChief } from '@/lib/pulse/pulse-service';
import { ReloadIcon } from '@radix-ui/react-icons';

interface PulseFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PulseFeed({ limit, autoRefresh = true, refreshInterval = 60000 }: PulseFeedProps) {
  const [cards, setCards] = useState<PulseCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState<PulseUrgency | 'all'>('all');
  const [chiefFilter, setChiefFilter] = useState<PulseSourceChief | 'all'>('all');

  const loadFeed = async () => {
    setIsLoading(true);
    const response = await getPulseFeed({
      urgency: urgencyFilter === 'all' ? undefined : urgencyFilter,
      sourceChief: chiefFilter === 'all' ? undefined : chiefFilter,
      limit,
    });
    setCards(response.cards);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, [urgencyFilter, chiefFilter, limit]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadFeed();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, urgencyFilter, chiefFilter, limit]);

  const handleCardAction = () => {
    loadFeed();
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-[color:var(--color-muted)]">
          <ReloadIcon className="w-5 h-5 animate-spin" />
          <span>Loading Pulse feed...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[color:var(--color-foreground)]">
            Urgency:
          </label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as PulseUrgency | 'all')}
            className="px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-sm text-[color:var(--color-foreground)]"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[color:var(--color-foreground)]">
            Source:
          </label>
          <select
            value={chiefFilter}
            onChange={(e) => setChiefFilter(e.target.value as PulseSourceChief | 'all')}
            className="px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-sm text-[color:var(--color-foreground)]"
          >
            <option value="all">All Chiefs</option>
            <option value="governance">Governance</option>
            <option value="knowledge">Knowledge</option>
            <option value="operations">Operations</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>

        <button
          onClick={loadFeed}
          disabled={isLoading}
          className="ml-auto px-4 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-alt)] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm text-[color:var(--color-foreground)]"
        >
          <ReloadIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]">
          <p className="text-[color:var(--color-muted)]">No Pulse cards found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <PulseCard key={card.id} card={card} onAction={handleCardAction} />
          ))}
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && cards.length > 0 && (
        <div className="text-center text-xs text-[color:var(--color-muted)] py-2">
          Auto-refreshing every {refreshInterval / 1000} seconds
        </div>
      )}
    </div>
  );
}
