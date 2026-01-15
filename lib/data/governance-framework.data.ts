/**
 * Governance Framework - 16 Policy Areas
 * Based on SPM Best Practice Assessment
 */

export interface GovernancePolicy {
  id: string;
  code: string;
  name: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  standardPolicyFile: string;
  category: 'FINANCIAL' | 'COMPLIANCE' | 'OPERATIONAL' | 'GOVERNANCE';
}

export const GOVERNANCE_FRAMEWORK_POLICIES: GovernancePolicy[] = [
  {
    id: 'policy-001',
    code: 'WINDFALL_LARGE_DEALS',
    name: 'Windfall / Large Deals',
    description: 'Policy governing unusually large commissions with caps, escalation, and approval requirements',
    priority: 'CRITICAL',
    standardPolicyFile: 'WINDFALL_LARGE_DEAL_POLICY_DRAFT.docx',
    category: 'FINANCIAL',
  },
  {
    id: 'policy-002',
    code: 'QUOTA_MANAGEMENT',
    name: 'Quota Management',
    description: 'Policy governing quota setting, adjustment, and mid-year modifications',
    priority: 'CRITICAL',
    standardPolicyFile: 'QUOTA_MANAGEMENT_POLICY_DRAFT.docx',
    category: 'OPERATIONAL',
  },
  {
    id: 'policy-003',
    code: 'TERRITORY_MANAGEMENT',
    name: 'Territory Management',
    description: 'Policy governing territory assignments, changes, and commission treatment during transitions',
    priority: 'MEDIUM',
    standardPolicyFile: 'TERRITORY_CHANGE_PROCEDURES.docx',
    category: 'OPERATIONAL',
  },
  {
    id: 'policy-004',
    code: 'SALES_CREDITING',
    name: 'Sales Crediting',
    description: 'Policy defining how sales are credited to representatives and split-credit scenarios',
    priority: 'MEDIUM',
    standardPolicyFile: 'SALES_CREDITING_POLICY.docx',
    category: 'FINANCIAL',
  },
  {
    id: 'policy-005',
    code: 'CLAWBACK_RECOVERY',
    name: 'Clawback / Recovery',
    description: 'Policy for recovering overpaid or incorrectly paid commissions',
    priority: 'CRITICAL',
    standardPolicyFile: 'CLAWBACK_AND_RECOVERY_POLICY_DRAFT.docx',
    category: 'FINANCIAL',
  },
  {
    id: 'policy-006',
    code: 'SPIF_GOVERNANCE',
    name: 'SPIF Governance',
    description: 'Policy governing Sales Performance Incentive Funds and bonus programs',
    priority: 'HIGH',
    standardPolicyFile: 'SPIF_GOVERNANCE_POLICY_DRAFT.docx',
    category: 'FINANCIAL',
  },
  {
    id: 'policy-007',
    code: 'TERMINATION_FINAL_PAY',
    name: 'Termination / Final Pay',
    description: 'Policy defining commission treatment upon termination, resignation, or role change',
    priority: 'HIGH',
    standardPolicyFile: 'TERMINATION_POLICY.docx',
    category: 'COMPLIANCE',
  },
  {
    id: 'policy-008',
    code: 'NEW_HIRE_ONBOARDING',
    name: 'New Hire / Onboarding',
    description: 'Policy defining ramp periods, guarantees, and commission treatment for new hires',
    priority: 'MEDIUM',
    standardPolicyFile: 'NEW_HIRE_ONBOARDING_PROCESS.docx',
    category: 'OPERATIONAL',
  },
  {
    id: 'policy-009',
    code: 'LEAVE_OF_ABSENCE',
    name: 'Leave of Absence',
    description: 'Policy defining commission treatment during LOA, disability, FMLA',
    priority: 'HIGH',
    standardPolicyFile: 'LEAVE_OF_ABSENCE_POLICY.docx',
    category: 'COMPLIANCE',
  },
  {
    id: 'policy-010',
    code: 'PAYMENT_TIMING',
    name: 'Payment Timing',
    description: 'Policy defining when commissions are calculated and paid',
    priority: 'HIGH',
    standardPolicyFile: 'PAYMENT_TIMING_POLICY.docx',
    category: 'FINANCIAL',
  },
  {
    id: 'policy-011',
    code: 'COMPLIANCE_409A',
    name: 'Compliance (409A, State Wage)',
    description: 'Policy ensuring compliance with IRS 409A and state wage law requirements',
    priority: 'CRITICAL',
    standardPolicyFile: 'SECTION_409A_COMPLIANCE_POLICY_DRAFT.docx',
    category: 'COMPLIANCE',
  },
  {
    id: 'policy-012',
    code: 'EXCEPTIONS_DISPUTES',
    name: 'Exceptions / Disputes',
    description: 'Policy defining exception request and dispute resolution processes',
    priority: 'HIGH',
    standardPolicyFile: 'EXCEPTION_REQUEST_PROCESS.docx',
    category: 'GOVERNANCE',
  },
  {
    id: 'policy-013',
    code: 'DATA_SYSTEMS_CONTROLS',
    name: 'Data / Systems / Controls',
    description: 'Policy defining data access, system controls, and segregation of duties',
    priority: 'CRITICAL',
    standardPolicyFile: 'ACCESS_CONTROLS_FRAMEWORK.docx',
    category: 'GOVERNANCE',
  },
  {
    id: 'policy-014',
    code: 'DRAWS_GUARANTEES',
    name: 'Draws / Guarantees',
    description: 'Policy governing draw against commission and guarantee arrangements',
    priority: 'MEDIUM',
    standardPolicyFile: 'DRAWS_AND_GUARANTEES_POLICY.docx',
    category: 'FINANCIAL',
  },
  {
    id: 'policy-015',
    code: 'MID_PERIOD_CHANGES',
    name: 'Mid-Period Changes',
    description: 'Policy governing compensation plan changes during the performance period',
    priority: 'CRITICAL',
    standardPolicyFile: 'MID_PERIOD_CHANGE_POLICY.docx',
    category: 'OPERATIONAL',
  },
  {
    id: 'policy-016',
    code: 'INTERNATIONAL_REQUIREMENTS',
    name: 'International Requirements',
    description: 'Country-specific governance controls for international compensation programs',
    priority: 'CRITICAL',
    standardPolicyFile: 'INTERNATIONAL_GOVERNANCE_ADDENDUM.md',
    category: 'COMPLIANCE',
  },
];

