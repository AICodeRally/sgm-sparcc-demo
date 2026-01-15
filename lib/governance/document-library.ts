/**
 * SPM Governance Document Library
 *
 * Comprehensive catalog of governance documents from the Governance Library 2026.
 * Includes policies, templates, procedures, checklists, and reference materials.
 *
 * Source: <CLIENT_DELIVERY_PACKAGE>/
 */

// ============================================================================
// TYPES
// ============================================================================

export type DocumentType =
  | 'POLICY'
  | 'TEMPLATE'
  | 'PROCEDURE'
  | 'CHECKLIST'
  | 'GUIDE'
  | 'PATCH_TEMPLATE'
  | 'GOVERNANCE_REVIEW'
  | 'GAP_ANALYSIS'
  | 'REMEDIATION_CHECKLIST'
  | 'EXECUTIVE_SUMMARY'
  | 'FRAMEWORK';

export type DocumentStatus = 'DRAFT' | 'APPROVED' | 'FINAL' | 'ARCHIVED';

export interface GovernanceDocument {
  id: string;
  code: string;
  name: string;
  type: DocumentType;
  category: string;
  status: DocumentStatus;
  version: string;
  description: string;
  filePath?: string;
  relatedPolicies?: string[];
  lastUpdated: string;
  approvedBy?: string;
  tags: string[];
}

// ============================================================================
// POLICY DOCUMENTS (11 total)
// ============================================================================

