'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { Metric } from '@/lib/data/metric-registry';

const STACKS_CONFIG_KEY = 'metric-stacks-config';

interface StackableMetricProps {
  /** Unique ID for this stack (for localStorage persistence) */
  stackId: string;
  /** List of metrics that can be cycled through (default order) */
  metrics: Metric[];
  /** Live metric data keyed by fetchKey */
  metricData: Record<string, number | string>;
  /** Base color for styling (hex) */
  color: string;
  /** Mode this stack belongs to */
  mode?: string;
  /** Stack index (0-3) */
  stackIndex?: number;
  /** Callback when user clicks to rotate */
  onRotate?: (newIndex: number) => void;
}

export function StackableMetric({
  stackId,
  metrics,
  metricData,
  color,
  mode,
  stackIndex,
  onRotate,
}: StackableMetricProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orderedMetrics, setOrderedMetrics] = useState<Metric[]>(metrics);
  const [isVisible, setIsVisible] = useState(true);

  // Load saved config from localStorage
  useEffect(() => {
    // Load stack order and visibility from config
    if (mode !== undefined && stackIndex !== undefined) {
      try {
        const stored = localStorage.getItem(STACKS_CONFIG_KEY);
        if (stored) {
          const config = JSON.parse(stored);
          const modeConfig = config[mode];
          if (modeConfig && modeConfig[stackIndex]) {
            const stackConfig = modeConfig[stackIndex];
            setIsVisible(stackConfig.visible !== false);

            // Reorder metrics based on saved config
            if (stackConfig.metricIds && stackConfig.metricIds.length > 0) {
              const reordered = stackConfig.metricIds
                .map((id: string) => metrics.find(m => m.id === id))
                .filter(Boolean) as Metric[];
              if (reordered.length > 0) {
                setOrderedMetrics(reordered);
              }
            }
          }
        }
      } catch {
        // Invalid config, use defaults
      }
    }

    // Load current index
    const indexStored = localStorage.getItem(`stack-${stackId}`);
    if (indexStored) {
      const idx = parseInt(indexStored, 10);
      if (idx >= 0 && idx < metrics.length) {
        setCurrentIndex(idx);
      }
    }
  }, [stackId, metrics, mode, stackIndex]);

  // Use ordered metrics (from config) or fall back to default order
  const displayMetrics = orderedMetrics.length > 0 ? orderedMetrics : metrics;
  const safeIndex = currentIndex < displayMetrics.length ? currentIndex : 0;
  const currentMetric = displayMetrics[safeIndex];

  // Don't render if not visible or no metric
  if (!isVisible || !currentMetric) return null;

  const value = metricData[currentMetric.fetchKey] ?? currentMetric.value;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating || displayMetrics.length <= 1) return;

    setIsAnimating(true);

    setTimeout(() => {
      const newIndex = (safeIndex + 1) % displayMetrics.length;
      setCurrentIndex(newIndex);
      localStorage.setItem(`stack-${stackId}`, newIndex.toString());
      onRotate?.(newIndex);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-lg p-3 border transition-all text-left w-full ${
        displayMetrics.length > 1 ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-default'
      } ${isAnimating ? 'scale-95 opacity-50' : ''}`}
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}08`,
      }}
      title={displayMetrics.length > 1 ? 'Click to cycle metrics' : undefined}
    >
      <div className="flex items-start justify-between gap-1">
        <div className={`transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xl font-bold" style={{ color }}>
            {value}{currentMetric.suffix || ''}
          </p>
          <p className="text-xs text-[color:var(--color-muted)] truncate">
            {currentMetric.label}
          </p>
        </div>
        {displayMetrics.length > 1 && (
          <div className="flex flex-col items-center">
            <ChevronDownIcon
              className="w-3 h-3 text-[color:var(--color-muted)] opacity-50"
            />
            <span className="text-[8px] text-[color:var(--color-muted)] opacity-50">
              {safeIndex + 1}/{displayMetrics.length}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
