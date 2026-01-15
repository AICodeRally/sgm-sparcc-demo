/**
 * Audit Timeline - Governance Event History
 * Append-only event stream for compliance and traceability
 */

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'DOCUMENT_CREATED'
    | 'DOCUMENT_UPDATED'
    | 'DOCUMENT_APPROVED'
    | 'DOCUMENT_ARCHIVED'
    | 'APPROVAL_SUBMITTED'
    | 'APPROVAL_DECIDED'
    | 'CASE_OPENED'
    | 'CASE_UPDATED'
    | 'CASE_RESOLVED'
    | 'COMMITTEE_MEETING'
    | 'POLICY_EFFECTIVE'
    | 'POLICY_EXPIRED'
    | 'EXCEPTION_GRANTED'
    | 'DISPUTE_FILED'
    | 'USER_ACCESS_GRANTED'
    | 'USER_ACCESS_REVOKED';
  category: 'DOCUMENT' | 'APPROVAL' | 'CASE' | 'COMMITTEE' | 'POLICY' | 'ACCESS';
  actor: string;
  actorRole: string;
  targetType: 'DOCUMENT' | 'APPROVAL' | 'CASE' | 'POLICY' | 'USER' | 'COMMITTEE';
  targetId: string;
  targetName: string;
  action: string;
  description: string;
  metadata?: {
    [key: string]: any;
  };
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  committee?: 'SGCC' | 'CRB';
}

/**
 * Comprehensive audit event history
 */