export type PolicyCoverageStatus = 'COVERED' | 'NEEDS_WORK' | 'MISSING';

export interface PlanPolicyCoverage {
  planId: string;
  planCode: string;
  planTitle: string;
  policyId: string;
  policyCode: string;
  policyName: string;
  status: PolicyCoverageStatus;
  existingLanguage?: string; // What the plan currently has
  draftAdditiveLanguage?: string; // Draft text to add if NEEDS_WORK
  draftMissingLanguage?: string; // Draft text to add if MISSING
  notes?: string;
}

/**
 * Demo Client Plan Coverage Data
 * Based on GOVERNANCE_FRAMEWORK_ASSESSMENT.md
 */
export const CLIENT_PLAN_COVERAGE: PlanPolicyCoverage[] = [
  // Medical FSC Standard - Example Plan
  {
    planId: 'hs-plan-023',
    planCode: 'HS-MED-FSC-STD-2025',
    planTitle: 'Medical FSC Standard',
    policyId: 'policy-001',
    policyCode: 'WINDFALL_LARGE_DEALS',
    policyName: 'Windfall / Large Deals',
    status: 'NEEDS_WORK',
    existingLanguage: 'Commissions over $50,000 require management review.',
    draftAdditiveLanguage: `**DRAFT ADDITIVE LANGUAGE:**

Commission caps must be defined and escalated to CRB for approval:
- Deals resulting in >$100K commission require SVP approval
- Deals resulting in >$250K commission require CRB approval
- All windfall payments must be documented with business justification
- Maximum commission cap: $500K per transaction without CRB exception`,
    notes: 'Partial coverage - has review threshold but no formal caps or CRB escalation',
  },
  {
    planId: 'hs-plan-023',
    planCode: 'HS-MED-FSC-STD-2025',
    planTitle: 'Medical FSC Standard',
    policyId: 'policy-002',
    policyCode: 'QUOTA_MANAGEMENT',
    policyName: 'Quota Management',
    status: 'MISSING',
    draftMissingLanguage: `**DRAFT MISSING SECTION:**

## Quota Management

### Quota Setting Process
- Annual quotas set by Sales Leadership and approved by CRB
- Quotas based on historical performance, territory potential, market conditions
- Individual quotas assigned no later than December 15 for following calendar year

### Mid-Year Quota Adjustments
- Allowed only under documented circumstances:
  - Territory changes (see Territory Management policy)
  - Market disruption or force majeure
  - Product line discontinuation
- All adjustments require SVP approval and documentation
- Adjustments cannot reduce quota by >20% without CRB approval

### Quota Relief
- Available for documented territory issues (merger, acquisition, market exit)
- Requires written request with supporting data
- Decisions made within 15 business days
- No retroactive relief beyond current quarter`,
    notes: 'Universal gap - all 27 plans missing this section',
  },
  {
    planId: 'hs-plan-023',
    planCode: 'HS-MED-FSC-STD-2025',
    planTitle: 'Medical FSC Standard',
    policyId: 'policy-003',
    policyCode: 'TERRITORY_MANAGEMENT',
    policyName: 'Territory Management',
    status: 'MISSING',
    draftMissingLanguage: `**DRAFT MISSING SECTION:**

## Territory Management

### Territory Assignment
- Territories assigned by Sales Leadership with VP approval
- Territory maps maintained in CRM system
- Changes communicated 30 days in advance when possible

### Territory Changes
- Mid-year changes allowed only for business necessity
- Commission treatment during transition:
  - 30-day shadow period: both old and new rep credited
  - Credit splits documented in writing
  - Pending deals assigned based on relationship ownership

### Mergers & Splits
- When territories merge: rep with longer tenure receives combined territory
- When territories split: accounts assigned based on geography and relationship
- Grandfathered commissions: up to 90 days on existing accounts`,
  },
  {
    planId: 'hs-plan-023',
    planCode: 'HS-MED-FSC-STD-2025',
    planTitle: 'Medical FSC Standard',
    policyId: 'policy-004',
    policyCode: 'SALES_CREDITING',
    policyName: 'Sales Crediting',
    status: 'NEEDS_WORK',
    existingLanguage: 'Sales credited to assigned territory representative.',
    draftAdditiveLanguage: `**DRAFT ADDITIVE LANGUAGE:**

### Split Credit Scenarios
The following scenarios require documented split credit:
- Team selling: Credit split per documented agreement signed by reps
- Overlay specialists: 70% to territory rep, 30% to specialist (unless otherwise specified)
- Cross-division sales: Split per division agreement on file
- House accounts: Credit as specified in account assignment system

### Credit Disputes
- All credit disputes must be raised within 30 days of transaction posting
- Manager reviews and makes initial determination within 10 business days
- Appeals escalate to VP Sales within 5 business days
- Final determination documented and binding for future similar scenarios`,
  },
  // Add more coverage data as needed
];

/**
 * Get policy coverage for a specific plan
 */
export function getPlanCoverage(planCode: string): PlanPolicyCoverage[] {
  return CLIENT_PLAN_COVERAGE.filter((c) => c.planCode === planCode);
}

/**
 * Get coverage status summary for a plan
 */
export function getPlanCoverageSummary(planCode: string) {
  const coverage = getPlanCoverage(planCode);
  const covered = coverage.filter((c) => c.status === 'COVERED').length;
  const needsWork = coverage.filter((c) => c.status === 'NEEDS_WORK').length;
  const missing = coverage.filter((c) => c.status === 'MISSING').length;
  const total = GOVERNANCE_FRAMEWORK_POLICIES.length;

  return {
    covered,
    needsWork,
    missing,
    total,
    coveragePercentage: Math.round((covered / total) * 100),
    completenessScore: Math.round(((covered + needsWork * 0.5) / total) * 100),
  };
}
