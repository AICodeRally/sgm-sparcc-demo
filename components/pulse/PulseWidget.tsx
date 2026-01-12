'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PulseCard } from './PulseCard';
import { getPulseFeed } from '@/lib/pulse/pulse-service';
import type { PulseCard as PulseCardType } from '@/lib/pulse/pulse-service';
import { ArrowRightIcon, ReloadIcon } from '@radix-ui/react-icons';
import { getToneStyles } from '@/lib/config/themes';

interface PulseWidgetProps {
  maxCards?: number;
  tone?: 'primary' | 'secondary' | 'accent' | 'infra';
}

export function PulseWidget({ maxCards = 3, tone = 'accent' }: PulseWidgetProps) {
  const [cards, setCards] = useState<PulseCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toneStyles = getToneStyles(tone);

  const loadFeed = async () => {
    setIsLoading(true);
    const response = await getPulseFeed({ limit: maxCards });
    setCards(response.cards.slice(0, maxCards));
    setIsLoading(false);
  };

  useEffect(() => {
    loadFeed();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadFeed, 60000);
    return () => clearInterval(interval);
  }, [maxCards]);

  const handleCardAction = () => {
    loadFeed();
  };

  return (
    <div
      className="bg-[color:var(--color-surface)] rounded-lg border p-4 theme-card"
      style={{ border: toneStyles.border, boxShadow: toneStyles.shadow }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Pulse Insights
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-[color:var(--color-foreground)] border" style={{ borderColor: toneStyles.hover }}>
            Accent
          </span>
        </div>
        <Link
          href="/pulse"
          className="flex items-center gap-1 text-sm text-[color:var(--color-info)] hover:text-[color:var(--color-info)] font-medium"
        >
          View All
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {isLoading && cards.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-[color:var(--color-muted)]">
            <ReloadIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[color:var(--color-muted)]">No insights at the moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <PulseCard key={card.id} card={card} onAction={handleCardAction} />
          ))}
        </div>
      )}
    </div>
  );
}
