'use client';

import React, { useState } from 'react';
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';

interface Gap {
  id: string;
  planCode: string;
  policyArea: string;
  gapDescription: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'PLANNED' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX';
  bhgPolicyRef?: string;
  assignedTo?: string;
  dueDate?: string;
}

interface GapAnalysisSectionProps {
  gaps: Gap[];
}

/**
 * Gap Analysis Section Component
 * Display gaps with filtering and status indicators
 */
export function GapAnalysisSection({ gaps }: GapAnalysisSectionProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter gaps
  const filteredGaps = gaps.filter((gap) => {
    const matchesSeverity = severityFilter === 'ALL' || gap.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || gap.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
      case 'HIGH':
        return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
      case 'MEDIUM':
        return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
      case 'LOW':
        return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]';
      default:
        return 'text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)]';
      case 'PLANNED':
        return 'text-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)]';
      case 'IN_PROGRESS':
        return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)]';
      case 'RESOLVED':
        return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)]';
      case 'WONT_FIX':
        return 'text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)]';
      default:
        return 'text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)]';
    }
  };

  return (
    <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Gap Analysis</h2>
        <span className="text-sm text-[color:var(--color-muted)]">
          {filteredGaps.length} of {gaps.length} gaps
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Severity Filter */}
        <div>
          <label className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-1 block">
            Severity
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border-2 border-[color:var(--color-border)] rounded-lg text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          >
            <option value="ALL">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wide mb-1 block">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-[color:var(--color-border)] rounded-lg text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WONT_FIX">Won't Fix</option>
          </select>
        </div>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {filteredGaps.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircledIcon className="w-12 h-12 text-[color:var(--color-success)] mx-auto mb-3" />
            <p className="text-[color:var(--color-muted)]">No gaps found with current filters</p>
          </div>
        ) : (
          filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className={`border-2 rounded-lg p-4 ${getSeverityColor(gap.severity)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[color:var(--color-foreground)]">{gap.policyArea}</h3>
                    <p className="text-xs text-[color:var(--color-muted)] mt-0.5">Plan: {gap.planCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded uppercase">
                    {gap.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(gap.status)}`}>
                    {gap.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[color:var(--color-foreground)] mb-3 pl-8">{gap.gapDescription}</p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)] pl-8">
                {gap.bhgPolicyRef && (
                  <span>
                    <strong>BHG Policy:</strong> {gap.bhgPolicyRef}
                  </span>
                )}
                {gap.assignedTo && (
                  <span>
                    <strong>Assigned:</strong> {gap.assignedTo}
                  </span>
                )}
                {gap.dueDate && (
                  <span>
                    <strong>Due:</strong> {new Date(gap.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
