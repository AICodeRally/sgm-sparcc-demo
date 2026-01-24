'use client';

import { useState, useEffect } from 'react';
import {
  ActivityLogIcon,
  Cross2Icon,
  ReloadIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  LightningBoltIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import { fetchOpsSignals, type TelemetrySignal } from '@/lib/aicr/client';

interface Insight {
  id: string;
  type: 'alert' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
}

/**
 * Map AICR telemetry signal to Insight format
 */
function mapSignalToInsight(signal: TelemetrySignal): Insight {
  // Determine type based on signal type prefix or severity
  let type: 'alert' | 'warning' | 'info' = 'info';
  if (signal.severity === 'critical' || signal.type.includes('ANOMALY')) {
    type = 'alert';
  } else if (signal.severity === 'high' || signal.type.includes('THRESHOLD')) {
    type = 'warning';
  }

  return {
    id: signal.id,
    type,
    title: signal.title,
    description: signal.description,
    timestamp: new Date(signal.timestamp),
    severity: signal.severity,
    actionable: !!signal.suggestedAction || !!signal.actionUrl,
    suggestedAction: signal.suggestedAction,
  };
}

interface OpsChiefOrbProps {
  appName?: string;
  enabled?: boolean;
}

export function OpsChiefOrb({ appName = 'SGM SPARCC', enabled = true }: OpsChiefOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch insights when panel opens
  useEffect(() => {
    if (isOpen && insights.length === 0) {
      fetchInsights();
    }
  }, [isOpen]);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from AICR telemetry endpoint
      const response = await fetchOpsSignals(20);

      if (response.signals.length === 0 && response.count === 0) {
        // Could be empty data or service unavailable - show empty state
        setInsights([]);
        return;
      }

      // Map AICR signals to Insight format
      const mappedInsights = response.signals.map(mapSignalToInsight);
      setInsights(mappedInsights);
    } catch {
      // Suppress network errors silently
      setError('Service temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-l-4 border-[color:var(--color-error-border)] bg-transparent/10';
      case 'warning':
        return 'border-l-4 border-[color:var(--color-warning-border)] bg-transparent/10';
      case 'info':
        return 'border-l-4 border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)]0/10';
      default:
        return '';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-[color:var(--color-error)]" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-[color:var(--color-warning)]" />;
      case 'info':
        return <InfoCircledIcon className="h-5 w-5 text-[color:var(--color-info)]" />;
      default:
        return <InfoCircledIcon className="h-5 w-5 text-[color:var(--color-muted)]" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]';
      case 'high':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]';
      case 'medium':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]';
      case 'low':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
    }
  };

  if (!enabled) return null;

  const alertCount = insights.filter(i => i.type === 'alert').length;
  const warningCount = insights.filter(i => i.type === 'warning').length;

  return (
    <>
      {/* Floating Orb - Lower Left (Purple disc with pulse) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl group"
        style={{ backgroundColor: 'var(--sparcc-gradient-start)' }}
        aria-label="Open OpsChief Insights"
        title="OpsChief - System Health & Insights"
      >
        <ActivityLogIcon className="h-6 w-6" />
        {/* Pulse glow on hover */}
        <div className="absolute inset-0 rounded-full bg-[color:var(--color-surface-alt)]0 opacity-0 group-hover:opacity-30 transition-opacity blur-lg -z-10" />
        {/* Alert badge */}
        {alertCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-transparent text-xs font-bold">
            {alertCount}
          </span>
        )}
      </button>

      {/* Insights Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-[color:var(--color-surface)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--sparcc-gradient-start)' }}>
                  <ActivityLogIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">OpsChief</h2>
                  <p className="text-sm text-[color:var(--color-muted)]">System Health & Governance Insights</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchInsights}
                  disabled={isLoading}
                  className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-muted)] disabled:opacity-50"
                  aria-label="Refresh"
                  title="Refresh insights"
                >
                  <ReloadIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-muted)]"
                  aria-label="Close"
                >
                  <Cross2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-3">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[color:var(--color-muted)]">Total Insights:</span>
                  <span className="font-semibold text-[color:var(--color-foreground)]">{insights.length}</span>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--color-error)]">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Alerts:</span>
                  <span className="font-semibold">{alertCount}</span>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--color-warning)]">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Warnings:</span>
                  <span className="font-semibold">{warningCount}</span>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--color-info)]">
                  <InfoCircledIcon className="h-4 w-4" />
                  <span>Info:</span>
                  <span className="font-semibold">{insights.length - alertCount - warningCount}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <ReloadIcon className="h-8 w-8 animate-spin text-[color:var(--color-primary)]" />
                  <span className="ml-3 text-[color:var(--color-muted)]">Analyzing governance data...</span>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-[color:var(--color-error-border)] bg-[color:var(--color-error-bg)] p-4">
                  <p className="text-sm text-[color:var(--color-error)] flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {error}
                  </p>
                  <button
                    onClick={fetchInsights}
                    className="mt-3 text-sm font-medium text-[color:var(--color-error)] hover:text-[color:var(--color-error)]"
                  >
                    Try again
                  </button>
                </div>
              ) : insights.length === 0 ? (
                <div className="rounded-lg bg-[color:var(--color-success-bg)] p-6 text-center">
                  <p className="text-lg font-medium text-[color:var(--color-success)]">
                    <CheckCircledIcon className="inline h-5 w-5 mr-2" />
                    All systems healthy
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--color-success)]">
                    No governance issues detected. Everything is operating normally.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`rounded-lg p-4 ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-[color:var(--color-foreground)]">{insight.title}</h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityBadge(
                                insight.severity
                              )}`}
                            >
                              {insight.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[color:var(--color-foreground)]">{insight.description}</p>
                          {insight.suggestedAction && (
                            <div className="mt-3 rounded-md bg-[color:var(--surface-glass)] p-3">
                              <p className="flex items-center gap-1 text-xs font-medium text-[color:var(--color-muted)]">
                                <LightningBoltIcon className="h-4 w-4" />
                                Suggested Action:
                              </p>
                              <p className="mt-1 text-sm text-[color:var(--color-foreground)]">{insight.suggestedAction}</p>
                            </div>
                          )}
                          <p className="mt-3 text-xs text-[color:var(--color-muted)]">
                            {new Date(insight.timestamp).toLocaleString()}
                          </p>
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
              <span>OpsChief analyzes governance patterns, approval workflows, and compliance health. Insights refresh hourly.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