export const AUDIT_EVENTS: AuditEvent[] = [
  // Recent events first (reverse chronological)
  {
    id: 'audit-001',
    timestamp: '2025-12-17T11:00:00.000Z',
    eventType: 'CASE_UPDATED',
    category: 'CASE',
    actor: 'Amanda Foster',
    actorRole: 'VP Sales Operations',
    targetType: 'CASE',
    targetId: 'case-001',
    targetName: 'CASE-2025-1201',
    action: 'Escalated to CRB',
    description: 'Territory change case escalated to CRB for review. Recommending $30K quota relief.',
    metadata: {
      caseType: 'TERRITORY_CHANGE',
      financialImpact: 30000,
      recommendation: 'Approve quota relief',
    },
    impactLevel: 'HIGH',
    committee: 'CRB',
  },
  {
    id: 'audit-002',
    timestamp: '2025-12-16T15:00:00.000Z',
    eventType: 'CASE_OPENED',
    category: 'CASE',
    actor: 'Thomas Anderson',
    actorRole: 'Account Executive',
    targetType: 'CASE',
    targetId: 'case-007',
    targetName: 'CASE-2025-1267',
    action: 'Exception Request Submitted',
    description: 'Draw repayment extension requested due to financial hardship. 3-month extension sought.',
    metadata: {
      caseType: 'EXCEPTION',
      financialImpact: 18000,
      outstandingBalance: 18000,
    },
    impactLevel: 'MEDIUM',
    committee: 'SGCC',
  },
  {
    id: 'audit-003',
    timestamp: '2025-12-15T14:30:00.000Z',
    eventType: 'APPROVAL_DECIDED',
    category: 'APPROVAL',
    actor: 'Michael Rodriguez',
    actorRole: 'CFO (Vice Chair)',
    targetType: 'APPROVAL',
    targetId: 'approval-001',
    targetName: 'Mid-Period Plan Change Policy - v2.0',
    action: 'Approved',
    description: 'CFO approved Mid-Period Plan Change Policy v2.0. Financial impact is acceptable.',
    metadata: {
      approvalType: 'POLICY',
      documentCode: 'SCP-017',
      committee: 'SGCC',
    },
    impactLevel: 'HIGH',
    committee: 'SGCC',
  },
  {
    id: 'audit-004',
    timestamp: '2025-12-15T10:00:00.000Z',
    eventType: 'APPROVAL_SUBMITTED',
    category: 'APPROVAL',
    actor: 'Sarah Chen',
    actorRole: 'VP Sales Compensation',
    targetType: 'APPROVAL',
    targetId: 'approval-001',
    targetName: 'Mid-Period Plan Change Policy - v2.0',
    action: 'Submitted for SGCC Approval',
    description: 'New policy governing mid-year compensation plan changes submitted to SGCC for review.',
    metadata: {
      approvalType: 'POLICY',
      documentCode: 'SCP-017',
      committee: 'SGCC',
      sla: '30 business days',
    },
    impactLevel: 'HIGH',
    committee: 'SGCC',
  },
  {
    id: 'audit-005',
    timestamp: '2025-12-14T09:00:00.000Z',
    eventType: 'CASE_OPENED',
    category: 'CASE',
    actor: 'Michael Torres',
    actorRole: 'VP Sales',
    targetType: 'CASE',
    targetId: 'case-005',
    targetName: 'CASE-2025-1256',
    action: 'Plan Modification Request',
    description: 'BDR to AE role transition requested for Christina Park, effective Jan 1.',
    metadata: {
      caseType: 'PLAN_MODIFICATION',
      affectedRep: 'Christina Park',
      effectiveDate: '2026-01-01',
    },
    impactLevel: 'MEDIUM',
    committee: 'SGCC',
  },
  {
    id: 'audit-006',
    timestamp: '2025-12-12T09:00:00.000Z',
    eventType: 'APPROVAL_SUBMITTED',
    category: 'APPROVAL',
    actor: 'Amanda Foster',
    actorRole: 'VP Sales Operations',
    targetType: 'APPROVAL',
    targetId: 'approval-002',
    targetName: 'Windfall Deal - Acme Corp $2.5M ARR',
    action: 'Submitted to CRB',
    description: 'Large enterprise deal submitted for windfall review. $2.5M ARR, $180K commission payout.',
    metadata: {
      approvalType: 'WINDFALL',
      dealId: 'OPP-2025-1247',
      dealAmount: 2500000,
      commissionAmount: 180000,
      repName: 'James Martinez',
    },
    impactLevel: 'CRITICAL',
    committee: 'CRB',
  },
  {
    id: 'audit-007',
    timestamp: '2025-12-11T10:15:00.000Z',
    eventType: 'APPROVAL_DECIDED',
    category: 'APPROVAL',
    actor: 'Sarah Chen',
    actorRole: 'SGCC Chair',
    targetType: 'APPROVAL',
    targetId: 'approval-003',
    targetName: 'Q1 2026 New Product Launch SPIF',
    action: 'Approved',
    description: 'Product launch SPIF approved. $40K budget, $500 per qualified deal.',
    metadata: {
      approvalType: 'SPIF',
      budget: 40000,
      incentivePerDeal: 500,
      product: 'Enterprise Security Suite',
    },
    impactLevel: 'MEDIUM',
    committee: 'SGCC',
  },
  {
    id: 'audit-008',
    timestamp: '2025-12-10T14:00:00.000Z',
    eventType: 'APPROVAL_SUBMITTED',
    category: 'APPROVAL',
    actor: 'Lisa Park',
    actorRole: 'Sales Compensation Manager',
    targetType: 'APPROVAL',
    targetId: 'approval-003',
    targetName: 'Q1 2026 New Product Launch SPIF',
    action: 'Submitted for Approval',
    description: 'Product launch incentive for Enterprise Security Suite submitted to SGCC. $40K budget.',
    metadata: {
      approvalType: 'SPIF',
      budget: 40000,
      committee: 'SGCC',
    },
    impactLevel: 'MEDIUM',
    committee: 'SGCC',
  },
  {
    id: 'audit-009',
    timestamp: '2025-12-09T15:00:00.000Z',
    eventType: 'CASE_RESOLVED',
    category: 'CASE',
    actor: 'Lisa Park',
    actorRole: 'Sales Compensation Manager',
    targetType: 'CASE',
    targetId: 'case-003',
    targetName: 'CASE-2025-1245',
    action: 'Case Resolved - Approved',
    description: 'SPIF eligibility exception approved. $500 credit added to Q4 commission run.',
    metadata: {
      caseType: 'EXCEPTION',
      decision: 'APPROVED',
      financialImpact: 500,
    },
    impactLevel: 'LOW',
  },
  {
    id: 'audit-010',
    timestamp: '2025-12-09T11:00:00.000Z',
    eventType: 'EXCEPTION_GRANTED',
    category: 'CASE',
    actor: 'Sarah Chen',
    actorRole: 'VP Sales Compensation',
    targetType: 'CASE',
    targetId: 'case-003',
    targetName: 'CASE-2025-1245',
    action: 'Exception Approved',
    description: 'Retroactive SPIF eligibility granted to Jennifer Martinez. Deal meets all criteria.',
    metadata: {
      caseType: 'EXCEPTION',
      affectedRep: 'Jennifer Martinez',
      amount: 500,
    },
    impactLevel: 'LOW',
  },
  {
    id: 'audit-011',
    timestamp: '2025-12-08T09:30:00.000Z',
    eventType: 'CASE_OPENED',
    category: 'CASE',
    actor: 'Mark Stevens',
    actorRole: 'Regional Sales Manager',
    targetType: 'CASE',
    targetId: 'case-001',
    targetName: 'CASE-2025-1201',
    action: 'Territory Change Case Submitted',
    description: 'Mid-quarter territory reassignment case filed for Lisa Johnson. $30K quota adjustment requested.',
    metadata: {
      caseType: 'TERRITORY_CHANGE',
      affectedRep: 'Lisa Johnson',
      financialImpact: 30000,
    },
    impactLevel: 'HIGH',
    committee: 'CRB',
  },
  {
    id: 'audit-012',
    timestamp: '2025-12-02T15:30:00.000Z',
    eventType: 'APPROVAL_DECIDED',
    category: 'APPROVAL',
    actor: 'Patricia Garcia',
    actorRole: 'Director of Finance',
    targetType: 'APPROVAL',
    targetId: 'approval-007',
    targetName: 'Windfall Deal - TechStart Inc',
    action: 'Approved with Cap',
    description: 'CRB approved windfall deal with commission cap at $80K (2x monthly target).',
    metadata: {
      approvalType: 'WINDFALL',
      dealId: 'OPP-2025-1189',
      originalCommission: 95000,
      cappedCommission: 80000,
      decision: 'Commission Cap',
    },
    impactLevel: 'HIGH',
    committee: 'CRB',
  },
  {
    id: 'audit-013',
    timestamp: '2025-12-02T15:00:00.000Z',
    eventType: 'APPROVAL_DECIDED',
    category: 'APPROVAL',
    actor: 'Sarah Chen',
    actorRole: 'CRB Chair',
    targetType: 'APPROVAL',
    targetId: 'approval-007',
    targetName: 'Windfall Deal - TechStart Inc',
    action: 'Approved with Cap',
    description: 'Deal is legitimate but payout is 2.5x target. Applying commission cap at $80K.',
    metadata: {
      approvalType: 'WINDFALL',
      dealId: 'OPP-2025-1189',
      decision: 'Commission Cap',
      cappedAmount: 80000,
    },
    impactLevel: 'HIGH',
    committee: 'CRB',
  },
  {
    id: 'audit-014',
    timestamp: '2025-11-28T14:00:00.000Z',
    eventType: 'DISPUTE_FILED',
    category: 'CASE',
    actor: 'Marcus Williams',
    actorRole: 'Account Executive',
    targetType: 'CASE',
    targetId: 'case-002',
    targetName: 'CASE-2025-1189',
    action: 'Commission Dispute Filed',
    description: 'Dispute filed regarding Q3 commission calculation on multi-year deal. $42K disputed.',
    metadata: {
      caseType: 'DISPUTE',
      financialImpact: 42000,
      dealId: 'OPP-2025-0987',
    },
    impactLevel: 'MEDIUM',
    committee: 'CRB',
  },
  {
    id: 'audit-015',
    timestamp: '2025-11-22T16:00:00.000Z',
    eventType: 'CASE_RESOLVED',
    category: 'CASE',
    actor: 'Amanda Foster',
    actorRole: 'VP Sales Operations',
    targetType: 'CASE',
    targetId: 'case-004',
    targetName: 'CASE-2025-1178',
    action: 'Case Closed - Approved',
    description: 'New hire ramp extension approved. Quota updated in system.',
    metadata: {
      caseType: 'QUOTA_ADJUSTMENT',
      decision: 'APPROVED',
      affectedRep: 'Robert Chen',
    },
    impactLevel: 'MEDIUM',
  },
  {
    id: 'audit-016',
    timestamp: '2025-11-22T14:00:00.000Z',
    eventType: 'EXCEPTION_GRANTED',
    category: 'CASE',
    actor: 'Sarah Chen',
    actorRole: 'SGCC Chair',
    targetType: 'CASE',
    targetId: 'case-004',
    targetName: 'CASE-2025-1178',
    action: 'SGCC Approval',
    description: 'Ramp extension approved for Robert Chen. Extended onboarding justified.',
    metadata: {
      caseType: 'QUOTA_ADJUSTMENT',
      affectedRep: 'Robert Chen',
      rampExtension: '1 month at 75%',
    },
    impactLevel: 'MEDIUM',
    committee: 'SGCC',
  },
  {
    id: 'audit-017',
    timestamp: '2025-11-20T09:00:00.000Z',
    eventType: 'APPROVAL_SUBMITTED',
    category: 'APPROVAL',
    actor: 'Amanda Foster',
    actorRole: 'VP Sales Operations',
    targetType: 'APPROVAL',
    targetId: 'approval-007',
    targetName: 'Windfall Deal - TechStart Inc',
    action: 'Submitted to CRB',
    description: 'Mid-market deal submitted for windfall review. $1.2M ARR, $95K commission.',
    metadata: {
      approvalType: 'WINDFALL',
      dealId: 'OPP-2025-1189',
      dealAmount: 1200000,
      commissionAmount: 95000,
      repName: 'Sarah Williams',
    },
    impactLevel: 'HIGH',
    committee: 'CRB',
  },
  {
    id: 'audit-018',
    timestamp: '2025-11-15T13:00:00.000Z',
    eventType: 'CASE_OPENED',
    category: 'CASE',
    actor: 'Angela Davis',
    actorRole: 'Sales Manager',
    targetType: 'CASE',
    targetId: 'case-004',
    targetName: 'CASE-2025-1178',
    action: 'Quota Adjustment Request',
    description: 'New hire ramp extension requested for Robert Chen. Delayed territory handoff.',
    metadata: {
      caseType: 'QUOTA_ADJUSTMENT',
      affectedRep: 'Robert Chen',
      financialImpact: 15000,
    },
    impactLevel: 'MEDIUM',
    committee: 'SGCC',
  },
  {
    id: 'audit-019',
    timestamp: '2025-10-28T15:00:00.000Z',
    eventType: 'CASE_RESOLVED',
    category: 'CASE',
    actor: 'Lisa Park',
    actorRole: 'Sales Compensation Manager',
    targetType: 'CASE',
    targetId: 'case-006',
    targetName: 'CASE-2025-1098',
    action: 'Case Closed - Denied',
    description: 'Commission dispute denied. SE role does not qualify for split credit per plan.',
    metadata: {
      caseType: 'DISPUTE',
      decision: 'DENIED',
      affectedRep: 'David Park',
    },
    impactLevel: 'LOW',
  },
  {
    id: 'audit-020',
    timestamp: '2025-10-28T11:00:00.000Z',
    eventType: 'APPROVAL_DECIDED',
    category: 'CASE',
    actor: 'Amanda Foster',
    actorRole: 'VP Sales Operations',
    targetType: 'CASE',
    targetId: 'case-006',
    targetName: 'CASE-2025-1098',
    action: 'Dispute Denied',
    description: 'Split credit request denied. SE compensation plan does not include split provisions.',
    metadata: {
      caseType: 'DISPUTE',
      decision: 'DENIED',
      affectedRep: 'David Park',
      financialImpact: 8000,
    },
    impactLevel: 'LOW',
  },
  {
    id: 'audit-021',
    timestamp: '2025-10-15T10:00:00.000Z',
    eventType: 'DISPUTE_FILED',
    category: 'CASE',
    actor: 'David Park',
    actorRole: 'Solutions Engineer',
    targetType: 'CASE',
    targetId: 'case-006',
    targetName: 'CASE-2025-1098',
    action: 'Dispute Filed',
    description: 'Q2 attainment dispute filed. Requesting split credit for support activity.',
    metadata: {
      caseType: 'DISPUTE',
      financialImpact: 8000,
    },
    impactLevel: 'LOW',
  },
  {
    id: 'audit-022',
    timestamp: '2025-01-01T00:00:00.000Z',
    eventType: 'POLICY_EFFECTIVE',
    category: 'POLICY',
    actor: 'System',
    actorRole: 'System',
    targetType: 'DOCUMENT',
    targetId: 'doc-001',
    targetName: 'GC-001 SGCC Charter',
    action: 'Policy Became Effective',
    description: 'Sales Compensation Governance Committee Charter became effective.',
    metadata: {
      documentCode: 'GC-001',
      documentType: 'FRAMEWORK',
      version: '1.0',
    },
    impactLevel: 'CRITICAL',
    committee: 'SGCC',
  },
];

