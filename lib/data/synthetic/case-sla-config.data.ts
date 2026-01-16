/**
 * Case SLA Configuration and Load Optimization
 * SPARCC Sales Governance Manager
 */

import { CaseItem } from './cases.data';

// Re-export CaseItem type for pages that import SLA functions
export type { CaseItem };

/**
 * SLA Policy Configuration
 * Defines expected resolution times by case type and priority
 */
export interface SLAPolicy {
  id: string;
  caseType: CaseItem['type'];
  priority: CaseItem['priority'];
  targetResolutionDays: number; // Business days
  warningThresholdPercent: number; // % of time elapsed before warning (e.g., 75%)
  escalationThresholdPercent: number; // % of time elapsed before auto-escalation (e.g., 90%)
  description: string;
}

/**
 * SLA Policies by Case Type and Priority
 */
export const SLA_POLICIES: SLAPolicy[] = [
  // DISPUTE cases
  {
    id: 'sla-dispute-urgent',
    caseType: 'DISPUTE',
    priority: 'URGENT',
    targetResolutionDays: 3,
    warningThresholdPercent: 66,
    escalationThresholdPercent: 90,
    description: 'Urgent compensation disputes must be resolved within 3 business days',
  },
  {
    id: 'sla-dispute-high',
    caseType: 'DISPUTE',
    priority: 'HIGH',
    targetResolutionDays: 5,
    warningThresholdPercent: 70,
    escalationThresholdPercent: 90,
    description: 'High-priority disputes resolved within 5 business days',
  },
  {
    id: 'sla-dispute-medium',
    caseType: 'DISPUTE',
    priority: 'MEDIUM',
    targetResolutionDays: 10,
    warningThresholdPercent: 75,
    escalationThresholdPercent: 90,
    description: 'Standard disputes resolved within 10 business days',
  },
  {
    id: 'sla-dispute-low',
    caseType: 'DISPUTE',
    priority: 'LOW',
    targetResolutionDays: 15,
    warningThresholdPercent: 80,
    escalationThresholdPercent: 95,
    description: 'Low-priority disputes resolved within 15 business days',
  },

  // EXCEPTION cases
  {
    id: 'sla-exception-urgent',
    caseType: 'EXCEPTION',
    priority: 'URGENT',
    targetResolutionDays: 2,
    warningThresholdPercent: 50,
    escalationThresholdPercent: 80,
    description: 'Urgent exceptions (deal at risk) resolved within 2 business days',
  },
  {
    id: 'sla-exception-high',
    caseType: 'EXCEPTION',
    priority: 'HIGH',
    targetResolutionDays: 5,
    warningThresholdPercent: 70,
    escalationThresholdPercent: 90,
    description: 'High-value exceptions resolved within 5 business days',
  },
  {
    id: 'sla-exception-medium',
    caseType: 'EXCEPTION',
    priority: 'MEDIUM',
    targetResolutionDays: 7,
    warningThresholdPercent: 75,
    escalationThresholdPercent: 90,
    description: 'Standard exceptions resolved within 7 business days',
  },
  {
    id: 'sla-exception-low',
    caseType: 'EXCEPTION',
    priority: 'LOW',
    targetResolutionDays: 10,
    warningThresholdPercent: 80,
    escalationThresholdPercent: 95,
    description: 'Minor exceptions resolved within 10 business days',
  },

  // TERRITORY_CHANGE cases
  {
    id: 'sla-territory-urgent',
    caseType: 'TERRITORY_CHANGE',
    priority: 'URGENT',
    targetResolutionDays: 5,
    warningThresholdPercent: 70,
    escalationThresholdPercent: 90,
    description: 'Urgent territory changes (mid-quarter) resolved within 5 business days',
  },
  {
    id: 'sla-territory-high',
    caseType: 'TERRITORY_CHANGE',
    priority: 'HIGH',
    targetResolutionDays: 10,
    warningThresholdPercent: 75,
    escalationThresholdPercent: 90,
    description: 'High-priority territory changes resolved within 10 business days',
  },
  {
    id: 'sla-territory-medium',
    caseType: 'TERRITORY_CHANGE',
    priority: 'MEDIUM',
    targetResolutionDays: 15,
    warningThresholdPercent: 80,
    escalationThresholdPercent: 95,
    description: 'Standard territory changes resolved within 15 business days',
  },
  {
    id: 'sla-territory-low',
    caseType: 'TERRITORY_CHANGE',
    priority: 'LOW',
    targetResolutionDays: 20,
    warningThresholdPercent: 85,
    escalationThresholdPercent: 95,
    description: 'Minor territory adjustments resolved within 20 business days',
  },

  // PLAN_MODIFICATION cases
  {
    id: 'sla-plan-urgent',
    caseType: 'PLAN_MODIFICATION',
    priority: 'URGENT',
    targetResolutionDays: 3,
    warningThresholdPercent: 66,
    escalationThresholdPercent: 90,
    description: 'Urgent plan modifications resolved within 3 business days',
  },
  {
    id: 'sla-plan-high',
    caseType: 'PLAN_MODIFICATION',
    priority: 'HIGH',
    targetResolutionDays: 7,
    warningThresholdPercent: 75,
    escalationThresholdPercent: 90,
    description: 'High-priority plan changes resolved within 7 business days',
  },
  {
    id: 'sla-plan-medium',
    caseType: 'PLAN_MODIFICATION',
    priority: 'MEDIUM',
    targetResolutionDays: 12,
    warningThresholdPercent: 80,
    escalationThresholdPercent: 95,
    description: 'Standard plan modifications resolved within 12 business days',
  },
  {
    id: 'sla-plan-low',
    caseType: 'PLAN_MODIFICATION',
    priority: 'LOW',
    targetResolutionDays: 20,
    warningThresholdPercent: 85,
    escalationThresholdPercent: 95,
    description: 'Minor plan adjustments resolved within 20 business days',
  },

  // QUOTA_ADJUSTMENT cases
  {
    id: 'sla-quota-urgent',
    caseType: 'QUOTA_ADJUSTMENT',
    priority: 'URGENT',
    targetResolutionDays: 3,
    warningThresholdPercent: 66,
    escalationThresholdPercent: 90,
    description: 'Urgent quota adjustments resolved within 3 business days',
  },
  {
    id: 'sla-quota-high',
    caseType: 'QUOTA_ADJUSTMENT',
    priority: 'HIGH',
    targetResolutionDays: 7,
    warningThresholdPercent: 75,
    escalationThresholdPercent: 90,
    description: 'High-priority quota changes resolved within 7 business days',
  },
  {
    id: 'sla-quota-medium',
    caseType: 'QUOTA_ADJUSTMENT',
    priority: 'MEDIUM',
    targetResolutionDays: 10,
    warningThresholdPercent: 80,
    escalationThresholdPercent: 95,
    description: 'Standard quota adjustments resolved within 10 business days',
  },
  {
    id: 'sla-quota-low',
    caseType: 'QUOTA_ADJUSTMENT',
    priority: 'LOW',
    targetResolutionDays: 15,
    warningThresholdPercent: 85,
    escalationThresholdPercent: 95,
    description: 'Minor quota changes resolved within 15 business days',
  },
];

