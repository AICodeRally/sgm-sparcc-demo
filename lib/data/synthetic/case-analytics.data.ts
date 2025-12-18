/**
 * Case Analytics - Historical Trends, Predictions, and Intelligence
 * SPARCC Sales Governance Manager
 */

import { CaseItem } from './cases.data';
import { calculateCaseSLA, calculateAssigneeLoad, SLAPolicy } from './case-sla-config.data';

/**
 * Historical SLA Metrics (last 90 days)
 */
export interface HistoricalMetrics {
  date: string;
  totalCases: number;
  newCases: number;
  resolvedCases: number;
  activeCases: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  complianceRate: number;
  avgResolutionTime: number;
}

/**
 * Case Volume Forecast
 */
export interface VolumeForcast {
  date: string;
  predicted: number;
  lower: number; // Lower bound (confidence interval)
  upper: number; // Upper bound
  confidence: number; // 0-100%
}

/**
 * SLA Breach Prediction
 */
export interface BreachPrediction {
  caseId: string;
  caseNumber: string;
  title: string;
  currentStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  predictedBreachDate: string;
  daysUntilBreach: number;
  breachProbability: number; // 0-100%
  riskFactors: string[];
  recommendedAction: string;
}

/**
 * Performance Benchmark
 */
export interface PerformanceBenchmark {
  assigneeName: string;
  avgResolutionTime: number;
  vsTeamAverage: number; // Percentage difference
  slaComplianceRate: number;
  caseVolume: number;
  quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
  strengths: string[];
  opportunities: string[];
}

/**
 * Real-Time Alert
 */
export interface Alert {
  id: string;
  type: 'SLA_BREACH' | 'LOAD_IMBALANCE' | 'PERFORMANCE_DROP' | 'ANOMALY' | 'CAPACITY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: string;
  affectedCases?: string[];
  affectedAssignees?: string[];
}

/**
 * Bottleneck Detection
 */
export interface Bottleneck {
  type: 'ASSIGNEE_OVERLOAD' | 'CASE_TYPE_BACKLOG' | 'ESCALATION_DELAY' | 'COMMITTEE_DELAY';
  location: string;
  severity: number; // 0-100
  description: string;
  impact: string;
  recommendation: string;
  estimatedDelay: number; // Days
}

/**
 * Team Capacity Analysis
 */
export interface CapacityAnalysis {
  currentCapacity: number; // % (0-100)
  optimalTeamSize: number;
  currentTeamSize: number;
  workloadTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  forecastedCapacity7d: number;
  forecastedCapacity30d: number;
  recommendation: string;
}

/**
 * Generate Historical Metrics (90 days)
 */
export function generateHistoricalMetrics(): HistoricalMetrics[] {
  const metrics: HistoricalMetrics[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulate realistic patterns with weekly seasonality
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weeklyMultiplier = isWeekend ? 0.3 : 1.0;

    // Add monthly trend (slight increase)
    const monthProgress = i / 90;
    const trendMultiplier = 1 + (monthProgress * 0.2);

    // Base volumes
    const baseNewCases = Math.floor(weeklyMultiplier * trendMultiplier * (3 + Math.random() * 2));
    const baseResolvedCases = Math.floor(weeklyMultiplier * (2 + Math.random() * 2));

    const totalCases = 15 + Math.floor(Math.random() * 5);
    const activeCases = totalCases - baseResolvedCases;
    const onTrack = Math.floor(activeCases * (0.65 + Math.random() * 0.1));
    const atRisk = Math.floor(activeCases * (0.2 + Math.random() * 0.1));
    const breached = Math.max(0, activeCases - onTrack - atRisk);
    const complianceRate = Math.round(((onTrack / activeCases) * 100) * 10) / 10;
    const avgResolutionTime = 5 + Math.random() * 3;

    metrics.push({
      date: date.toISOString().split('T')[0],
      totalCases,
      newCases: baseNewCases,
      resolvedCases: baseResolvedCases,
      activeCases,
      onTrack,
      atRisk,
      breached,
      complianceRate,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    });
  }

  return metrics;
}

