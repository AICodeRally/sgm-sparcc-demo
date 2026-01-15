/**
 * Client Governance Documents - Synthetic Data
 *
 * Demo documents for the governance framework implementation.
 * Includes 6 critical DRAFT policies and 11 production policies
 * as part of a sample risk remediation project.
 */

export const CLIENT_DOCUMENTS = {
  // 6 Critical DRAFT Policies (UNDER_REVIEW - awaiting legal approval)
  draftPolicies: [
    {
      documentCode: 'SCP-001',
      title: 'Clawback and Recovery Policy',
      documentType: 'POLICY',
      category: 'Sales Compensation',
      status: 'UNDER_REVIEW',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'VP Sales Compensation',
      description:
        'Revenue reversal and recovery mechanisms with approval thresholds. Defines clawback scenarios including revenue reversals, terminated employment, quota non-attainment, and fraudulent activity. Establishes recovery process with manager approval (<$5K), VP approval ($5K-$50K), and CRB review (>$50K). Includes payment plan options and appeals process.',
      complianceFlags: ['FLSA', 'STATE_WAGE_LAW'],
      legalReviewStatus: 'PENDING',
      tags: ['Template', 'Critical', 'DRAFT'],
      metadata: {
        riskExposure: 500000,
        priority: 'HIGH',
        deliveryPhase: 'Phase 1 - Critical Policies',
      },
    },
    {
      documentCode: 'SCP-002',
      title: 'Quota Management Policy',
      documentType: 'POLICY',
      category: 'Sales Compensation',
      status: 'UNDER_REVIEW',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'VP Sales Compensation',
      description:
        'Quota setting methodology, adjustment triggers, and approval workflows. Establishes annual quota planning process with market-based targets. Defines adjustment scenarios: territory changes (pro-rata), ramp extensions (manager approval), extraordinary circumstances (VP + Finance approval). Includes mid-year quota relief process (CRB approval >20% adjustment) and appeals framework.',
      complianceFlags: ['INTERNAL_CONTROLS'],
      legalReviewStatus: 'PENDING',
      tags: ['Template', 'Critical', 'DRAFT'],
      metadata: {
        riskExposure: 300000,
        priority: 'HIGH',
        deliveryPhase: 'Phase 1 - Critical Policies',
      },
    },
    {
      documentCode: 'SCP-003',
      title: 'Windfall & Large Deal Policy',
      documentType: 'POLICY',
      category: 'Sales Compensation',
      status: 'UNDER_REVIEW',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'VP Sales Compensation',
      description:
        'Deal thresholds, CRB review process, and treatment options for windfall deals. Defines windfall as >$1M revenue or >50% of annual quota. Mandates CRB review for all windfall deals with 6 treatment options: Full Pay, Cap (150% quota), Amortization (spread over 12 months), Split Credit (with overlay), Bonus Treatment (exclude from quota attainment), Deny (if outside coverage). Includes pre-approval process and appeal rights. 20 business day SLA for decisions.',
      complianceFlags: ['INTERNAL_CONTROLS', 'SECTION_409A'],
      legalReviewStatus: 'PENDING',
      tags: ['Template', 'Critical', 'DRAFT', 'CRB'],
      metadata: {
        riskExposure: 750000,
        priority: 'CRITICAL',
        deliveryPhase: 'Phase 1 - Critical Policies',
        slaBusinessDays: 20,
      },
    },
    {
      documentCode: 'SCP-004',
      title: 'SPIF Governance Policy',
      documentType: 'POLICY',
      category: 'Sales Compensation',
      status: 'UNDER_REVIEW',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'VP Sales Compensation',
      description:
        'Short-term incentive approval, ROI requirements, and budget limits. Establishes SPIF types (Product Launch, Vertical, Seasonal) with approval thresholds: <$50K (Director), $50K-$100K (VP + Finance), >$100K (CRB). Requires minimum 2:1 ROI, max 25% of base comp per quarter, and sunset dates (3-6 months). Includes budget tracking and participant eligibility rules.',
      complianceFlags: ['INTERNAL_CONTROLS', 'BUDGET'],
      legalReviewStatus: 'PENDING',
      tags: ['Template', 'Critical', 'DRAFT'],
      metadata: {
        riskExposure: 200000,
        priority: 'MEDIUM',
        deliveryPhase: 'Phase 1 - Critical Policies',
      },
    },
    {
      documentCode: 'SCP-005',
      title: 'Section 409A Compliance Policy',
      documentType: 'POLICY',
      category: 'Tax Compliance',
      status: 'UNDER_REVIEW',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'CFO',
      description:
        'IRS deferred compensation compliance requirements. Ensures all sales compensation plans comply with Section 409A of the Internal Revenue Code. Defines short-term deferral exceptions, substantial risk of forfeiture, and payment timing requirements. Establishes legal review process for new plans, amendment restrictions, and documentation requirements. Requires annual 409A audit by external counsel.',
      complianceFlags: ['SECTION_409A', 'IRS', 'TAX'],
      legalReviewStatus: 'PENDING',
      tags: ['Template', 'Critical', 'DRAFT', 'Legal', 'Tax'],
      metadata: {
        riskExposure: 50000,
        priority: 'CRITICAL',
        deliveryPhase: 'Phase 1 - Critical Policies',
        legalReviewRequired: true,
      },
    },
    {
      documentCode: 'SCP-006',
      title: 'State Wage Law Compliance Policy',
      documentType: 'POLICY',
      category: 'Legal Compliance',
      status: 'UNDER_REVIEW',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'General Counsel',
      description:
        'Multi-state labor law compliance, especially California wage law requirements. Ensures compensation plans comply with state-specific wage laws across all 50 states. Special focus on California Labor Code (timely payment, deductions, final pay requirements), New York (frequency, deductions), and Massachusetts (commission agreements). Establishes state-by-state plan review process, legal counsel requirements, and amendment procedures. Includes employee notification requirements and record retention (4-7 years by state).',
      complianceFlags: ['STATE_WAGE_LAW', 'CA_LABOR_CODE', 'LEGAL'],
      legalReviewStatus: 'PENDING',
      tags: ['Template', 'Critical', 'DRAFT', 'Legal', 'California'],
      metadata: {
        riskExposure: 100000,
        priority: 'CRITICAL',
        deliveryPhase: 'Phase 1 - Critical Policies',
        legalReviewRequired: true,
        statesAffected: ['CA', 'NY', 'MA', 'All'],
      },
    },
  ],

  // 11 Production Policies (APPROVED)
  productionPolicies: [
    {
      documentCode: 'SCP-101',
      title: 'Sales Crediting Policy',
      documentType: 'POLICY',
      category: 'Crediting',
      status: 'APPROVED',
      version: '1.2',
      effectiveDate: '2025-01-01',
      owner: 'Sales Operations',
      description:
        'Deal crediting rules for new logo, renewals, and multi-rep splits. Includes overlay SE allocation.',
      legalReviewStatus: 'APPROVED',
      tags: ['Production', 'Crediting'],
    },
    {
      documentCode: 'SCP-102',
      title: 'Territory Management Policy',
      documentType: 'POLICY',
      category: 'Territory Management',
      status: 'APPROVED',
      version: '1.1',
      effectiveDate: '2025-01-01',
      owner: 'Sales Operations',
      description:
        'Territory assignment, realignment, and dispute resolution processes.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Territory'],
    },
    {
      documentCode: 'SCP-103',
      title: 'Payment Timing Policy',
      documentType: 'POLICY',
      category: 'Payment',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Payroll',
      description:
        'Monthly payment schedule, accrual processes, and reconciliation procedures.',
      legalReviewStatus: 'APPROVED',
      tags: ['Production', 'Payment'],
      complianceFlags: ['CA_LABOR_CODE', 'PAYROLL'],
    },
    {
      documentCode: 'SCP-104',
      title: 'Ramp Policy',
      documentType: 'POLICY',
      category: 'Onboarding',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Sales Compensation',
      description:
        'New hire ramp periods: 3 months (SMB), 6 months (Mid-Market), 9 months (Enterprise).',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Ramp'],
    },
    {
      documentCode: 'SCP-105',
      title: 'Leave of Absence Policy',
      documentType: 'POLICY',
      category: 'HR',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'HR',
      description:
        'Compensation treatment during LOA: medical, parental, military. Includes eligibility after 3 weeks worked.',
      legalReviewStatus: 'APPROVED',
      tags: ['Production', 'LOA'],
      complianceFlags: ['FMLA', 'HR'],
    },
    {
      documentCode: 'SCP-106',
      title: 'Dispute Resolution Policy',
      documentType: 'POLICY',
      category: 'Governance',
      status: 'APPROVED',
      version: '1.1',
      effectiveDate: '2025-01-01',
      owner: 'Sales Compensation',
      description:
        '30-day dispute window, 3-tier escalation: Manager → Director → VP. Final appeal to CRB.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Disputes'],
      metadata: {
        slaBusinessDays: 30,
      },
    },
    {
      documentCode: 'SCP-107',
      title: 'Exception Request Policy',
      documentType: 'POLICY',
      category: 'Governance',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Sales Compensation',
      description:
        'Exception approval process: financial impact <$5K (Manager), $5K-$25K (Director), >$25K (VP + CRB).',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Exceptions'],
    },
    {
      documentCode: 'SCP-108',
      title: 'Plan Amendment Policy',
      documentType: 'POLICY',
      category: 'Governance',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Sales Compensation',
      description:
        'Mid-year plan amendments require CRB approval, legal review, and 30-day notice to participants.',
      legalReviewStatus: 'APPROVED',
      tags: ['Production', 'Amendments'],
    },
    {
      documentCode: 'SCP-109',
      title: 'Data Accuracy Policy',
      documentType: 'POLICY',
      category: 'Data Governance',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Sales Operations',
      description:
        'Monthly data certification by managers, quarterly reconciliation by Finance, and annual audit.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Data'],
    },
    {
      documentCode: 'SCP-110',
      title: 'Reporting & Transparency Policy',
      documentType: 'POLICY',
      category: 'Governance',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Sales Compensation',
      description:
        'Monthly statements to reps, quarterly executive reporting, and annual plan effectiveness review.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Reporting'],
    },
    {
      documentCode: 'SCP-111',
      title: 'Communication Policy',
      documentType: 'POLICY',
      category: 'Communications',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2025-01-01',
      owner: 'Sales Compensation',
      description:
        'Plan communication cadence: annual kickoff, quarterly updates, and ad-hoc change notifications.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Production', 'Communications'],
    },
  ],

  // Framework Documents
  frameworks: [
    {
      documentCode: 'FWK-001',
      title: 'Sales Compensation Governance Committee Charter',
      documentType: 'FRAMEWORK',
      category: 'Governance',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'CFO',
      description:
        'SGCC structure: 7 voting members (CFO, VP Sales Comp, VP Sales Ops, VP Finance, Legal, HR, Sales Leader). Quarterly meetings. Approval authority for policies, plan designs, and exceptions >$50K. Quorum: 5 members.',
      legalReviewStatus: 'APPROVED',
      tags: ['SGCC', 'Charter', 'Governance'],
      metadata: {
        votingMembers: 7,
        nonVotingMembers: 2,
        meetingFrequency: 'Quarterly',
        quorum: 5,
      },
    },
    {
      documentCode: 'FWK-002',
      title: 'Compensation Review Board Charter',
      documentType: 'FRAMEWORK',
      category: 'Governance',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'VP Sales Compensation',
      description:
        'CRB structure: 3 voting members (VP Sales Comp, Finance Director, Legal). Ad-hoc meetings for windfall deals (>$1M), large exceptions (>$50K), and SPIF approvals (>$100K). 6 decision options: Full Pay, Cap, Amortization, Split, Bonus, Deny. 20 business day SLA.',
      legalReviewStatus: 'APPROVED',
      tags: ['CRB', 'Charter', 'Governance', 'Windfall'],
      metadata: {
        votingMembers: 3,
        advisors: 2,
        meetingFrequency: 'Ad-hoc',
        slaBusinessDays: 20,
        decisionOptions: ['Full Pay', 'Cap', 'Amortization', 'Split', 'Bonus', 'Deny'],
      },
    },
  ],

  // Procedures
  procedures: [
    {
      documentCode: 'PROC-001',
      title: 'Monthly Commission Processing Procedure',
      documentType: 'PROCEDURE',
      category: 'Operations',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'Sales Operations',
      description:
        'Step-by-step monthly commission calculation process: data extraction (Day 1-3), calculation (Day 4-7), manager review (Day 8-10), payroll submission (Day 11), payment (Day 15).',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Procedure', 'Monthly', 'Processing'],
    },
    {
      documentCode: 'PROC-002',
      title: 'Windfall Deal Review Procedure',
      documentType: 'PROCEDURE',
      category: 'CRB Operations',
      status: 'APPROVED',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'CRB Administrator',
      description:
        'CRB windfall review process: deal submission (Day 0), documentation review (Day 1-5), CRB meeting (Day 10), decision notification (Day 12), implementation (Day 15), appeal window (Day 15-20).',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Procedure', 'CRB', 'Windfall'],
      metadata: {
        slaBusinessDays: 20,
      },
    },
  ],

  // Templates
  templates: [
    {
      documentCode: 'TPL-001',
      title: 'Exception Request Form',
      documentType: 'TEMPLATE',
      category: 'Forms',
      status: 'ACTIVE',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'Sales Compensation',
      description:
        'Standard form for submitting policy exceptions: requestor info, policy reference, business justification, financial impact, supporting documents.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Template', 'Exception', 'Form'],
    },
    {
      documentCode: 'TPL-002',
      title: 'Dispute Resolution Form',
      documentType: 'TEMPLATE',
      category: 'Forms',
      status: 'ACTIVE',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'Sales Compensation',
      description:
        'Standard form for commission disputes: period, amount disputed, calculation details, expected amount, rationale.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Template', 'Dispute', 'Form'],
    },
  ],

  // Checklists
  checklists: [
    {
      documentCode: 'CHK-001',
      title: 'Governance Implementation Checklist',
      documentType: 'CHECKLIST',
      category: 'Implementation',
      status: 'ACTIVE',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'Project Manager',
      description:
        '12-month implementation checklist with 90+ tasks across 4 phases: Foundation (Months 1-3), Pilot (Months 4-6), Rollout (Months 7-9), Optimization (Months 10-12). Includes committee formation, policy approval, system setup, training, and continuous improvement.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Checklist', 'Implementation'],
      metadata: {
        totalTasks: 92,
        durationMonths: 12,
        phases: 4,
      },
    },
  ],

  // Guides
  guides: [
    {
      documentCode: 'GDE-001',
      title: 'Sales Rep Governance Guide',
      documentType: 'GUIDE',
      category: 'Training',
      status: 'ACTIVE',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'Sales Enablement',
      description:
        'Rep-facing guide explaining governance framework, how to read commission statements, file disputes, request exceptions, and navigate policy changes. Includes FAQ and examples.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Guide', 'Sales Rep', 'Training'],
    },
    {
      documentCode: 'GDE-002',
      title: 'Manager Governance Guide',
      documentType: 'GUIDE',
      category: 'Training',
      status: 'ACTIVE',
      version: '1.0',
      effectiveDate: '2026-01-01',
      owner: 'Sales Enablement',
      description:
        'Manager guide for handling exceptions, disputes, territory changes, quota adjustments, and team communications about compensation. Includes approval workflows and escalation procedures.',
      legalReviewStatus: 'NOT_REQUIRED',
      tags: ['Guide', 'Manager', 'Training'],
    },
  ],
};

// All client documents combined (49 total)
export const ALL_CLIENT_DOCUMENTS = [
  ...CLIENT_DOCUMENTS.draftPolicies,
  ...CLIENT_DOCUMENTS.productionPolicies,
  ...CLIENT_DOCUMENTS.frameworks,
  ...CLIENT_DOCUMENTS.procedures,
  ...CLIENT_DOCUMENTS.templates,
  ...CLIENT_DOCUMENTS.checklists,
  ...CLIENT_DOCUMENTS.guides,
];

// Statistics
export const CLIENT_STATS = {
  totalDocuments: ALL_CLIENT_DOCUMENTS.length,
  draftPolicies: CLIENT_DOCUMENTS.draftPolicies.length,
  productionPolicies: CLIENT_DOCUMENTS.productionPolicies.length,
  frameworks: CLIENT_DOCUMENTS.frameworks.length,
  procedures: CLIENT_DOCUMENTS.procedures.length,
  templates: CLIENT_DOCUMENTS.templates.length,
  checklists: CLIENT_DOCUMENTS.checklists.length,
  guides: CLIENT_DOCUMENTS.guides.length,
  riskExposure: 1750000, // $1.75M identified
  potentialSavings: 1020000, // $1.02M projected
};