/**
 * Case Load by Assignee
 */
export interface AssigneeLoad {
  assigneeName: string;
  activeCases: number;
  urgentCases: number;
  highPriorityCases: number;
  atRiskCases: number;
  breachedCases: number;
  avgResolutionDays: number;
  capacity: number; // Max cases this assignee can handle (0-100%)
  workload: 'UNDER' | 'OPTIMAL' | 'HIGH' | 'OVER'; // Load status
}

/**
 * SLA Status for a Case
 */
export interface CaseSLAStatus {
  caseId: string;
  slaPolicy: SLAPolicy;
  daysElapsed: number;
  daysRemaining: number;
  percentElapsed: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  shouldEscalate: boolean;
}

/**
 * Calculate SLA Status for a Case
 */
export function calculateCaseSLA(caseItem: CaseItem): CaseSLAStatus {
  // Find matching SLA policy
  const policy = SLA_POLICIES.find(
    p => p.caseType === caseItem.type && p.priority === caseItem.priority
  );

  if (!policy) {
    throw new Error(`No SLA policy found for ${caseItem.type} / ${caseItem.priority}`);
  }

  const daysElapsed = caseItem.businessDaysElapsed;
  const targetDays = policy.targetResolutionDays;
  const daysRemaining = Math.max(0, targetDays - daysElapsed);
  const percentElapsed = (daysElapsed / targetDays) * 100;

  let status: CaseSLAStatus['status'];
  if (percentElapsed >= 100) {
    status = 'BREACHED';
  } else if (percentElapsed >= policy.warningThresholdPercent) {
    status = 'AT_RISK';
  } else {
    status = 'ON_TRACK';
  }

  const shouldEscalate = percentElapsed >= policy.escalationThresholdPercent;

  return {
    caseId: caseItem.id,
    slaPolicy: policy,
    daysElapsed,
    daysRemaining,
    percentElapsed,
    status,
    shouldEscalate,
  };
}

