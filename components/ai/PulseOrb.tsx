'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LightningBoltIcon,
  Cross2Icon,
  ReloadIcon,
  CrossCircledIcon,
  BellIcon,
  CheckIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import { getPulseFeed, dismissPulseCard, markPulseCardRead } from '@/lib/pulse/pulse-service';
import type { PulseCard } from '@/lib/pulse/pulse-service';

interface PulseOrbProps {
  enabled?: boolean;
}

export function PulseOrb({ enabled = true }: PulseOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cards, setCards] = useState<PulseCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPulseFeed({ limit: 10 });

      // totalCount of -1 indicates service unavailable
      if (response.totalCount === -1) {
        const newCount = failureCount + 1;
        setFailureCount(newCount);
        if (newCount >= 2) {
          setIsOffline(true);
        }
        setCards([]);
      } else {
        setFailureCount(0);
        setIsOffline(false);
        setCards(response.cards);
      }
    } catch {
      const newCount = failureCount + 1;
      setFailureCount(newCount);
      if (newCount >= 2) {
        setIsOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [failureCount]);

  useEffect(() => {
    if (isOpen && cards.length === 0 && !isOffline) {
      loadFeed();
    }
  }, [isOpen]);

  const handleDismiss = async (cardId: string) => {
    await dismissPulseCard(cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleMarkRead = async (cardId: string) => {
    await markPulseCardRead(cardId);
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, read: true } : c))
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-l-4 border-[color:var(--color-error)]';
      case 'insight':
        return 'border-l-4 border-[color:var(--color-accent)]';
      case 'action':
        return 'border-l-4 border-[color:var(--color-warning)]';
      case 'update':
        return 'border-l-4 border-[color:var(--color-info)]';
      default:
        return 'border-l-4 border-[color:var(--color-border)]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <BellIcon className="h-4 w-4 text-[color:var(--color-error)]" />;
      case 'insight':
        return <LightningBoltIcon className="h-4 w-4 text-[color:var(--color-accent)]" />;
      case 'action':
        return <CheckIcon className="h-4 w-4 text-[color:var(--color-warning)]" />;
      default:
        return <EyeOpenIcon className="h-4 w-4 text-[color:var(--color-info)]" />;
    }
  };

  if (!enabled) return null;

  const unreadCount = cards.filter((c) => !c.read).length;

  return (
    <>
      {/* Floating Orb - Left side, next to OpsChief */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl group"
        aria-label="Open Pulse Insights"
        title="Pulse - AI Insights & Notifications"
      >
        <LightningBoltIcon className="h-6 w-6" />
        {/* Pulse glow on hover */}
        <div className="absolute inset-0 rounded-full bg-[color:var(--color-accent)] opacity-0 group-hover:opacity-30 transition-opacity blur-lg -z-10" />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-error)] text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
        {/* Offline indicator */}
        {isOffline && (
          <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-muted)]">
            <CrossCircledIcon className="h-3 w-3 text-white" />
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg bg-[color:var(--color-surface)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-accent)]">
                  <LightningBoltIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Pulse</h2>
                  <p className="text-sm text-[color:var(--color-muted)]">AI Insights & Notifications</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFailureCount(0); setIsOffline(false); loadFeed(); }}
                  disabled={isLoading}
                  className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)] disabled:opacity-50"
                  title="Refresh"
                >
                  <ReloadIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)]"
                >
                  <Cross2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isOffline ? (
                <div className="text-center py-12">
                  <CrossCircledIcon className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-muted)] opacity-50" />
                  <p className="text-[color:var(--color-muted)]">Service Offline</p>
                  <button
                    onClick={() => { setFailureCount(0); setIsOffline(false); loadFeed(); }}
                    className="mt-3 text-sm text-[color:var(--color-info)] hover:underline"
                  >
                    Retry connection
                  </button>
                </div>
              ) : isLoading && cards.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <ReloadIcon className="h-8 w-8 animate-spin text-[color:var(--color-accent)]" />
                  <span className="ml-3 text-[color:var(--color-muted)]">Loading insights...</span>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-12">
                  <CheckIcon className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-success)]" />
                  <p className="text-[color:var(--color-muted)]">No new insights</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`rounded-lg bg-[color:var(--color-surface-alt)] p-4 ${getTypeColor(card.type)} ${
                        card.read ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5">{getTypeIcon(card.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-[color:var(--color-foreground)]">{card.title}</h4>
                            <span className="text-xs text-[color:var(--color-muted)] whitespace-nowrap">
                              {new Date(card.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[color:var(--color-muted)]">{card.summary}</p>
                          <div className="mt-3 flex items-center gap-2">
                            {!card.read && (
                              <button
                                onClick={() => handleMarkRead(card.id)}
                                className="text-xs text-[color:var(--color-info)] hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => handleDismiss(card.id)}
                              className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-error)]"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-3 text-xs text-[color:var(--color-muted)] flex items-center gap-2">
              <LightningBoltIcon className="h-4 w-4" />
              <span>Pulse delivers AI-powered insights about your governance data. Refreshes automatically.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