export const POLICY_DOCUMENTS: GovernanceDocument[] = [
  {
    id: 'pol-001',
    code: 'SCP-001',
    name: 'Clawback and Recovery Policy',
    type: 'POLICY',
    category: 'Financial Controls',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Framework for recovering sales compensation payments made in error, based on inaccurate data, or when underlying business transaction is reversed.',
    filePath: '/02_POLICIES/CLAWBACK_AND_RECOVERY_POLICY.docx',
    relatedPolicies: ['SCP-005', 'SCP-006', 'SCP-012'],
    lastUpdated: '2025-12-03',
    tags: ['clawback', 'recovery', 'chargeback', 'reversal', 'financial'],
  },
  {
    id: 'pol-002',
    code: 'SCP-006',
    name: 'State Wage Law Compliance Policy',
    type: 'POLICY',
    category: 'Legal Compliance',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Compliance requirements for state wage and hour laws, particularly California Labor Code Section 2751 and multi-state final payment requirements.',
    filePath: '/02_POLICIES/STATE_WAGE_LAW_COMPLIANCE.docx',
    relatedPolicies: ['SCP-012', 'SCP-001', 'SCP-008'],
    lastUpdated: '2025-12-03',
    tags: ['california', 'labor code', '2751', 'final pay', 'wage law', 'compliance'],
  },
  {
    id: 'pol-003',
    code: 'SCP-008',
    name: 'Draws and Guarantees Policy',
    type: 'POLICY',
    category: 'Financial Controls',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Standards for recoverable and non-recoverable draws, guarantee periods, and repayment terms.',
    filePath: '/02_POLICIES/DRAWS_AND_GUARANTEES_POLICY.docx',
    relatedPolicies: ['SCP-001', 'SCP-006', 'SCP-012'],
    lastUpdated: '2025-12-03',
    tags: ['draws', 'guarantees', 'recoverable', 'repayment', 'financial'],
  },
  {
    id: 'pol-004',
    code: 'SCP-009',
    name: 'Leave of Absence Policy',
    type: 'POLICY',
    category: 'HR Policies',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Treatment of sales compensation during leaves of absence, including FMLA, military, disability, and parental leave.',
    filePath: '/02_POLICIES/LEAVE_OF_ABSENCE_POLICY.docx',
    relatedPolicies: ['SCP-002', 'SCP-012'],
    lastUpdated: '2025-12-03',
    tags: ['fmla', 'userra', 'leave', 'military', 'disability', 'parental'],
  },
  {
    id: 'pol-005',
    code: 'SCP-010',
    name: 'Mid-Period Change Policy',
    type: 'POLICY',
    category: 'Plan Administration',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Governance for changes to compensation plans during the performance period, including notification and pro-ration requirements.',
    filePath: '/02_POLICIES/MID_PERIOD_CHANGE_POLICY.docx',
    relatedPolicies: ['SCP-002'],
    lastUpdated: '2025-12-03',
    tags: ['mid-period', 'change', 'notification', 'pro-ration', 'governance'],
  },
  {
    id: 'pol-006',
    code: 'SCP-007',
    name: 'Sales Crediting Policy',
    type: 'POLICY',
    category: 'Commission Rules',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Rules for crediting sales to representatives, including territory ownership, split credit scenarios, and team selling provisions.',
    filePath: '/02_POLICIES/SALES_CREDITING_POLICY.docx',
    relatedPolicies: ['SCP-014', 'SCP-003'],
    lastUpdated: '2025-12-03',
    tags: ['crediting', 'territory', 'split', 'team selling', 'commission'],
  },
  {
    id: 'pol-007',
    code: 'SCP-011',
    name: 'Payment Timing Policy',
    type: 'POLICY',
    category: 'Payroll',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Standards for commission payment schedules, data cut-off dates, and statement delivery.',
    filePath: '/02_POLICIES/PAYMENT_TIMING_POLICY.docx',
    relatedPolicies: ['SCP-005', 'SCP-012'],
    lastUpdated: '2025-12-03',
    tags: ['payment', 'timing', 'schedule', 'cutoff', 'statements'],
  },
  {
    id: 'pol-008',
    code: 'SCP-012',
    name: 'Termination and Final Pay Policy',
    type: 'POLICY',
    category: 'HR Policies',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Treatment of sales compensation upon termination of employment, including final payment timing and earned commission rules.',
    filePath: '/02_POLICIES/TERMINATION_POLICY.docx',
    relatedPolicies: ['SCP-006', 'SCP-008', 'SCP-001'],
    lastUpdated: '2025-12-03',
    tags: ['termination', 'final pay', 'resignation', 'involuntary', 'earned'],
  },
  {
    id: 'pol-009',
    code: 'SCP-013',
    name: 'Data Retention Policy',
    type: 'POLICY',
    category: 'IT Governance',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Data retention requirements, system access controls, and audit trail provisions for compensation data.',
    filePath: '/02_POLICIES/DATA_RETENTION_POLICY.docx',
    relatedPolicies: ['SCP-001'],
    lastUpdated: '2025-12-03',
    tags: ['data', 'retention', 'privacy', 'gdpr', 'ccpa', 'audit'],
  },
  {
    id: 'pol-010',
    code: 'CAP-001',
    name: 'Cap and Threshold Guidelines',
    type: 'POLICY',
    category: 'Deal Governance',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Guidelines for commission caps, accelerator thresholds, and windfall deal governance.',
    filePath: '/02_POLICIES/CAP_AND_THRESHOLD_GUIDELINES.docx',
    relatedPolicies: ['SCP-003'],
    lastUpdated: '2025-12-03',
    tags: ['cap', 'threshold', 'windfall', 'accelerator', 'governance'],
  },
  {
    id: 'pol-011',
    code: 'STC-001',
    name: 'Standard Terms and Conditions',
    type: 'POLICY',
    category: 'Legal Compliance',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Standard legal terms and conditions for all compensation plans including 409A compliance and at-will provisions.',
    filePath: '/02_POLICIES/STANDARD_TERMS_AND_CONDITIONS.docx',
    relatedPolicies: ['SCP-005', 'SCP-006'],
    lastUpdated: '2025-12-03',
    tags: ['terms', 'conditions', '409a', 'at-will', 'legal'],
  },
  {
    id: 'pol-012',
    code: 'VER-001',
    name: 'Version Control Policy',
    type: 'POLICY',
    category: 'Document Governance',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Version control and document management standards for compensation plans and governance documents.',
    filePath: '/02_POLICIES/VERSION_CONTROL_POLICY.docx',
    relatedPolicies: [],
    lastUpdated: '2025-12-03',
    tags: ['version', 'control', 'document', 'management'],
  },
];

// ============================================================================
// TEMPLATE DOCUMENTS (12 total)
// ============================================================================