/**
 * Calculate Assignee Workload
 */
export function calculateAssigneeLoad(
  cases: CaseItem[],
  assigneeName: string
): AssigneeLoad {
  const assignedCases = cases.filter(c => c.assignedTo === assigneeName);
  const activeCases = assignedCases.filter(c =>
    c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  const urgentCases = activeCases.filter(c => c.priority === 'URGENT').length;
  const highPriorityCases = activeCases.filter(c => c.priority === 'HIGH').length;

  // Calculate SLA status for each case
  const slaStatuses = activeCases.map(calculateCaseSLA);
  const atRiskCases = slaStatuses.filter(s => s.status === 'AT_RISK').length;
  const breachedCases = slaStatuses.filter(s => s.status === 'BREACHED').length;

  // Calculate average resolution time for closed cases
  const resolvedCases = assignedCases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
  const avgResolutionDays = resolvedCases.length > 0
    ? resolvedCases.reduce((sum, c) => sum + c.businessDaysElapsed, 0) / resolvedCases.length
    : 0;

  // Calculate capacity (weighted by priority)
  // Urgent = 4 points, High = 3, Medium = 2, Low = 1
  const workloadPoints =
    urgentCases * 4 +
    highPriorityCases * 3 +
    activeCases.filter(c => c.priority === 'MEDIUM').length * 2 +
    activeCases.filter(c => c.priority === 'LOW').length * 1;

  const maxCapacity = 30; // Max workload points (e.g., 10 medium cases or 7.5 urgent cases)
  const capacity = Math.min(100, (workloadPoints / maxCapacity) * 100);

  let workload: AssigneeLoad['workload'];
  if (capacity < 50) {
    workload = 'UNDER';
  } else if (capacity < 80) {
    workload = 'OPTIMAL';
  } else if (capacity < 100) {
    workload = 'HIGH';
  } else {
    workload = 'OVER';
  }

  return {
    assigneeName,
    activeCases: activeCases.length,
    urgentCases,
    highPriorityCases,
    atRiskCases,
    breachedCases,
    avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
    capacity: Math.round(capacity),
    workload,
  };
}

/**
 * Suggest Optimal Assignment
 * Returns the best assignee for a new case based on current workload
 */
export function suggestOptimalAssignment(
  cases: CaseItem[],
  assignees: string[],
  newCasePriority: CaseItem['priority']
): { assignee: string; reason: string; confidence: number } {
  const loads = assignees.map(a => calculateAssigneeLoad(cases, a));

  // Filter to assignees not overloaded
  const availableLoads = loads.filter(l => l.workload !== 'OVER');

  if (availableLoads.length === 0) {
    // All overloaded - assign to least loaded
    const leastLoaded = loads.sort((a, b) => a.capacity - b.capacity)[0];
    return {
      assignee: leastLoaded.assigneeName,
      reason: `All assignees at capacity. ${leastLoaded.assigneeName} has lowest load (${leastLoaded.capacity}%)`,
      confidence: 50,
    };
  }

  // Score assignees based on:
  // 1. Available capacity
  // 2. Number of at-risk cases (prefer lower)
  // 3. Average resolution time (prefer faster)
  const scored = availableLoads.map(load => {
    const capacityScore = 100 - load.capacity; // Higher is better
    const riskScore = Math.max(0, 100 - (load.atRiskCases * 20)); // Fewer at-risk = better
    const speedScore = load.avgResolutionDays > 0
      ? Math.max(0, 100 - (load.avgResolutionDays * 5))
      : 50;

    const totalScore = (capacityScore * 0.5) + (riskScore * 0.3) + (speedScore * 0.2);

    return {
      load,
      score: totalScore,
    };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0];

  return {
    assignee: best.load.assigneeName,
    reason: `Optimal capacity (${best.load.capacity}%), ${best.load.atRiskCases} at-risk cases, avg ${best.load.avgResolutionDays}d resolution`,
    confidence: Math.min(95, Math.round(best.score)),
  };
}