/**
 * Generate Volume Forecast (next 30 days)
 */
export function generateVolumeForecast(historicalMetrics: HistoricalMetrics[]): VolumeForcast[] {
  const forecast: VolumeForcast[] = [];

  // Calculate trend from historical data
  const recentAvg = historicalMetrics.slice(-14).reduce((sum, m) => sum + m.newCases, 0) / 14;
  const trend = recentAvg / (historicalMetrics.slice(-28, -14).reduce((sum, m) => sum + m.newCases, 0) / 14);

  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weeklyMultiplier = isWeekend ? 0.3 : 1.0;

    const predicted = Math.floor(recentAvg * trend * weeklyMultiplier * (1 + (Math.random() - 0.5) * 0.1));
    const variance = predicted * 0.25;

    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted,
      lower: Math.max(0, Math.floor(predicted - variance)),
      upper: Math.ceil(predicted + variance),
      confidence: 75 + Math.floor(Math.random() * 15),
    });
  }

  return forecast;
}

/**
 * Predict SLA Breaches (next 7 days)
 */
export function predictBreaches(cases: CaseItem[]): BreachPrediction[] {
  const predictions: BreachPrediction[] = [];

  const activeCases = cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');

  activeCases.forEach(c => {
    try {
      const sla = calculateCaseSLA(c);

      // Only predict for at-risk cases
      if (sla.status === 'AT_RISK' && sla.daysRemaining > 0 && sla.daysRemaining <= 7) {
        const riskFactors: string[] = [];
        let breachProbability = 50;

        // Factor 1: How close to deadline
        if (sla.percentElapsed >= 90) {
          breachProbability += 30;
          riskFactors.push('Very close to SLA deadline');
        } else if (sla.percentElapsed >= 80) {
          breachProbability += 20;
          riskFactors.push('Approaching SLA deadline');
        }

        // Factor 2: Priority
        if (c.priority === 'URGENT') {
          breachProbability += 10;
          riskFactors.push('Urgent priority case');
        }

        // Factor 3: Status
        if (c.status === 'PENDING_INFO') {
          breachProbability += 15;
          riskFactors.push('Waiting for information');
        } else if (c.status === 'ESCALATED') {
          breachProbability += 10;
          riskFactors.push('Escalated - requires committee decision');
        }

        // Factor 4: Complexity (financial impact)
        if (c.financialImpact && c.financialImpact > 100000) {
          breachProbability += 5;
          riskFactors.push('High financial impact - complex case');
        }

        breachProbability = Math.min(95, breachProbability);

        const predictedBreachDate = new Date();
        predictedBreachDate.setDate(predictedBreachDate.getDate() + sla.daysRemaining);

        let recommendedAction = '';
        if (breachProbability >= 80) {
          recommendedAction = 'URGENT: Escalate immediately to prevent SLA breach';
        } else if (breachProbability >= 65) {
          recommendedAction = 'Prioritize this case and provide daily status updates';
        } else {
          recommendedAction = 'Monitor closely and ensure no blockers';
        }

        predictions.push({
          caseId: c.id,
          caseNumber: c.caseNumber,
          title: c.title,
          currentStatus: sla.status,
          predictedBreachDate: predictedBreachDate.toISOString(),
          daysUntilBreach: sla.daysRemaining,
          breachProbability,
          riskFactors,
          recommendedAction,
        });
      }
    } catch (error) {
      // Skip cases without SLA policy
    }
  });

  return predictions.sort((a, b) => b.breachProbability - a.breachProbability);
}

/**
 * Generate Performance Benchmarks
 */