export const TEMPLATE_DOCUMENTS: GovernanceDocument[] = [
  {
    id: 'tpl-001',
    code: 'TPL-001',
    name: 'Plan Summary Template',
    type: 'TEMPLATE',
    category: 'Plan Documentation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Standard template for documenting compensation plan summaries including components, rates, and thresholds.',
    filePath: '/04_TEMPLATES/01_PLAN_SUMMARY_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['plan', 'summary', 'documentation'],
  },
  {
    id: 'tpl-002',
    code: 'TPL-002',
    name: 'CRB Meeting Agenda Template',
    type: 'TEMPLATE',
    category: 'Governance Meetings',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for Compensation Review Board meeting agendas including windfall reviews and policy decisions.',
    filePath: '/04_TEMPLATES/02_CRB_MEETING_AGENDA_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['crb', 'meeting', 'agenda', 'windfall'],
  },
  {
    id: 'tpl-003',
    code: 'TPL-003',
    name: 'Governance Committee Meeting Agenda Template',
    type: 'TEMPLATE',
    category: 'Governance Meetings',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for SGCC and governance committee meeting agendas.',
    filePath: '/04_TEMPLATES/03_GOVERNANCE_COMMITTEE_MEETING_AGENDA_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['sgcc', 'governance', 'committee', 'agenda'],
  },
  {
    id: 'tpl-004',
    code: 'TPL-004',
    name: 'Meeting Minutes Template',
    type: 'TEMPLATE',
    category: 'Governance Meetings',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Standard template for documenting meeting minutes including decisions, action items, and attendance.',
    filePath: '/04_TEMPLATES/04_MEETING_MINUTES_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['minutes', 'meeting', 'decisions', 'actions'],
  },
  {
    id: 'tpl-005',
    code: 'TPL-005',
    name: 'Decision Log Template',
    type: 'TEMPLATE',
    category: 'Governance Tracking',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for tracking governance decisions, approvals, and rationale.',
    filePath: '/04_TEMPLATES/05_DECISION_LOG_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['decision', 'log', 'approval', 'tracking'],
  },
  {
    id: 'tpl-006',
    code: 'TPL-006',
    name: 'CRB Submission Template',
    type: 'TEMPLATE',
    category: 'Deal Review',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for submitting windfall and large deal reviews to the Compensation Review Board.',
    filePath: '/04_TEMPLATES/06_CRB_SUBMISSION_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['crb', 'submission', 'windfall', 'deal'],
  },
  {
    id: 'tpl-007',
    code: 'TPL-007',
    name: 'Plan Announcement Template',
    type: 'TEMPLATE',
    category: 'Communications',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for announcing new or updated compensation plans to participants.',
    filePath: '/04_TEMPLATES/07_PLAN_ANNOUNCEMENT_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['announcement', 'communication', 'plan'],
  },
  {
    id: 'tpl-008',
    code: 'TPL-008',
    name: 'FAQ Template',
    type: 'TEMPLATE',
    category: 'Communications',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for creating compensation plan FAQs for participants.',
    filePath: '/04_TEMPLATES/08_FAQ_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['faq', 'questions', 'answers', 'communication'],
  },
  {
    id: 'tpl-009',
    code: 'TPL-009',
    name: 'Access Request Form Template',
    type: 'TEMPLATE',
    category: 'IT Governance',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for requesting access to compensation systems and data.',
    filePath: '/04_TEMPLATES/09_ACCESS_REQUEST_FORM_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['access', 'request', 'security', 'form'],
  },
  {
    id: 'tpl-010',
    code: 'TPL-010',
    name: 'New Plan Checklist Template',
    type: 'TEMPLATE',
    category: 'Plan Administration',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Checklist template for launching new compensation plans.',
    filePath: '/04_TEMPLATES/10_NEW_PLAN_CHECKLIST_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['new', 'plan', 'checklist', 'launch'],
  },
  {
    id: 'tpl-011',
    code: 'TPL-011',
    name: 'Plan Sunset Checklist Template',
    type: 'TEMPLATE',
    category: 'Plan Administration',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Checklist template for retiring/sunsetting compensation plans.',
    filePath: '/04_TEMPLATES/11_PLAN_SUNSET_CHECKLIST_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['sunset', 'retire', 'checklist', 'archive'],
  },
  {
    id: 'tpl-012',
    code: 'TPL-012',
    name: 'Quarterly Review Template',
    type: 'TEMPLATE',
    category: 'Performance Review',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Template for conducting quarterly compensation plan effectiveness reviews.',
    filePath: '/04_TEMPLATES/12_QUARTERLY_REVIEW_TEMPLATE.md',
    lastUpdated: '2025-12-04',
    tags: ['quarterly', 'review', 'effectiveness', 'performance'],
  },
];

