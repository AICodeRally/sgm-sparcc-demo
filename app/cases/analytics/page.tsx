'use client';

import { useMemo } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { CASE_ITEMS } from '@/lib/data/synthetic/cases.data';
import {
  generateHistoricalMetrics,
  generateVolumeForecast,
  predictBreaches,
  generatePerformanceBenchmarks,
  generateAlerts,
  detectBottlenecks,
  analyzeCapacity,
} from '@/lib/data/synthetic/case-analytics.data';
import {
  BarChartIcon,
  ExclamationTriangleIcon,
  RocketIcon,
  PersonIcon,
  BellIcon,
  UpdateIcon,
  ReaderIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

export default function CaseAnalyticsPage() {
  const historical = useMemo(() => generateHistoricalMetrics(), []);
  const forecast = useMemo(() => generateVolumeForecast(historical), [historical]);
  const breaches = useMemo(() => predictBreaches(CASE_ITEMS), []);
  const benchmarks = useMemo(() => generatePerformanceBenchmarks(CASE_ITEMS), []);
  const alerts = useMemo(() => generateAlerts(CASE_ITEMS), []);
  const bottlenecks = useMemo(() => detectBottlenecks(CASE_ITEMS), []);
  const capacity = useMemo(() => analyzeCapacity(CASE_ITEMS, forecast), [forecast]);

  // Get latest metrics
  const latestMetrics = historical[historical.length - 1];
  const weekAgoMetrics = historical[historical.length - 8];

  // Calculate trends
  const complianceTrend = latestMetrics.complianceRate - weekAgoMetrics.complianceRate;
  const resolutionTrend = latestMetrics.avgResolutionTime - weekAgoMetrics.avgResolutionTime;

  // Critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

  // High-probability breaches
  const highRiskBreaches = breaches.filter(b => b.breachProbability >= 70);

  return (
    <>
      <SetPageTitle
        title="Case Analytics Dashboard"
        description="AI predictions, trends, bottleneck detection, and capacity planning"
      />
      <div className="h-screen flex flex-col sparcc-hero-bg">

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">SLA Compliance</p>
                <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />
              </div>
              <p className="text-3xl font-bold text-[color:var(--color-success)]">{latestMetrics.complianceRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                {complianceTrend >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 text-[color:var(--color-success)]" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-[color:var(--color-error)]" />
                )}
                <span className={`text-xs ${complianceTrend >= 0 ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'}`}>
                  {Math.abs(complianceTrend).toFixed(1)}% vs last week
                </span>
              </div>
            </div>

            <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Avg Resolution Time</p>
                <UpdateIcon className="w-5 h-5 text-[color:var(--color-info)]" />
              </div>
              <p className="text-3xl font-bold text-[color:var(--color-info)]">{latestMetrics.avgResolutionTime.toFixed(1)}d</p>
              <div className="flex items-center gap-1 mt-2">
                {resolutionTrend <= 0 ? (
                  <ArrowDownIcon className="w-4 h-4 text-[color:var(--color-success)]" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4 text-[color:var(--color-error)]" />
                )}
                <span className={`text-xs ${resolutionTrend <= 0 ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'}`}>
                  {Math.abs(resolutionTrend).toFixed(1)}d vs last week
                </span>
              </div>
            </div>

            <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Critical Alerts</p>
                <BellIcon className="w-5 h-5 text-[color:var(--color-error)]" />
              </div>
              <p className="text-3xl font-bold text-[color:var(--color-error)]">{criticalAlerts.length}</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-2">Require immediate attention</p>
            </div>

            <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Team Capacity</p>
                <PersonIcon className="w-5 h-5 text-[color:var(--color-accent)]" />
              </div>
              <p className="text-3xl font-bold text-[color:var(--color-primary)]">{capacity.currentCapacity}%</p>
              <p className="text-xs text-[color:var(--color-muted)] mt-2">
                {capacity.currentTeamSize} of {capacity.optimalTeamSize} optimal
              </p>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="w-6 h-6 text-[color:var(--color-error)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Real-Time Alerts</h2>
              <span className="ml-auto text-sm text-[color:var(--color-muted)]">{alerts.length} total alerts</span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]'
                      : alert.severity === 'HIGH'
                      ? 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]'
                      : 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-info-border)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon
                      className={`w-5 h-5 flex-none mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'text-[color:var(--color-error)]'
                          : alert.severity === 'HIGH'
                          ? 'text-[color:var(--color-warning)]'
                          : alert.severity === 'MEDIUM'
                          ? 'text-[color:var(--color-warning)]'
                          : 'text-[color:var(--color-info)]'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                              : alert.severity === 'HIGH'
                              ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              : alert.severity === 'MEDIUM'
                              ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              : 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs text-[color:var(--color-muted)]">{alert.type.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="font-semibold text-[color:var(--color-foreground)] text-sm">{alert.title}</p>
                      <p className="text-sm text-[color:var(--color-muted)] mt-1">{alert.description}</p>
                      <p className="text-sm text-[color:var(--color-foreground)] mt-2 font-medium">
                        <span className="text-[color:var(--color-muted)]">Action:</span> {alert.actionRequired}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breach Predictions */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-[color:var(--color-warning)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">SLA Breach Predictions</h2>
              <span className="ml-auto text-sm text-[color:var(--color-muted)]">
                {highRiskBreaches.length} high-risk cases
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[color:var(--color-border)]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[color:var(--color-foreground)]">Case</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[color:var(--color-foreground)]">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[color:var(--color-foreground)]">Breach Risk</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[color:var(--color-foreground)]">Days Until</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[color:var(--color-foreground)]">Risk Factors</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[color:var(--color-foreground)]">Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {breaches.slice(0, 10).map(breach => (
                    <tr key={breach.caseId} className="border-b border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)]">
                      <td className="py-3 px-4">
                        <p className="font-medium text-[color:var(--color-foreground)] text-sm">{breach.caseNumber}</p>
                        <p className="text-xs text-[color:var(--color-muted)] truncate max-w-xs">{breach.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            breach.currentStatus === 'BREACHED'
                              ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                              : breach.currentStatus === 'AT_RISK'
                              ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              : 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                          }`}
                        >
                          {breach.currentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-[color:var(--color-border)] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                breach.breachProbability >= 70
                                  ? 'bg-transparent'
                                  : breach.breachProbability >= 40
                                  ? 'bg-[color:var(--color-warning)]'
                                  : 'bg-transparent'
                              }`}
                              style={{ width: `${breach.breachProbability}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                            {breach.breachProbability}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm font-medium ${
                            breach.daysUntilBreach <= 1
                              ? 'text-[color:var(--color-error)]'
                              : breach.daysUntilBreach <= 3
                              ? 'text-[color:var(--color-warning)]'
                              : 'text-[color:var(--color-foreground)]'
                          }`}
                        >
                          {breach.daysUntilBreach}d
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {breach.riskFactors.slice(0, 2).map((factor, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] rounded text-xs"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-[color:var(--color-foreground)]">{breach.recommendedAction}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Benchmarks */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="w-6 h-6 text-[color:var(--color-primary)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Performance Benchmarks</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {benchmarks.map(benchmark => (
                <div
                  key={benchmark.assigneeName}
                  className="border border-[color:var(--color-border)] rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-[color:var(--color-foreground)] mb-3">{benchmark.assigneeName}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--color-muted)]">Resolution Time</span>
                      <span className="font-medium text-[color:var(--color-foreground)]">
                        {benchmark.avgResolutionTime.toFixed(1)}d
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--color-muted)]">vs Team Avg</span>
                      <span
                        className={`font-medium ${
                          benchmark.vsTeamAverage < 0 ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'
                        }`}
                      >
                        {benchmark.vsTeamAverage > 0 ? '+' : ''}
                        {benchmark.vsTeamAverage.toFixed(1)}d
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--color-muted)]">SLA Compliance</span>
                      <span className="font-medium text-[color:var(--color-foreground)]">
                        {benchmark.slaComplianceRate}%
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        benchmark.quality === 'EXCELLENT'
                          ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                          : benchmark.quality === 'GOOD'
                          ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]'
                          : benchmark.quality === 'AVERAGE'
                          ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                          : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                      }`}
                    >
                      {benchmark.quality}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-[color:var(--color-success)]">
                      <span className="font-semibold">Strengths:</span> {benchmark.strengths.join(', ')}
                    </p>
                    {benchmark.opportunities.length > 0 && (
                      <p className="text-[color:var(--color-warning)]">
                        <span className="font-semibold">Growth:</span> {benchmark.opportunities.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottleneck Detection */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <UpdateIcon className="w-6 h-6 text-[color:var(--color-warning)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Bottleneck Detection</h2>
            </div>
            <div className="space-y-3">
              {bottlenecks.map((bottleneck, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    bottleneck.severity >= 70
                      ? 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]'
                      : bottleneck.severity >= 40
                      ? 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]'
                      : 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          bottleneck.severity >= 70
                            ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                            : bottleneck.severity >= 40
                            ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                            : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                        }`}
                      >
                        {bottleneck.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[color:var(--color-border)] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            bottleneck.severity >= 70
                              ? 'bg-transparent'
                              : bottleneck.severity >= 40
                              ? 'bg-[color:var(--color-warning)]'
                              : 'bg-transparent'
                          }`}
                          style={{ width: `${bottleneck.severity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[color:var(--color-foreground)]">{bottleneck.severity}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-[color:var(--color-foreground)] mb-2">{bottleneck.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[color:var(--color-muted)]">Impact:</span>{' '}
                      <span className="font-medium text-[color:var(--color-foreground)]">{bottleneck.impact}</span>
                    </div>
                    <div>
                      <span className="text-[color:var(--color-muted)]">Est. Delay:</span>{' '}
                      <span className="font-medium text-[color:var(--color-foreground)]">{bottleneck.estimatedDelay}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[color:var(--color-foreground)] mt-2">
                    <span className="font-semibold">Recommendation:</span> {bottleneck.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity Planning */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <RocketIcon className="w-6 h-6 text-[color:var(--color-primary)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Capacity Planning</h2>
            </div>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="border border-[color:var(--color-border)] rounded-lg p-4">
                <p className="text-sm text-[color:var(--color-muted)] mb-1">Current Team</p>
                <p className="text-2xl font-bold text-[color:var(--color-foreground)]">{capacity.currentTeamSize}</p>
              </div>
              <div className="border border-[color:var(--color-border)] rounded-lg p-4">
                <p className="text-sm text-[color:var(--color-muted)] mb-1">Optimal Team</p>
                <p className="text-2xl font-bold text-[color:var(--color-primary)]">{capacity.optimalTeamSize}</p>
              </div>
              <div className="border border-[color:var(--color-border)] rounded-lg p-4">
                <p className="text-sm text-[color:var(--color-muted)] mb-1">Current Capacity</p>
                <p className="text-2xl font-bold text-[color:var(--color-info)]">{capacity.currentCapacity}%</p>
              </div>
              <div className="border border-[color:var(--color-border)] rounded-lg p-4">
                <p className="text-sm text-[color:var(--color-muted)] mb-1">Workload Trend</p>
                <p
                  className={`text-2xl font-bold ${
                    capacity.workloadTrend === 'INCREASING'
                      ? 'text-[color:var(--color-error)]'
                      : capacity.workloadTrend === 'DECREASING'
                      ? 'text-[color:var(--color-success)]'
                      : 'text-[color:var(--color-muted)]'
                  }`}
                >
                  {capacity.workloadTrend}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-[color:var(--color-border)] rounded-lg p-4">
                <p className="text-sm font-semibold text-[color:var(--color-foreground)] mb-2">7-Day Forecast</p>
                <p className="text-lg font-medium text-[color:var(--color-foreground)] mb-1">
                  {Math.round(capacity.forecastedCapacity7d)}% capacity
                </p>
                <p className="text-sm text-[color:var(--color-muted)]">
                  {forecast.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0)} cases expected
                </p>
              </div>
              <div className="border border-[color:var(--color-border)] rounded-lg p-4">
                <p className="text-sm font-semibold text-[color:var(--color-foreground)] mb-2">30-Day Forecast</p>
                <p className="text-lg font-medium text-[color:var(--color-foreground)] mb-1">
                  {Math.round(capacity.forecastedCapacity30d)}% capacity
                </p>
                <p className="text-sm text-[color:var(--color-muted)]">
                  {forecast.reduce((sum, f) => sum + f.predicted, 0)} cases expected
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded-lg">
              <p className="text-sm font-semibold text-[color:var(--color-accent)] mb-1">Recommendation</p>
              <p className="text-sm text-[color:var(--color-accent)]">{capacity.recommendation}</p>
            </div>
          </div>

          {/* Historical Trends Chart (Simple visualization) */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-6 h-6 text-[color:var(--color-info)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">90-Day Historical Trends</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[color:var(--color-foreground)]">SLA Compliance Rate</p>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    Latest: {latestMetrics.complianceRate}%
                  </p>
                </div>
                <div className="h-2 bg-[color:var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-[color:var(--color-success)] rounded-full"
                    style={{ width: `${latestMetrics.complianceRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[color:var(--color-foreground)]">Active Cases Trend</p>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    Current: {latestMetrics.activeCases} cases
                  </p>
                </div>
                <div className="flex items-end gap-1 h-24">
                  {historical.slice(-30).map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-[color:var(--color-surface-alt)]0 rounded-t"
                      style={{
                        height: `${(metric.activeCases / 50) * 100}%`,
                        minHeight: '2px',
                      }}
                      title={`${metric.date}: ${metric.activeCases} cases`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[color:var(--color-border)]">
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Avg New Cases/Day</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {(
                      historical.slice(-30).reduce((sum, m) => sum + m.newCases, 0) / 30
                    ).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Avg Resolved/Day</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {(
                      historical.slice(-30).reduce((sum, m) => sum + m.resolvedCases, 0) / 30
                    ).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Avg Resolution Time</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {latestMetrics.avgResolutionTime.toFixed(1)}d
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Forecast */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ReaderIcon className="w-6 h-6 text-[color:var(--color-success)]" />
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">30-Day Volume Forecast</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-end gap-1 h-32">
                {forecast.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div
                      className="w-full bg-[color:var(--color-success-bg)] rounded-t"
                      style={{
                        height: `${(day.upper / 60) * 100}%`,
                        minHeight: '2px',
                      }}
                      title={`Upper: ${day.upper}`}
                    />
                    <div
                      className="w-full bg-transparent rounded"
                      style={{
                        height: `${(day.predicted / 60) * 100}%`,
                        minHeight: '4px',
                      }}
                      title={`${day.date}: ${day.predicted} cases (${day.confidence}% confidence)`}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[color:var(--color-border)]">
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Predicted Next Week</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {forecast.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0)} cases
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Predicted Next Month</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {forecast.reduce((sum, f) => sum + f.predicted, 0)} cases
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Avg Confidence</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {(forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--color-muted)]">Trend</p>
                  <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {capacity.workloadTrend}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