export function generatePerformanceBenchmarks(cases: CaseItem[]): PerformanceBenchmark[] {
  const assignees = [...new Set(cases.map(c => c.assignedTo).filter(Boolean))];

  // Calculate team averages
  const allResolvedCases = cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
  const teamAvgResolutionTime = allResolvedCases.length > 0
    ? allResolvedCases.reduce((sum, c) => sum + c.businessDaysElapsed, 0) / allResolvedCases.length
    : 7;

  const benchmarks: PerformanceBenchmark[] = assignees.map(assignee => {
    const assigneeCases = cases.filter(c => c.assignedTo === assignee);
    const resolvedCases = assigneeCases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
    const activeCases = assigneeCases.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');

    const avgResolutionTime = resolvedCases.length > 0
      ? resolvedCases.reduce((sum, c) => sum + c.businessDaysElapsed, 0) / resolvedCases.length
      : teamAvgResolutionTime;

    const vsTeamAverage = ((teamAvgResolutionTime - avgResolutionTime) / teamAvgResolutionTime) * 100;

    // Calculate SLA compliance
    let slaCompliant = 0;
    activeCases.forEach(c => {
      try {
        const sla = calculateCaseSLA(c);
        if (sla.status === 'ON_TRACK') slaCompliant++;
      } catch (error) {
        // Skip cases without SLA
      }
    });

    const slaComplianceRate = activeCases.length > 0
      ? (slaCompliant / activeCases.length) * 100
      : 100;

    // Determine quality
    let quality: PerformanceBenchmark['quality'];
    if (vsTeamAverage > 15 && slaComplianceRate >= 90) {
      quality = 'EXCELLENT';
    } else if (vsTeamAverage > 0 && slaComplianceRate >= 80) {
      quality = 'GOOD';
    } else if (vsTeamAverage > -10 && slaComplianceRate >= 70) {
      quality = 'AVERAGE';
    } else {
      quality = 'NEEDS_IMPROVEMENT';
    }

    // Identify strengths and opportunities
    const strengths: string[] = [];
    const opportunities: string[] = [];

    if (avgResolutionTime < teamAvgResolutionTime) {
      strengths.push(`${Math.abs(Math.round(vsTeamAverage))}% faster than team average`);
    }
    if (slaComplianceRate >= 90) {
      strengths.push('Excellent SLA compliance');
    }
    if (resolvedCases.length > 10) {
      strengths.push('High case volume handling');
    }

    if (avgResolutionTime > teamAvgResolutionTime * 1.2) {
      opportunities.push('Improve resolution time efficiency');
    }
    if (slaComplianceRate < 80) {
      opportunities.push('Focus on SLA compliance');
    }

    if (strengths.length === 0) {
      strengths.push('Consistent performance');
    }
    if (opportunities.length === 0) {
      opportunities.push('Maintain current performance level');
    }

    return {
      assigneeName: assignee!,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      vsTeamAverage: Math.round(vsTeamAverage * 10) / 10,
      slaComplianceRate: Math.round(slaComplianceRate * 10) / 10,
      caseVolume: assigneeCases.length,
      quality,
      strengths,
      opportunities,
    };
  });

  return benchmarks.sort((a, b) => b.vsTeamAverage - a.vsTeamAverage);
}

/**
 * Generate Real-Time Alerts
 */