// ============================================================================
// PATCH TEMPLATES (16 total)
// ============================================================================

export const PATCH_TEMPLATE_DOCUMENTS: GovernanceDocument[] = [
  {
    id: 'patch-001',
    code: 'PATCH-SCP-001',
    name: 'Clawback and Recovery Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for clawback and recovery policy gaps.',
    filePath: '/patch_templates/SCP-001_clawback_recovery.yaml',
    relatedPolicies: ['SCP-001'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'clawback', 'recovery', 'remediation'],
  },
  {
    id: 'patch-002',
    code: 'PATCH-SCP-002',
    name: 'Quota and Territory Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for quota setting and territory adjustment gaps.',
    filePath: '/patch_templates/SCP-002_quota_territory.yaml',
    relatedPolicies: ['SCP-002'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'quota', 'territory', 'remediation'],
  },
  {
    id: 'patch-003',
    code: 'PATCH-SCP-003',
    name: 'Payment Timing Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for payment timing and schedule gaps.',
    filePath: '/patch_templates/SCP-003_payment_timing.yaml',
    relatedPolicies: ['SCP-011'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'payment', 'timing', 'remediation'],
  },
  {
    id: 'patch-004',
    code: 'PATCH-SCP-004',
    name: 'Dispute Resolution Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for dispute resolution process gaps.',
    filePath: '/patch_templates/SCP-004_dispute_resolution.yaml',
    relatedPolicies: ['SCP-015'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'dispute', 'resolution', 'remediation'],
  },
  {
    id: 'patch-005',
    code: 'PATCH-SCP-005',
    name: 'Plan Change Governance Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for mid-period plan change governance gaps.',
    filePath: '/patch_templates/SCP-005_plan_change_governance.yaml',
    relatedPolicies: ['SCP-010'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'plan change', 'governance', 'remediation'],
  },
  {
    id: 'patch-006',
    code: 'PATCH-SCP-006',
    name: 'State Wage Law Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for state wage law compliance gaps including CA Labor Code §2751.',
    filePath: '/patch_templates/SCP-006_state_wage_law.yaml',
    relatedPolicies: ['SCP-006'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'california', 'wage law', '2751', 'remediation'],
  },
  {
    id: 'patch-007',
    code: 'PATCH-SCP-007',
    name: 'Section 409A Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for Section 409A compliance gaps including safe harbor provisions.',
    filePath: '/patch_templates/SCP-007_section_409A.yaml',
    relatedPolicies: ['SCP-005'],
    lastUpdated: '2026-01-08',
    tags: ['patch', '409a', 'safe harbor', 'compliance', 'remediation'],
  },
  {
    id: 'patch-008',
    code: 'PATCH-SCP-008',
    name: 'Leave of Absence Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for leave of absence compensation gaps including FMLA/USERRA.',
    filePath: '/patch_templates/SCP-008_leave_of_absence.yaml',
    relatedPolicies: ['SCP-009'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'fmla', 'userra', 'leave', 'remediation'],
  },
  {
    id: 'patch-009',
    code: 'PATCH-SCP-009',
    name: 'Split Commission Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for split credit and team selling gaps.',
    filePath: '/patch_templates/SCP-009_split_commission.yaml',
    relatedPolicies: ['SCP-007'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'split', 'credit', 'team', 'remediation'],
  },
  {
    id: 'patch-010',
    code: 'PATCH-SCP-010',
    name: 'Accelerator/Decelerator Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for commission accelerator and decelerator gaps.',
    filePath: '/patch_templates/SCP-010_accelerator_decelerator.yaml',
    relatedPolicies: ['SCP-003'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'accelerator', 'decelerator', 'remediation'],
  },
  {
    id: 'patch-011',
    code: 'PATCH-SCP-011',
    name: 'SPIF/Bonus Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for SPIF and bonus program governance gaps.',
    filePath: '/patch_templates/SCP-011_spiff_bonus.yaml',
    relatedPolicies: ['SCP-004'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'spif', 'bonus', 'remediation'],
  },
  {
    id: 'patch-012',
    code: 'PATCH-SCP-012',
    name: 'New Hire Ramp Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for new hire ramp period and onboarding gaps.',
    filePath: '/patch_templates/SCP-012_new_hire_ramp.yaml',
    relatedPolicies: ['SCP-016'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'new hire', 'ramp', 'onboarding', 'remediation'],
  },
  {
    id: 'patch-013',
    code: 'PATCH-SCP-013',
    name: 'Termination Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for termination and final pay gaps.',
    filePath: '/patch_templates/SCP-013_termination.yaml',
    relatedPolicies: ['SCP-012'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'termination', 'final pay', 'remediation'],
  },
  {
    id: 'patch-014',
    code: 'PATCH-SCP-014',
    name: 'Windfall Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for windfall/large deal governance gaps.',
    filePath: '/patch_templates/SCP-014_windfall.yaml',
    relatedPolicies: ['SCP-003'],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'windfall', 'large deal', 'crb', 'remediation'],
  },
  {
    id: 'patch-015',
    code: 'PATCH-SCP-015',
    name: 'Product Exclusions Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for product exclusion and commissionable revenue gaps.',
    filePath: '/patch_templates/SCP-015_product_exclusions.yaml',
    relatedPolicies: [],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'product', 'exclusions', 'revenue', 'remediation'],
  },
  {
    id: 'patch-016',
    code: 'PATCH-SCP-016',
    name: 'Ethics and Compliance Remediation',
    type: 'PATCH_TEMPLATE',
    category: 'Remediation',
    status: 'APPROVED',
    version: '1.0.0',
    description: 'Remediation language templates for ethics and compliance program gaps.',
    filePath: '/patch_templates/SCP-016_ethics_compliance.yaml',
    relatedPolicies: [],
    lastUpdated: '2026-01-08',
    tags: ['patch', 'ethics', 'compliance', 'remediation'],
  },
];