/**
 * Audit statistics
 */
export const AUDIT_STATS = {
  totalEvents: AUDIT_EVENTS.length,
  last24Hours: AUDIT_EVENTS.filter(e => {
    const eventDate = new Date(e.timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return eventDate > yesterday;
  }).length,
  last7Days: AUDIT_EVENTS.filter(e => {
    const eventDate = new Date(e.timestamp);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return eventDate > lastWeek;
  }).length,
  byCategory: {
    DOCUMENT: AUDIT_EVENTS.filter(e => e.category === 'DOCUMENT').length,
    APPROVAL: AUDIT_EVENTS.filter(e => e.category === 'APPROVAL').length,
    CASE: AUDIT_EVENTS.filter(e => e.category === 'CASE').length,
    COMMITTEE: AUDIT_EVENTS.filter(e => e.category === 'COMMITTEE').length,
    POLICY: AUDIT_EVENTS.filter(e => e.category === 'POLICY').length,
    ACCESS: AUDIT_EVENTS.filter(e => e.category === 'ACCESS').length,
  },
  byImpact: {
    CRITICAL: AUDIT_EVENTS.filter(e => e.impactLevel === 'CRITICAL').length,
    HIGH: AUDIT_EVENTS.filter(e => e.impactLevel === 'HIGH').length,
    MEDIUM: AUDIT_EVENTS.filter(e => e.impactLevel === 'MEDIUM').length,
    LOW: AUDIT_EVENTS.filter(e => e.impactLevel === 'LOW').length,
  },
};

/**
 * Event type metadata for display
 */
export const EVENT_TYPE_INFO = {
  DOCUMENT_CREATED: { name: 'Document Created', category: 'DOCUMENT' },
  DOCUMENT_UPDATED: { name: 'Document Updated', category: 'DOCUMENT' },
  DOCUMENT_APPROVED: { name: 'Document Approved', category: 'DOCUMENT' },
  DOCUMENT_ARCHIVED: { name: 'Document Archived', category: 'DOCUMENT' },
  APPROVAL_SUBMITTED: { name: 'Approval Submitted', category: 'APPROVAL' },
  APPROVAL_DECIDED: { name: 'Approval Decided', category: 'APPROVAL' },
  CASE_OPENED: { name: 'Case Opened', category: 'CASE' },
  CASE_UPDATED: { name: 'Case Updated', category: 'CASE' },
  CASE_RESOLVED: { name: 'Case Resolved', category: 'CASE' },
  COMMITTEE_MEETING: { name: 'Committee Meeting', category: 'COMMITTEE' },
  POLICY_EFFECTIVE: { name: 'Policy Effective', category: 'POLICY' },
  POLICY_EXPIRED: { name: 'Policy Expired', category: 'POLICY' },
  EXCEPTION_GRANTED: { name: 'Exception Granted', category: 'CASE' },
  DISPUTE_FILED: { name: 'Dispute Filed', category: 'CASE' },
  USER_ACCESS_GRANTED: { name: 'Access Granted', category: 'ACCESS' },
  USER_ACCESS_REVOKED: { name: 'Access Revoked', category: 'ACCESS' },
};