export function generateAlerts(cases: CaseItem[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  // 1. SLA Breach Alerts (breached cases)
  const breachedCases = cases.filter(c => {
    if (c.status === 'RESOLVED' || c.status === 'CLOSED') return false;
    try {
      const sla = calculateCaseSLA(c);
      return sla.status === 'BREACHED';
    } catch {
      return false;
    }
  });

  if (breachedCases.length > 0) {
    alerts.push({
      id: `alert-breach-${Date.now()}`,
      type: 'SLA_BREACH',
      severity: 'CRITICAL',
      title: `${breachedCases.length} Case${breachedCases.length > 1 ? 's' : ''} Past SLA Deadline`,
      description: `${breachedCases.length} case(s) have exceeded their SLA resolution deadline and require immediate attention.`,
      timestamp: now.toISOString(),
      actionRequired: 'Review breached cases and escalate to management',
      affectedCases: breachedCases.map(c => c.caseNumber),
    });
  }

  // 2. Load Imbalance Alerts
  const assignees = [...new Set(cases.map(c => c.assignedTo).filter(Boolean))];
  const loads = assignees.map(a => calculateAssigneeLoad(cases, a!));
  const overloaded = loads.filter(l => l.workload === 'OVER');
  const underloaded = loads.filter(l => l.workload === 'UNDER');

  if (overloaded.length > 0 && underloaded.length > 0) {
    alerts.push({
      id: `alert-imbalance-${Date.now()}`,
      type: 'LOAD_IMBALANCE',
      severity: 'HIGH',
      title: 'Workload Imbalance Detected',
      description: `${overloaded.length} assignee(s) overloaded while ${underloaded.length} assignee(s) have capacity. Redistribute cases to balance workload.`,
      timestamp: now.toISOString(),
      actionRequired: 'Redistribute cases from overloaded to available assignees',
      affectedAssignees: [...overloaded.map(l => l.assigneeName), ...underloaded.map(l => l.assigneeName)],
    });
  }

  // 3. Upcoming Breach Warnings (next 24 hours)
  const predictions = predictBreaches(cases);
  const critical24h = predictions.filter(p => p.daysUntilBreach <= 1 && p.breachProbability >= 70);

  if (critical24h.length > 0) {
    alerts.push({
      id: `alert-24h-${Date.now()}`,
      type: 'SLA_BREACH',
      severity: 'HIGH',
      title: `${critical24h.length} Case${critical24h.length > 1 ? 's' : ''} At Risk Within 24 Hours`,
      description: `${critical24h.length} case(s) predicted to breach SLA within 24 hours with ${Math.round(critical24h[0].breachProbability)}%+ probability.`,
      timestamp: now.toISOString(),
      actionRequired: 'Prioritize at-risk cases immediately',
      affectedCases: critical24h.map(p => p.caseNumber),
    });
  }

  // 4. Capacity Alerts
  const avgCapacity = loads.reduce((sum, l) => sum + l.capacity, 0) / loads.length;
  if (avgCapacity > 85) {
    alerts.push({
      id: `alert-capacity-${Date.now()}`,
      type: 'CAPACITY',
      severity: 'MEDIUM',
      title: 'Team Capacity High',
      description: `Team is operating at ${Math.round(avgCapacity)}% capacity. Consider additional resources or prioritizing critical cases only.`,
      timestamp: now.toISOString(),
      actionRequired: 'Review upcoming case volume and plan for additional capacity',
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Detect Bottlenecks
 */
export function detectBottlenecks(cases: CaseItem[]): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  // 1. Assignee Overload
  const assignees = [...new Set(cases.map(c => c.assignedTo).filter(Boolean))];
  const loads = assignees.map(a => calculateAssigneeLoad(cases, a!));
  const overloaded = loads.filter(l => l.capacity > 90);

  overloaded.forEach(load => {
    bottlenecks.push({
      type: 'ASSIGNEE_OVERLOAD',
      location: load.assigneeName,
      severity: load.capacity,
      description: `${load.assigneeName} is at ${load.capacity}% capacity with ${load.activeCases} active cases`,
      impact: `Cases may be delayed by ${Math.ceil((load.capacity - 80) / 10)} days`,
      recommendation: `Redistribute ${Math.ceil(load.activeCases * 0.3)} cases to other team members`,
      estimatedDelay: Math.ceil((load.capacity - 80) / 10),
    });
  });

  // 2. Case Type Backlog
  const caseTypes = ['DISPUTE', 'EXCEPTION', 'TERRITORY_CHANGE', 'PLAN_MODIFICATION', 'QUOTA_ADJUSTMENT'] as const;
  caseTypes.forEach(type => {
    const typeCases = cases.filter(c => c.type === type && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
    if (typeCases.length > 5) {
      bottlenecks.push({
        type: 'CASE_TYPE_BACKLOG',
        location: type.replace(/_/g, ' '),
        severity: Math.min(100, typeCases.length * 10),
        description: `${typeCases.length} active ${type.replace(/_/g, ' ').toLowerCase()} cases in backlog`,
        impact: 'May affect overall SLA compliance',
        recommendation: 'Assign additional resources to this case type',
        estimatedDelay: Math.ceil(typeCases.length / 3),
      });
    }
  });

  // 3. Committee Delays
  const escalatedCases = cases.filter(c => c.status === 'ESCALATED');
  if (escalatedCases.length > 3) {
    bottlenecks.push({
      type: 'COMMITTEE_DELAY',
      location: 'SGCC/CRB',
      severity: Math.min(100, escalatedCases.length * 15),
      description: `${escalatedCases.length} cases awaiting committee decision`,
      impact: 'Escalated cases may breach SLA while awaiting committee',
      recommendation: 'Schedule emergency committee meeting or delegate authority',
      estimatedDelay: 5,
    });
  }

  return bottlenecks.sort((a, b) => b.severity - a.severity);
}

/**
 * Analyze Team Capacity
 */
export function analyzeCapacity(cases: CaseItem[], forecast: VolumeForcast[]): CapacityAnalysis {
  const assignees = [...new Set(cases.map(c => c.assignedTo).filter(Boolean))];
  const loads = assignees.map(a => calculateAssigneeLoad(cases, a!));

  const currentCapacity = loads.reduce((sum, l) => sum + l.capacity, 0) / loads.length;
  const currentTeamSize = assignees.length;

  // Calculate workload trend
  const recentCases = cases.filter(c => {
    const daysAgo = Math.floor((Date.now() - new Date(c.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo <= 14;
  });
  const olderCases = cases.filter(c => {
    const daysAgo = Math.floor((Date.now() - new Date(c.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo > 14 && daysAgo <= 28;
  });

  const recentAvg = recentCases.length / 14;
  const olderAvg = olderCases.length / 14;
  const trend = recentAvg / (olderAvg || 1);

  let workloadTrend: CapacityAnalysis['workloadTrend'];
  if (trend > 1.15) workloadTrend = 'INCREASING';
  else if (trend < 0.85) workloadTrend = 'DECREASING';
  else workloadTrend = 'STABLE';

  // Forecast capacity needs
  const next7dVolume = forecast.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0);
  const next30dVolume = forecast.reduce((sum, f) => sum + f.predicted, 0);

  const currentWeeklyCapacity = currentTeamSize * 7; // Assume each person can handle ~1 case/day
  const forecastedCapacity7d = (next7dVolume / currentWeeklyCapacity) * 100;
  const forecastedCapacity30d = (next30dVolume / (currentTeamSize * 30)) * 100;

  // Optimal team size
  const optimalTeamSize = Math.ceil(forecastedCapacity30d > 85 ? currentTeamSize * 1.2 : currentTeamSize);

  let recommendation = '';
  if (forecastedCapacity30d > 90) {
    recommendation = `Consider adding ${optimalTeamSize - currentTeamSize} team member(s) - forecasted demand will exceed capacity`;
  } else if (forecastedCapacity30d < 60) {
    recommendation = 'Current team size is adequate - consider reassigning resources to other priorities';
  } else {
    recommendation = 'Current team size is optimal for forecasted demand';
  }

  return {
    currentCapacity: Math.round(currentCapacity),
    optimalTeamSize,
    currentTeamSize,
    workloadTrend,
    forecastedCapacity7d: Math.round(forecastedCapacity7d),
    forecastedCapacity30d: Math.round(forecastedCapacity30d),
    recommendation,
  };
}