// ============================================================================
// CLIENT DELIVERABLES - EXECUTIVE SUMMARY
// ============================================================================

export const EXECUTIVE_SUMMARY: GovernanceDocument = {
  id: 'exec-001',
  code: 'EXEC-2026-01',
  name: 'Executive Summary - Compensation Plan Governance Gap Analysis',
  type: 'EXECUTIVE_SUMMARY',
  category: 'Analysis Reports',
  status: 'FINAL',
  version: '1.0.0',
  description: `Comprehensive executive summary of governance gap analysis across 20 compensation plans.

Key Findings:
- Overall Governance Coverage: 11.4% (Target: >80%)
- Average Liability Score: 2.12/5.0 (Target: <2.0)
- Total Gaps Identified: 1,062
- Critical Gaps: 137 across 20 plans

Risk Assessment: ELEVATED

Estimated Financial Exposure:
- Best Case: $0
- Likely Case: $500K - $2M (wage claims, penalties)
- Worst Case: $5M - $15M (class action, 409A)`,
  filePath: '/CLIENT_DELIVERABLES/01_EXECUTIVE_SUMMARY/EXECUTIVE_SUMMARY_CONSOLIDATED.md',
  lastUpdated: '2026-01-08',
  tags: ['executive', 'summary', 'gap analysis', 'risk', 'financial exposure'],
};

// ============================================================================
// ANALYSIS STATISTICS
// ============================================================================

