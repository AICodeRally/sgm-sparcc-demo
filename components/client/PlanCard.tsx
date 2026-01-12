'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface PlanCardProps {
  planCode: string;
  planName: string;
  planType?: string;
  businessUnit?: string;
  coverageFull: number;
  coverageLimited: number;
  coverageNo: number;
  riskScore: number;
  detailsHref?: string;
}

/**
 * Plan Card Component
 * Display plan summary with coverage metrics and risk score
 */
export function PlanCard({
  planCode,
  planName,
  planType,
  businessUnit,
  coverageFull,
  coverageLimited,
  coverageNo,
  riskScore,
  detailsHref,
}: PlanCardProps) {
  // Calculate total policies
  const totalPolicies = coverageFull + coverageLimited + coverageNo;
  const coveragePercentage = totalPolicies > 0
    ? Math.round(((coverageFull + coverageLimited * 0.5) / totalPolicies) * 100)
    : 0;

  // Determine risk color
  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
    if (score >= 50) return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
    if (score >= 25) return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
    return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]';
  };

  const riskLabel = (score: number) => {
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 25) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6 transition-all hover:shadow-lg hover:border-[color:var(--color-accent-border)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-[color:var(--color-foreground)]">{planCode}</h3>
            {planType && (
              <span className="px-2 py-0.5 bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] text-xs font-semibold rounded">
                {planType}
              </span>
            )}
          </div>
          <p className="text-sm text-[color:var(--color-foreground)]">{planName}</p>
          {businessUnit && (
            <p className="text-xs text-[color:var(--color-muted)] mt-1">{businessUnit}</p>
          )}
        </div>

        {/* Risk Badge */}
        <div className={`px-3 py-1 rounded-lg border-2 ${getRiskColor(riskScore)}`}>
          <p className="text-xs font-semibold">{riskLabel(riskScore)}</p>
          <p className="text-lg font-bold">{riskScore}</p>
        </div>
      </div>

      {/* Coverage Bars */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">Policy Coverage</p>
          <p className="text-sm font-bold text-[color:var(--color-accent)]">{coveragePercentage}%</p>
        </div>

        {/* Visual coverage bar */}
        <div className="h-3 bg-[color:var(--color-border)] rounded-full overflow-hidden flex">
          {coverageFull > 0 && (
            <div
              className="bg-transparent h-full"
              style={{ width: `${(coverageFull / totalPolicies) * 100}%` }}
              title={`Full Coverage: ${coverageFull}`}
            />
          )}
          {coverageLimited > 0 && (
            <div
              className="bg-transparent h-full"
              style={{ width: `${(coverageLimited / totalPolicies) * 100}%` }}
              title={`Limited Coverage: ${coverageLimited}`}
            />
          )}
          {coverageNo > 0 && (
            <div
              className="bg-transparent h-full"
              style={{ width: `${(coverageNo / totalPolicies) * 100}%` }}
              title={`No Coverage: ${coverageNo}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-transparent rounded" />
            <span className="text-[color:var(--color-muted)]">Full ({coverageFull})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-transparent rounded" />
            <span className="text-[color:var(--color-muted)]">Limited ({coverageLimited})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-transparent rounded" />
            <span className="text-[color:var(--color-muted)]">None ({coverageNo})</span>
          </div>
        </div>
      </div>

      {/* Details Link */}
      {detailsHref && (
        <Link href={detailsHref as any}>
          <div className="flex items-center justify-between text-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors cursor-pointer mt-4 pt-4 border-t border-[color:var(--color-border)]">
            <span className="text-sm font-semibold">View Details</span>
            <ArrowRightIcon className="w-4 h-4" />
          </div>
        </Link>
      )}
    </div>
  );
}
