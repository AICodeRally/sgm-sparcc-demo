'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
import { OperationalMode } from '@/types/operational-mode';
import { getModeConfig } from '@/lib/auth/mode-permissions';
import { getMetricGroupsByMode } from '@/lib/data/metric-registry';

interface ModeCardProps {
  mode: OperationalMode;
  className?: string;
  metricData?: Record<string, number | string>;
}

/**
 * Hero card for an operational mode
 * Displays mode info with gradient background and feature list
 */
export function ModeCard({ mode, className = '', metricData = {} }: ModeCardProps) {
  const config = getModeConfig(mode);
  // Demo mode: always allow access
  const canAccess = true;

  // Get metrics for this mode
  const metricGroups = getMetricGroupsByMode(mode);
  // Flatten all metrics from all groups for this mode (take first 4)
  const allMetrics = metricGroups.flatMap(g => g.metrics).slice(0, 4);

  // Map icon names to actual icon components
  const iconMap = {
    Pencil2Icon: Pencil2Icon,
    GearIcon: GearIcon,
    ExclamationTriangleIcon: ExclamationTriangleIcon,
    EyeOpenIcon: EyeOpenIcon,
  };

  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || GearIcon;

  // Use dynamic colors from config
  const baseColor = config.color.hex;

  // Take top 5 features
  const topFeatures = config.features.slice(0, 5);

  const content = (
    <div
      className={`bg-gradient-to-br rounded-xl border-2 p-8 transition-all duration-300 ${
        canAccess
          ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      } ${className}`}
      style={{
        background: `linear-gradient(to bottom right, ${baseColor}15, ${baseColor}30)`,
        borderColor: `${baseColor}50`
      }}
    >
      {/* Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className="rounded-lg p-3 shadow-md"
            style={{ backgroundColor: baseColor }}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">
              {config.label}
            </h2>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">
              {config.tagline}
            </p>
          </div>
        </div>
        {!canAccess && (
          <div className="bg-[color:var(--color-surface)] rounded-lg p-2 shadow-sm border border-[color:var(--color-border)]">
            <LockClosedIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-[color:var(--color-foreground)] opacity-90 mb-6 text-base">
        {config.description}
      </p>

      {/* Metrics Grid - 2x2 */}
      <div className="mb-6">
        <p className="text-[color:var(--color-foreground)] font-semibold mb-3 text-sm uppercase tracking-wide">
          Key Metrics
        </p>
        <div className="grid grid-cols-2 gap-2">
          {allMetrics.map((metric) => {
            const value = metricData[metric.fetchKey] ?? metric.value;
            return (
              <div
                key={metric.id}
                className="rounded-lg p-3 border transition-all hover:scale-[1.02]"
                style={{
                  borderColor: `${baseColor}30`,
                  backgroundColor: `${baseColor}08`,
                }}
              >
                <p className="text-xl font-bold" style={{ color: baseColor }}>
                  {value}{metric.suffix || ''}
                </p>
                <p className="text-xs text-[color:var(--color-muted)] truncate">
                  {metric.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button or Locked Message */}
      {canAccess ? (
        <div
          className="text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:opacity-90"
          style={{ background: `linear-gradient(to right, ${baseColor}, ${baseColor}dd)` }}
        >
          Enter {config.label}
          <ArrowRightIcon className="w-5 h-5" />
        </div>
      ) : (
        <div className="bg-[color:var(--color-surface)] border-2 border-[color:var(--color-border)] text-[color:var(--color-muted)] font-semibold py-3 px-6 rounded-lg text-center">
          <LockClosedIcon className="w-4 h-4 inline-block mr-2" />
          Access Restricted
        </div>
      )}
    </div>
  );

  // If user has access, wrap in Link
  if (canAccess) {
    return <Link href={config.defaultRoute as any}>{content}</Link>;
  }

  // Otherwise, just render the card without link
  return content;
}
