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
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-white/90 backdrop-blur-sm border-b border-purple-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
              Case SLA Management & Load Optimization
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor SLA compliance and optimize case assignments
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Overall SLA Compliance</p>
              <p className="text-2xl font-bold text-purple-600">
                {slaMetrics.complianceRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* SLA Overview Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-blue-600">
                  {slaMetrics.total}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Active Cases</p>
              <p className="text-xs text-gray-500 mt-1">Under SLA tracking</p>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircledIcon className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-bold text-green-600">
                  {slaMetrics.onTrack}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">On Track</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((slaMetrics.onTrack / slaMetrics.total) * 100)}% of cases
              </p>
            </div>

            <div className="bg-white rounded-lg border border-orange-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                <span className="text-3xl font-bold text-orange-600">
                  {slaMetrics.atRisk}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">At Risk</p>
              <p className="text-xs text-gray-500 mt-1">
                {slaMetrics.shouldEscalate} need escalation
              </p>
            </div>

            <div className="bg-white rounded-lg border border-red-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <CrossCircledIcon className="w-8 h-8 text-red-500" />
                <span className="text-3xl font-bold text-red-600">
                  {slaMetrics.breached}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Breached</p>
              <p className="text-xs text-gray-500 mt-1">Past SLA deadline</p>
            </div>
          </div>

          {/* Assignee Load Distribution */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-purple-600" />
              Case Load Distribution
            </h2>
            <div className="space-y-3">
              {assignees.map(assignee => (
                <div key={assignee.assigneeName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PersonIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {assignee.assigneeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignee.activeCases} active cases • Avg {assignee.avgResolutionDays}d resolution
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          {assignee.capacity}% capacity
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            assignee.workload === 'UNDER'
                              ? 'bg-blue-100 text-blue-700'
                              : assignee.workload === 'OPTIMAL'
                              ? 'bg-green-100 text-green-700'
                              : assignee.workload === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {assignee.workload}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        assignee.workload === 'UNDER'
                          ? 'bg-blue-500'
                          : assignee.workload === 'OPTIMAL'
                          ? 'bg-green-500'
                          : assignee.workload === 'HIGH'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, assignee.capacity)}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-xs text-gray-600">
                    <span>{assignee.urgentCases} urgent</span>
                    <span>{assignee.highPriorityCases} high priority</span>
                    {assignee.atRiskCases > 0 && (
                      <span className="text-orange-600 font-medium">
                        {assignee.atRiskCases} at risk
                      </span>
                    )}
                    {assignee.breachedCases > 0 && (
                      <span className="text-red-600 font-medium">
                        {assignee.breachedCases} breached
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestion */}
          <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-lg border border-purple-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <LightningBoltIcon className="w-5 h-5 text-purple-600" />
              Load Optimization Suggestion
            </h2>
            <div className="bg-white rounded-lg border border-purple-200 p-4">
              <div className="flex items-start gap-3">
                <TargetIcon className="w-6 h-6 text-purple-600 flex-none mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">
                    For next urgent case, assign to:{' '}
                    <span className="text-purple-600">
                      {optimizationSuggestion.assignee}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {optimizationSuggestion.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${optimizationSuggestion.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {optimizationSuggestion.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* At-Risk and Breached Cases */}
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
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
                        ? 'border-red-200 bg-red-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              sla.status === 'BREACHED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {sla.status}
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            {c.caseNumber}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{c.type}</span>
                          {sla.shouldEscalate && (
                            <>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs font-medium text-red-600">
                                AUTO-ESCALATE
                              </span>
                            </>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <PersonIcon className="w-3 h-3" />
                            {c.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {sla.daysElapsed} / {sla.slaPolicy.targetResolutionDays} days
                          </span>
                          <span className={`font-medium ${
                            sla.status === 'BREACHED' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {sla.daysRemaining > 0
                              ? `${sla.daysRemaining}d remaining`
                              : `${Math.abs(sla.daysRemaining)}d overdue`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {Math.round(sla.percentElapsed)}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              sla.status === 'BREACHED'
                                ? 'bg-red-600'
                                : 'bg-orange-600'
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
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <InfoCircledIcon className="w-5 h-5 text-blue-600" />
              SLA Policy Reference
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50 border-b border-purple-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Case Type
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">
                      Target Days
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">
                      Warning at
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">
                      Escalate at
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {SLA_POLICIES.map(policy => (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        {policy.caseType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            policy.priority === 'URGENT'
                              ? 'bg-red-100 text-red-700'
                              : policy.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : policy.priority === 'MEDIUM'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {policy.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {policy.targetResolutionDays}d
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {policy.warningThresholdPercent}%
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {policy.escalationThresholdPercent}%
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
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
  );
}
