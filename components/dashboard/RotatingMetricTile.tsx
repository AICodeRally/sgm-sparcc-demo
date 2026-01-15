'use client';

import { useState, useEffect } from 'react';
import {
  FileTextIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ArchiveIcon,
  AvatarIcon,
  StarFilledIcon,
} from '@radix-ui/react-icons';
import { MetricGroup, getGroupColors, STATUS_COLORS } from '@/lib/data/metric-registry';
import { Tone, getToneStyles } from '@/lib/config/themes';

interface RotatingMetricTileProps {
  group: MetricGroup;
  metricData: Record<string, number | string>;
  tone?: Tone;
}

const ICON_MAP = {
  FileTextIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ArchiveIcon,
  AvatarIcon,
};

export default function RotatingMetricTile({ group, metricData, tone = 'primary' }: RotatingMetricTileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const currentMetric = group.metrics[currentIndex];
  const colors = getGroupColors(group.color);
  const statusColors = STATUS_COLORS[currentMetric.status];
  const Icon = ICON_MAP[group.icon as keyof typeof ICON_MAP];
  const toneStyles = getToneStyles(tone);

  // Load click tracking from localStorage
  useEffect(() => {
    const key = `metric-clicks-${group.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setClickCount(parseInt(stored, 10));
    }
  }, [group.id]);

  // Update metric value from data
  const metricValue = metricData[currentMetric.fetchKey] ?? currentMetric.value;

  const handleClick = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Track click
    const newCount = clickCount + 1;
    setClickCount(newCount);
    localStorage.setItem(`metric-clicks-${group.id}`, newCount.toString());

    // Track which specific metric was clicked
    const metricKey = `metric-view-${currentMetric.id}`;
    const metricViews = parseInt(localStorage.getItem(metricKey) || '0', 10);
    localStorage.setItem(metricKey, (metricViews + 1).toString());

    // Cycle to next metric
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % group.metrics.length);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative theme-card rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
        statusColors.border
      } ${colors.hover} ${statusColors.glow} ${isAnimating ? 'scale-95' : 'scale-100'}`}
      style={{
        boxShadow: toneStyles.shadow,
      }}
    >
      {/* Colored top bar */}
      <div className="h-1.5" style={{ background: toneStyles.hover.replace('1px solid ', '') }} />
      <div className="p-6">
      {/* Position Indicator */}
      <div className="absolute top-2 right-2 text-[10px] font-medium text-[color:var(--color-muted)]">
        {currentIndex + 1}/{group.metrics.length}
      </div>

      {/* Status Indicator */}
      {currentMetric.status !== 'normal' && (
        <div
          className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
            currentMetric.status === 'critical' ? 'bg-transparent animate-pulse' : 'bg-transparent'
          }`}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[color:var(--color-muted)] font-medium">{currentMetric.label}</p>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>

      {/* Value */}
      <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <p className={`text-3xl font-bold ${colors.value} mt-2`}>
          {metricValue}
          {currentMetric.suffix && (
            <span className="text-lg ml-1">{currentMetric.suffix}</span>
          )}
        </p>
        <p className="text-xs text-[color:var(--color-muted)] mt-1">{currentMetric.description}</p>
      </div>

      {/* Click Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[10px] text-[color:var(--color-muted)] flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Click to rotate
        </div>
      </div>

      {/* Popular Badge (if clicked > 20 times) */}
      {clickCount > 20 && (
        <div className="absolute -top-2 -right-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
          <span className="inline-flex items-center gap-1">
            <StarFilledIcon className="w-3 h-3" />
            Popular
          </span>
        </div>
      )}
      </div>
    </button>
  );
}
