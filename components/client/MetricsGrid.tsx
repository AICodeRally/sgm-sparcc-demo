'use client';

import React from 'react';

interface Metric {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorClass?: string;
}

interface MetricsGridProps {
  metrics: Metric[];
}

/**
 * Metrics Grid Component
 * Display key ROI and risk metrics in a responsive grid
 */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'neutral':
        return '→';
      default:
        return null;
    }
  };

  const getTrendColorClass = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)]';
      case 'down':
        return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)]';
      case 'neutral':
        return 'text-[color:var(--color-muted)] bg-[color:var(--color-surface-alt)]';
      default:
        return '';
    }
  };

  return (
    <div className={`grid gap-6 ${metrics.length === 4 ? 'grid-cols-4' : metrics.length === 3 ? 'grid-cols-3' : metrics.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`theme-card rounded-xl border-2 p-6 text-center transition-all hover:shadow-lg ${
            metric.colorClass || 'border-[color:var(--color-accent-border)]'
          }`}
        >
          <p className={`text-4xl font-bold ${metric.colorClass ? metric.colorClass.replace('border-', 'text-').replace('-200', '-600') : 'text-[color:var(--color-accent)]'}`}>
            {metric.value}
          </p>
          <p className="text-sm text-[color:var(--color-muted)] mt-2 font-medium">{metric.label}</p>

          {metric.subtext && (
            <p className="text-xs text-[color:var(--color-muted)] mt-1">{metric.subtext}</p>
          )}

          {metric.trend && metric.trendValue && (
            <div className="mt-3 flex items-center justify-center">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getTrendColorClass(metric.trend)}`}>
                {getTrendIcon(metric.trend)} {metric.trendValue}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