export const ANALYSIS_STATISTICS = {
  documentsAnalyzed: 20,
  overallCoverage: 11.4,
  targetCoverage: 80,
  averageLiabilityScore: 2.12,
  targetLiabilityScore: 2.0,
  totalGaps: 1062,
  criticalGaps: 137,
  highGaps: 314,
  mediumGaps: 451,
  lowGaps: 160,
  riskLevel: 'ELEVATED',
  financialExposure: {
    bestCase: 0,
    likelyCase: { min: 500000, max: 2000000 },
    worstCase: { min: 5000000, max: 15000000 },
  },
  topRiskTriggers: [
    { name: 'Retro/Discretion Posture', plans: 19, impact: 19 },
    { name: 'Spiff/Bonus Employment Requirement', plans: 11, impact: 11 },
    { name: 'Management Discretion on Crediting', plans: 6, impact: 6 },
    { name: 'Earned-After-Deductions', plans: 6, impact: 12 },
    { name: 'No Dispute Timeline', plans: 6, impact: 6 },
  ],
  topGaps: [
    { policy: 'SCP-001', requirement: 'Approval Authority Matrix', severity: 'MEDIUM', plans: 20 },
    { policy: 'SCP-001', requirement: 'Recovery Mechanism', severity: 'HIGH', plans: 20 },
    { policy: 'SCP-001', requirement: 'Appeals Process', severity: 'MEDIUM', plans: 20 },
    { policy: 'SCP-002', requirement: 'Quota Setting Methodology', severity: 'MEDIUM', plans: 20 },
    { policy: 'SCP-002', requirement: 'Mid-Year Adjustment Governance', severity: 'HIGH', plans: 20 },
  ],
};

// ============================================================================
// COMBINED LIBRARY
// ============================================================================

export const ALL_GOVERNANCE_DOCUMENTS: GovernanceDocument[] = [
  ...POLICY_DOCUMENTS,
  ...TEMPLATE_DOCUMENTS,
  ...PATCH_TEMPLATE_DOCUMENTS,
  EXECUTIVE_SUMMARY,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDocumentsByType(type: DocumentType): GovernanceDocument[] {
  return ALL_GOVERNANCE_DOCUMENTS.filter(d => d.type === type);
}

export function getDocumentsByCategory(category: string): GovernanceDocument[] {
  return ALL_GOVERNANCE_DOCUMENTS.filter(d => d.category === category);
}

export function searchDocuments(query: string): GovernanceDocument[] {
  const lowerQuery = query.toLowerCase();
  return ALL_GOVERNANCE_DOCUMENTS.filter(d =>
    d.name.toLowerCase().includes(lowerQuery) ||
    d.description.toLowerCase().includes(lowerQuery) ||
    d.tags.some(tag => tag.includes(lowerQuery)) ||
    d.code.toLowerCase().includes(lowerQuery)
  );
}

export function getDocumentByCode(code: string): GovernanceDocument | undefined {
  return ALL_GOVERNANCE_DOCUMENTS.find(d => d.code === code);
}

export function getRelatedDocuments(code: string): GovernanceDocument[] {
  const doc = getDocumentByCode(code);
  if (!doc || !doc.relatedPolicies?.length) return [];

  return ALL_GOVERNANCE_DOCUMENTS.filter(d =>
    doc.relatedPolicies?.includes(d.code)
  );
}

// ============================================================================
// DOCUMENT LIBRARY SUMMARY (for RAG context)
// ============================================================================

export function buildDocumentLibrarySummary(): string {
  const policies = POLICY_DOCUMENTS.length;
  const templates = TEMPLATE_DOCUMENTS.length;
  const patches = PATCH_TEMPLATE_DOCUMENTS.length;

  return `## Document Library Summary

**Policies**: ${policies} governance policy documents
**Templates**: ${templates} administrative templates
**Patch Templates**: ${patches} remediation language templates

### Available Policies
${POLICY_DOCUMENTS.map(p => `- ${p.code}: ${p.name}`).join('\n')}

### Available Templates
${TEMPLATE_DOCUMENTS.slice(0, 6).map(t => `- ${t.code}: ${t.name}`).join('\n')}
... and ${templates - 6} more

### Analysis Results (20 Plans)
- Total Gaps: ${ANALYSIS_STATISTICS.totalGaps}
- Critical: ${ANALYSIS_STATISTICS.criticalGaps}
- Coverage: ${ANALYSIS_STATISTICS.overallCoverage}%
- Risk Level: ${ANALYSIS_STATISTICS.riskLevel}`;
}
