'use client';

import { useState, useEffect } from 'react';
import { ActivityLogIcon, Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';

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
      const response = await fetch('/api/ai/opschief?tenantId=platform');
      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.status}`);
      }
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error('OpsChief fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-l-4 border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-500/10';
      case 'info':
        return 'border-l-4 border-blue-500 bg-blue-500/10';
      default:
        return '';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        className="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl group"
        aria-label="Open OpsChief Insights"
        title="OpsChief - System Health & Insights"
      >
        <ActivityLogIcon className="h-6 w-6" />
        {/* Pulse glow on hover */}
        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-0 group-hover:opacity-30 transition-opacity blur-lg -z-10" />
        {/* Alert badge */}
        {alertCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {alertCount}
          </span>
        )}
      </button>

      {/* Insights Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                  <ActivityLogIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">OpsChief</h2>
                  <p className="text-sm text-gray-500">System Health & Governance Insights</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchInsights}
                  disabled={isLoading}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                  aria-label="Refresh"
                  title="Refresh insights"
                >
                  <ReloadIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close"
                >
                  <Cross2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total Insights:</span>
                  <span className="font-semibold text-gray-900">{insights.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">🚨 Alerts:</span>
                  <span className="font-semibold text-red-800">{alertCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠️ Warnings:</span>
                  <span className="font-semibold text-yellow-800">{warningCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">ℹ️ Info:</span>
                  <span className="font-semibold text-blue-800">{insights.length - alertCount - warningCount}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <ReloadIcon className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Analyzing governance data...</span>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">⚠️ {error}</p>
                  <button
                    onClick={fetchInsights}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Try again
                  </button>
                </div>
              ) : insights.length === 0 ? (
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <p className="text-lg font-medium text-green-800">✅ All systems healthy</p>
                  <p className="mt-2 text-sm text-green-600">
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
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityBadge(
                                insight.severity
                              )}`}
                            >
                              {insight.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{insight.description}</p>
                          {insight.suggestedAction && (
                            <div className="mt-3 rounded-md bg-white/50 p-3">
                              <p className="text-xs font-medium text-gray-600">💡 Suggested Action:</p>
                              <p className="mt-1 text-sm text-gray-800">{insight.suggestedAction}</p>
                            </div>
                          )}
                          <p className="mt-3 text-xs text-gray-500">
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
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
              💡 OpsChief analyzes governance patterns, approval workflows, and compliance health.
              Insights refresh hourly.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
