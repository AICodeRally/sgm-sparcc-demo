'use client';

import React, { useMemo } from 'react';
import {
  ClockIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  PersonIcon,
  BarChartIcon,
  TargetIcon,
  LightningBoltIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { CASE_ITEMS } from '@/lib/data/synthetic/cases.data';
import {
  calculateCaseSLA,
  calculateAssigneeLoad,
  suggestOptimalAssignment,
  SLA_POLICIES,
} from '@/lib/data/synthetic/case-sla-config.data';

export default function CaseSLAPage() {
  // Calculate SLA status for all active cases
  const activeCases = CASE_ITEMS.filter(
    c => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  const caseSLAs = useMemo(() => {
    return activeCases.map(c => ({
      case: c,
      sla: calculateCaseSLA(c),
    }));
  }, []);

  // Calculate overall SLA metrics
  const slaMetrics = useMemo(() => {
    const total = caseSLAs.length;
    const onTrack = caseSLAs.filter(c => c.sla.status === 'ON_TRACK').length;
    const atRisk = caseSLAs.filter(c => c.sla.status === 'AT_RISK').length;
    const breached = caseSLAs.filter(c => c.sla.status === 'BREACHED').length;
    const shouldEscalate = caseSLAs.filter(c => c.sla.shouldEscalate).length;

    return {
      total,
      onTrack,
      atRisk,
      breached,
      shouldEscalate,
      complianceRate: total > 0 ? Math.round((onTrack / total) * 100) : 0,
    };
  }, [caseSLAs]);

  // Get unique assignees
  const assignees = useMemo(() => {
    const names = [...new Set(CASE_ITEMS.map(c => c.assignedTo).filter(Boolean))];
    return names.map(name => calculateAssigneeLoad(CASE_ITEMS, name!));
  }, []);

  // Sort cases by SLA urgency
  const sortedCases = useMemo(() => {
    return [...caseSLAs].sort((a, b) => {
      // Breached first, then at-risk, then by percent elapsed
      if (a.sla.status === 'BREACHED' && b.sla.status !== 'BREACHED') return -1;
      if (b.sla.status === 'BREACHED' && a.sla.status !== 'BREACHED') return 1;
      if (a.sla.status === 'AT_RISK' && b.sla.status === 'ON_TRACK') return -1;
      if (b.sla.status === 'AT_RISK' && a.sla.status === 'ON_TRACK') return 1;
      return b.sla.percentElapsed - a.sla.percentElapsed;
    });
  }, [caseSLAs]);

  // Get optimization suggestion for a new urgent case
  const optimizationSuggestion = useMemo(() => {
    return suggestOptimalAssignment(
      CASE_ITEMS,
      assignees.map(a => a.assigneeName),
      'URGENT'
    );
  }, [assignees]);

  return (
    <>
      <SetPageTitle
        title="Case SLA & Load Management"
        description="SLA tracking, compliance monitoring, and workload optimization"
      />
      <div className="h-screen flex flex-col sparcc-hero-bg overflow-hidden">
        {/* Stats Bar */}
        <div className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-6 py-4">
          <div className="flex items-center justify-end">
            <div className="text-right">
              <p className="text-xs text-[color:var(--color-muted)]">Overall SLA Compliance</p>
              <p className="text-2xl font-bold text-[color:var(--color-primary)]">
                {slaMetrics.complianceRate}%
              </p>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* SLA Overview Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="w-8 h-8 text-[color:var(--color-info)]" />
                <span className="text-3xl font-bold text-[color:var(--color-info)]">
                  {slaMetrics.total}
                </span>
              </div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">Active Cases</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-1">Under SLA tracking</p>
            </div>

            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-success-border)] p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircledIcon className="w-8 h-8 text-[color:var(--color-success)]" />
                <span className="text-3xl font-bold text-[color:var(--color-success)]">
                  {slaMetrics.onTrack}
                </span>
              </div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">On Track</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-1">
                {Math.round((slaMetrics.onTrack / slaMetrics.total) * 100)}% of cases
              </p>
            </div>

            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-warning-border)] p-6">
              <div className="flex items-center justify-between mb-2">
                <ExclamationTriangleIcon className="w-8 h-8 text-[color:var(--color-warning)]" />
                <span className="text-3xl font-bold text-[color:var(--color-warning)]">
                  {slaMetrics.atRisk}
                </span>
              </div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">At Risk</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-1">
                {slaMetrics.shouldEscalate} need escalation
              </p>
            </div>

            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-error-border)] p-6">
              <div className="flex items-center justify-between mb-2">
                <CrossCircledIcon className="w-8 h-8 text-[color:var(--color-error)]" />
                <span className="text-3xl font-bold text-[color:var(--color-error)]">
                  {slaMetrics.breached}
                </span>
              </div>
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">Breached</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-1">Past SLA deadline</p>
            </div>
          </div>

          {/* Assignee Load Distribution */}
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
              Case Load Distribution
            </h2>
            <div className="space-y-3">
              {assignees.map(assignee => (
                <div key={assignee.assigneeName} className="border border-[color:var(--color-border)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PersonIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                      <div>
                        <p className="font-semibold text-[color:var(--color-foreground)]">
                          {assignee.assigneeName}
                        </p>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          {assignee.activeCases} active cases • Avg {assignee.avgResolutionDays}d resolution
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                          {assignee.capacity}% capacity
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            assignee.workload === 'UNDER'
                              ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]'
                              : assignee.workload === 'OPTIMAL'
                              ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                              : assignee.workload === 'HIGH'
                              ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              : 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                          }`}
                        >
                          {assignee.workload}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-[color:var(--color-border)] rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        assignee.workload === 'UNDER'
                          ? 'bg-[color:var(--color-surface-alt)]0'
                          : assignee.workload === 'OPTIMAL'
                          ? 'bg-transparent'
                          : assignee.workload === 'HIGH'
                          ? 'bg-[color:var(--color-warning)]'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${Math.min(100, assignee.capacity)}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-xs text-[color:var(--color-muted)]">
                    <span>{assignee.urgentCases} urgent</span>
                    <span>{assignee.highPriorityCases} high priority</span>
                    {assignee.atRiskCases > 0 && (
                      <span className="text-[color:var(--color-warning)] font-medium">
                        {assignee.atRiskCases} at risk
                      </span>
                    )}
                    {assignee.breachedCases > 0 && (
                      <span className="text-[color:var(--color-error)] font-medium">
                        {assignee.breachedCases} breached
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestion */}
          <div className="bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--color-foreground)] mb-3 flex items-center gap-2">
              <LightningBoltIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
              Load Optimization Suggestion
            </h2>
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4">
              <div className="flex items-start gap-3">
                <TargetIcon className="w-6 h-6 text-[color:var(--color-primary)] flex-none mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-[color:var(--color-foreground)] mb-2">
                    For next urgent case, assign to:{' '}
                    <span className="text-[color:var(--color-primary)]">
                      {optimizationSuggestion.assignee}
                    </span>
                  </p>
                  <p className="text-sm text-[color:var(--color-muted)] mb-2">
                    {optimizationSuggestion.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[color:var(--color-border)] rounded-full h-2">
                      <div
                        className="bg-[color:var(--color-primary)] h-2 rounded-full"
                        style={{ width: `${optimizationSuggestion.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[color:var(--color-muted)]">
                      {optimizationSuggestion.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* At-Risk and Breached Cases */}
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-[color:var(--color-warning)]" />
              Priority Cases (At-Risk & Breached)
            </h2>
            <div className="space-y-2">
              {sortedCases
                .filter(c => c.sla.status !== 'ON_TRACK')
                .slice(0, 10)
                .map(({ case: c, sla }) => (
                  <div
                    key={c.id}
                    className={`border rounded-lg p-4 ${
                      sla.status === 'BREACHED'
                        ? 'border-[color:var(--color-error-border)] bg-[color:var(--color-error-bg)]'
                        : 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-bg)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              sla.status === 'BREACHED'
                                ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                                : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                            }`}
                          >
                            {sla.status}
                          </span>
                          <span className="text-xs font-medium text-[color:var(--color-muted)]">
                            {c.caseNumber}
                          </span>
                          <span className="text-xs text-[color:var(--color-muted)]">•</span>
                          <span className="text-xs text-[color:var(--color-muted)]">{c.type}</span>
                          {sla.shouldEscalate && (
                            <>
                              <span className="text-xs text-[color:var(--color-muted)]">•</span>
                              <span className="text-xs font-medium text-[color:var(--color-error)]">
                                AUTO-ESCALATE
                              </span>
                            </>
                          )}
                        </div>
                        <p className="font-semibold text-[color:var(--color-foreground)] text-sm mb-1">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)]">
                          <span className="flex items-center gap-1">
                            <PersonIcon className="w-3 h-3" />
                            {c.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {sla.daysElapsed} / {sla.slaPolicy.targetResolutionDays} days
                          </span>
                          <span className={`font-medium ${
                            sla.status === 'BREACHED' ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-warning)]'
                          }`}>
                            {sla.daysRemaining > 0
                              ? `${sla.daysRemaining}d remaining`
                              : `${Math.abs(sla.daysRemaining)}d overdue`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[color:var(--color-foreground)] mb-1">
                          {Math.round(sla.percentElapsed)}%
                        </div>
                        <div className="w-24 bg-[color:var(--color-border)] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              sla.status === 'BREACHED'
                                ? 'bg-[color:var(--color-error)]'
                                : 'bg-[color:var(--color-warning)]'
                            }`}
                            style={{ width: `${Math.min(100, sla.percentElapsed)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* SLA Policy Reference */}
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4 flex items-center gap-2">
              <InfoCircledIcon className="w-5 h-5 text-[color:var(--color-info)]" />
              SLA Policy Reference
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[color:var(--color-surface-alt)] border-b border-[color:var(--color-border)]">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-foreground)]">
                      Case Type
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-foreground)]">
                      Priority
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[color:var(--color-foreground)]">
                      Target Days
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[color:var(--color-foreground)]">
                      Warning at
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[color:var(--color-foreground)]">
                      Escalate at
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[color:var(--color-foreground)]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {SLA_POLICIES.map(policy => (
                    <tr key={policy.id} className="hover:bg-[color:var(--color-surface-alt)]">
                      <td className="px-4 py-3 text-[color:var(--color-foreground)]">
                        {policy.caseType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            policy.priority === 'URGENT'
                              ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                              : policy.priority === 'HIGH'
                              ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              : policy.priority === 'MEDIUM'
                              ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]'
                              : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                          }`}
                        >
                          {policy.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-[color:var(--color-foreground)]">
                        {policy.targetResolutionDays}d
                      </td>
                      <td className="px-4 py-3 text-center text-[color:var(--color-muted)]">
                        {policy.warningThresholdPercent}%
                      </td>
                      <td className="px-4 py-3 text-center text-[color:var(--color-muted)]">
                        {policy.escalationThresholdPercent}%
                      </td>
                      <td className="px-4 py-3 text-[color:var(--color-muted)] text-xs">
                        {policy.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
