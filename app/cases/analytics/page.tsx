'use client';

import { useMemo } from 'react';
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <BarChartIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                Case Analytics & Intelligence
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive metrics, trends, predictions, and optimization insights
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <CheckCircledIcon className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{latestMetrics.complianceRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                {complianceTrend >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${complianceTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(complianceTrend).toFixed(1)}% vs last week
                </span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <UpdateIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{latestMetrics.avgResolutionTime.toFixed(1)}d</p>
              <div className="flex items-center gap-1 mt-2">
                {resolutionTrend <= 0 ? (
                  <ArrowDownIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${resolutionTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(resolutionTrend).toFixed(1)}d vs last week
                </span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <BellIcon className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{criticalAlerts.length}</p>
              <p className="text-xs text-gray-500 mt-2">Require immediate attention</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Team Capacity</p>
                <PersonIcon className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{capacity.currentCapacity}%</p>
              <p className="text-xs text-gray-500 mt-2">
                {capacity.currentTeamSize} of {capacity.optimalTeamSize} optimal
              </p>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Real-Time Alerts</h2>
              <span className="ml-auto text-sm text-gray-500">{alerts.length} total alerts</span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-50 border-red-200'
                      : alert.severity === 'HIGH'
                      ? 'bg-orange-50 border-orange-200'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon
                      className={`w-5 h-5 flex-none mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'text-red-600'
                          : alert.severity === 'HIGH'
                          ? 'text-orange-600'
                          : alert.severity === 'MEDIUM'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : alert.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">{alert.type.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <p className="text-sm text-gray-700 mt-2 font-medium">
                        <span className="text-gray-500">Action:</span> {alert.actionRequired}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breach Predictions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">SLA Breach Predictions</h2>
              <span className="ml-auto text-sm text-gray-500">
                {highRiskBreaches.length} high-risk cases
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Case</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Breach Risk</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Days Until</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Risk Factors</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {breaches.slice(0, 10).map(breach => (
                    <tr key={breach.caseId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 text-sm">{breach.caseNumber}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{breach.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            breach.currentStatus === 'BREACHED'
                              ? 'bg-red-100 text-red-700'
                              : breach.currentStatus === 'AT_RISK'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {breach.currentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                breach.breachProbability >= 70
                                  ? 'bg-red-500'
                                  : breach.breachProbability >= 40
                                  ? 'bg-orange-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${breach.breachProbability}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {breach.breachProbability}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm font-medium ${
                            breach.daysUntilBreach <= 1
                              ? 'text-red-600'
                              : breach.daysUntilBreach <= 3
                              ? 'text-orange-600'
                              : 'text-gray-700'
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
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">{breach.recommendedAction}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Benchmarks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Performance Benchmarks</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {benchmarks.map(benchmark => (
                <div
                  key={benchmark.assigneeName}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-gray-900 mb-3">{benchmark.assigneeName}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Resolution Time</span>
                      <span className="font-medium text-gray-900">
                        {benchmark.avgResolutionTime.toFixed(1)}d
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">vs Team Avg</span>
                      <span
                        className={`font-medium ${
                          benchmark.vsTeamAverage < 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {benchmark.vsTeamAverage > 0 ? '+' : ''}
                        {benchmark.vsTeamAverage.toFixed(1)}d
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SLA Compliance</span>
                      <span className="font-medium text-gray-900">
                        {benchmark.slaComplianceRate}%
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        benchmark.quality === 'EXCELLENT'
                          ? 'bg-green-100 text-green-700'
                          : benchmark.quality === 'GOOD'
                          ? 'bg-blue-100 text-blue-700'
                          : benchmark.quality === 'AVERAGE'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {benchmark.quality}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-green-700">
                      <span className="font-semibold">Strengths:</span> {benchmark.strengths.join(', ')}
                    </p>
                    {benchmark.opportunities.length > 0 && (
                      <p className="text-orange-700">
                        <span className="font-semibold">Growth:</span> {benchmark.opportunities.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottleneck Detection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <UpdateIcon className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Bottleneck Detection</h2>
            </div>
            <div className="space-y-3">
              {bottlenecks.map((bottleneck, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    bottleneck.severity >= 70
                      ? 'bg-red-50 border-red-200'
                      : bottleneck.severity >= 40
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          bottleneck.severity >= 70
                            ? 'bg-red-100 text-red-700'
                            : bottleneck.severity >= 40
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {bottleneck.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            bottleneck.severity >= 70
                              ? 'bg-red-500'
                              : bottleneck.severity >= 40
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${bottleneck.severity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{bottleneck.severity}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{bottleneck.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Impact:</span>{' '}
                      <span className="font-medium text-gray-900">{bottleneck.impact}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. Delay:</span>{' '}
                      <span className="font-medium text-gray-900">{bottleneck.estimatedDelay}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">Recommendation:</span> {bottleneck.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity Planning */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <RocketIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Capacity Planning</h2>
            </div>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Current Team</p>
                <p className="text-2xl font-bold text-gray-900">{capacity.currentTeamSize}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Optimal Team</p>
                <p className="text-2xl font-bold text-purple-600">{capacity.optimalTeamSize}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Current Capacity</p>
                <p className="text-2xl font-bold text-blue-600">{capacity.currentCapacity}%</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Workload Trend</p>
                <p
                  className={`text-2xl font-bold ${
                    capacity.workloadTrend === 'INCREASING'
                      ? 'text-red-600'
                      : capacity.workloadTrend === 'DECREASING'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {capacity.workloadTrend}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">7-Day Forecast</p>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {Math.round(capacity.forecastedCapacity7d)}% capacity
                </p>
                <p className="text-sm text-gray-600">
                  {forecast.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0)} cases expected
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">30-Day Forecast</p>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {Math.round(capacity.forecastedCapacity30d)}% capacity
                </p>
                <p className="text-sm text-gray-600">
                  {forecast.reduce((sum, f) => sum + f.predicted, 0)} cases expected
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-semibold text-purple-900 mb-1">Recommendation</p>
              <p className="text-sm text-purple-800">{capacity.recommendation}</p>
            </div>
          </div>

          {/* Historical Trends Chart (Simple visualization) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">90-Day Historical Trends</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">SLA Compliance Rate</p>
                  <p className="text-sm text-gray-600">
                    Latest: {latestMetrics.complianceRate}%
                  </p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    style={{ width: `${latestMetrics.complianceRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Active Cases Trend</p>
                  <p className="text-sm text-gray-600">
                    Current: {latestMetrics.activeCases} cases
                  </p>
                </div>
                <div className="flex items-end gap-1 h-24">
                  {historical.slice(-30).map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{
                        height: `${(metric.activeCases / 50) * 100}%`,
                        minHeight: '2px',
                      }}
                      title={`${metric.date}: ${metric.activeCases} cases`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Avg New Cases/Day</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(
                      historical.slice(-30).reduce((sum, m) => sum + m.newCases, 0) / 30
                    ).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Resolved/Day</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(
                      historical.slice(-30).reduce((sum, m) => sum + m.resolvedCases, 0) / 30
                    ).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Resolution Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {latestMetrics.avgResolutionTime.toFixed(1)}d
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Forecast */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ReaderIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">30-Day Volume Forecast</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-end gap-1 h-32">
                {forecast.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div
                      className="w-full bg-green-200 rounded-t"
                      style={{
                        height: `${(day.upper / 60) * 100}%`,
                        minHeight: '2px',
                      }}
                      title={`Upper: ${day.upper}`}
                    />
                    <div
                      className="w-full bg-green-500 rounded"
                      style={{
                        height: `${(day.predicted / 60) * 100}%`,
                        minHeight: '4px',
                      }}
                      title={`${day.date}: ${day.predicted} cases (${day.confidence}% confidence)`}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Predicted Next Week</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {forecast.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0)} cases
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Predicted Next Month</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {forecast.reduce((sum, f) => sum + f.predicted, 0)} cases
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Confidence</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trend</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {capacity.workloadTrend}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
