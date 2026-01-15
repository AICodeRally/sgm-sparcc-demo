/**
 * Cases - Exception Requests, Disputes, Territory Changes
 * SPARCC Sales Compensation Governance
 */

import type { DataType, DemoMetadata } from '@/lib/contracts/data-type.contract';

export interface CaseItem {
  id: string;
  caseNumber: string;
  type: 'EXCEPTION' | 'DISPUTE' | 'TERRITORY_CHANGE' | 'PLAN_MODIFICATION' | 'QUOTA_ADJUSTMENT';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  affectedRep?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'PENDING_INFO' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  committee?: 'SGCC' | 'CRB';
  relatedDealId?: string;
  financialImpact?: number;
  resolutionDueDate: string;
  businessDaysElapsed: number;
  timeline: {
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
  resolution?: {
    decision: string;
    decidedBy: string;
    decidedAt: string;
    rationale: string;
  };
  attachments?: {
    name: string;
    type: string;
    uploadedAt: string;
  }[];
  // Data Type (demo, template, or client)
  dataType?: DataType;
  demoMetadata?: DemoMetadata;
}

/**
 * Sample cases covering different scenarios
 */
export const CASE_ITEMS: CaseItem[] = [
  // Territory Change - Active
  {
    id: 'case-001',
    caseNumber: 'CASE-2025-1201',
    type: 'TERRITORY_CHANGE',
    title: 'Mid-Quarter Territory Reassignment - Lisa Johnson',
    description: 'Request to adjust Q4 quota by $30K due to mid-quarter territory reassignment. Rep lost 3 key accounts (combined $85K pipeline) to new territory owner. Seeking quota relief and pipeline credit adjustment.',
    submittedBy: 'Mark Stevens (Regional Sales Manager)',
    submittedAt: '2025-12-08T09:30:00.000Z',
    affectedRep: 'Lisa Johnson',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    assignedTo: 'Amanda Foster (VP Sales Operations)',
    committee: 'CRB',
    financialImpact: 30000,
    resolutionDueDate: '2025-12-22T17:00:00.000Z',
    businessDaysElapsed: 7,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-12-08T09:30:00.000Z',
        action: 'Case Submitted',
        actor: 'Mark Stevens',
        notes: 'Initial submission with territory change documentation',
      },
      {
        timestamp: '2025-12-09T14:00:00.000Z',
        action: 'Assigned to Sales Operations',
        actor: 'System',
      },
      {
        timestamp: '2025-12-10T10:30:00.000Z',
        action: 'Pipeline Analysis Requested',
        actor: 'Amanda Foster',
        notes: 'Need detailed breakdown of lost opportunities and timeline impact',
      },
      {
        timestamp: '2025-12-12T16:00:00.000Z',
        action: 'Supporting Documentation Uploaded',
        actor: 'Mark Stevens',
        notes: 'Attached pipeline report and territory map changes',
      },
      {
        timestamp: '2025-12-15T11:00:00.000Z',
        action: 'Escalated to CRB',
        actor: 'Amanda Foster',
        notes: 'Recommending $30K quota relief. Will present to CRB on 12/20.',
      },
    ],
    attachments: [
      {
        name: 'Territory_Reassignment_Q4_2025.pdf',
        type: 'PDF',
        uploadedAt: '2025-12-08T09:30:00.000Z',
      },
      {
        name: 'Pipeline_Impact_Analysis.xlsx',
        type: 'Excel',
        uploadedAt: '2025-12-12T16:00:00.000Z',
      },
    ],
  },

  // Dispute - Commission Calculation Error
  {
    id: 'case-002',
    caseNumber: 'CASE-2025-1189',
    type: 'DISPUTE',
    title: 'Commission Calculation Dispute - Multi-Year Deal Credit',
    description: 'Rep disputes Q3 commission payout. Deal was structured as 3-year contract but only Year 1 ARR was credited. Rep believes full contract value should count per plan document. Finance disagrees citing standard booking policy.',
    submittedBy: 'Marcus Williams (Account Executive)',
    submittedAt: '2025-11-28T14:00:00.000Z',
    affectedRep: 'Marcus Williams',
    status: 'PENDING_INFO',
    priority: 'MEDIUM',
    assignedTo: 'Lisa Park (Sales Compensation Manager)',
    committee: 'CRB',
    relatedDealId: 'OPP-2025-0987',
    financialImpact: 42000,
    resolutionDueDate: '2025-12-20T17:00:00.000Z',
    businessDaysElapsed: 14,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-11-28T14:00:00.000Z',
        action: 'Dispute Filed',
        actor: 'Marcus Williams',
        notes: 'Formal dispute regarding Q3 commission calculation',
      },
      {
        timestamp: '2025-11-29T10:00:00.000Z',
        action: 'Initial Review',
        actor: 'Lisa Park',
        notes: 'Reviewing plan document and deal structure',
      },
      {
        timestamp: '2025-12-03T13:30:00.000Z',
        action: 'Finance Review Requested',
        actor: 'Lisa Park',
      },
      {
        timestamp: '2025-12-06T16:00:00.000Z',
        action: 'Additional Information Requested',
        actor: 'Patricia Garcia (Director of Finance)',
        notes: 'Need signed order form and booking confirmation from Deal Desk',
      },
      {
        timestamp: '2025-12-10T11:00:00.000Z',
        action: 'Documentation Provided',
        actor: 'Marcus Williams',
        notes: 'Uploaded signed contract and booking email trail',
      },
      {
        timestamp: '2025-12-13T09:00:00.000Z',
        action: 'Under Review',
        actor: 'Lisa Park',
        notes: 'Comparing contract terms against plan language. Will escalate to CRB if needed.',
      },
    ],
    attachments: [
      {
        name: 'Signed_Contract_Acme_Corp.pdf',
        type: 'PDF',
        uploadedAt: '2025-11-28T14:00:00.000Z',
      },
      {
        name: 'Q3_Commission_Statement.pdf',
        type: 'PDF',
        uploadedAt: '2025-11-28T14:00:00.000Z',
      },
      {
        name: 'Deal_Desk_Booking_Confirmation.pdf',
        type: 'PDF',
        uploadedAt: '2025-12-10T11:00:00.000Z',
      },
    ],
  },

  // Exception Request - Plan Interpretation
  {
    id: 'case-003',
    caseNumber: 'CASE-2025-1245',
    title: 'SPIF Eligibility Exception - Retroactive Qualification',
    description: 'Rep closed deal on Dec 1 that qualifies for Q1 Product Launch SPIF announced Nov 20. Rep was unaware of SPIF until Dec 5. Requesting retroactive eligibility since deal closed within program window.',
    submittedBy: 'Jennifer Martinez (Account Executive)',
    submittedAt: '2025-12-06T10:00:00.000Z',
    affectedRep: 'Jennifer Martinez',
    type: 'EXCEPTION',
    status: 'RESOLVED',
    priority: 'LOW',
    assignedTo: 'Lisa Park (Sales Compensation Manager)',
    financialImpact: 500,
    resolutionDueDate: '2025-12-13T17:00:00.000Z',
    businessDaysElapsed: 9,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-12-06T10:00:00.000Z',
        action: 'Exception Request Submitted',
        actor: 'Jennifer Martinez',
      },
      {
        timestamp: '2025-12-06T14:00:00.000Z',
        action: 'Reviewed by Compensation Team',
        actor: 'Lisa Park',
        notes: 'SPIF was communicated via email and Slack on Nov 20. Checking deal qualification criteria.',
      },
      {
        timestamp: '2025-12-09T11:00:00.000Z',
        action: 'Approved',
        actor: 'Sarah Chen (VP Sales Compensation)',
        notes: 'Deal meets all SPIF criteria. Approving exception - retroactive credit granted.',
      },
      {
        timestamp: '2025-12-09T15:00:00.000Z',
        action: 'Case Resolved',
        actor: 'Lisa Park',
        notes: '$500 SPIF credit added to Q4 commission run',
      },
    ],
    resolution: {
      decision: 'APPROVED',
      decidedBy: 'Sarah Chen (VP Sales Compensation)',
      decidedAt: '2025-12-09T11:00:00.000Z',
      rationale: 'Deal meets all SPIF qualification criteria (new product, qualified deal size, closed within program window). While rep was not aware of SPIF at time of close, the program was properly communicated and deal is legitimate. Approving retroactive credit per standard exception policy.',
    },
  },

  // Quota Adjustment - New Hire Ramp
  {
    id: 'case-004',
    caseNumber: 'CASE-2025-1178',
    type: 'QUOTA_ADJUSTMENT',
    title: 'New Hire Ramp Extension - Robert Chen',
    description: 'New AE started Aug 1 with standard 90-day ramp (50%/75%/100%). Requesting 1-month extension at 75% due to extended onboarding for complex enterprise segment and delayed territory handoff from previous rep.',
    submittedBy: 'Angela Davis (Sales Manager)',
    submittedAt: '2025-11-15T13:00:00.000Z',
    affectedRep: 'Robert Chen',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    assignedTo: 'Amanda Foster (VP Sales Operations)',
    committee: 'SGCC',
    financialImpact: 15000,
    resolutionDueDate: '2025-11-29T17:00:00.000Z',
    businessDaysElapsed: 10,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-11-15T13:00:00.000Z',
        action: 'Adjustment Request Submitted',
        actor: 'Angela Davis',
        notes: 'Request to extend ramp by 1 month (add 75% period)',
      },
      {
        timestamp: '2025-11-18T10:00:00.000Z',
        action: 'HR Onboarding Records Reviewed',
        actor: 'Amanda Foster',
        notes: 'Confirmed delayed territory assignment and extended training period',
      },
      {
        timestamp: '2025-11-20T15:00:00.000Z',
        action: 'Escalated to SGCC',
        actor: 'Amanda Foster',
        notes: 'Recommending approval. Ramp extension aligns with actual onboarding timeline.',
      },
      {
        timestamp: '2025-11-22T14:00:00.000Z',
        action: 'SGCC Approval',
        actor: 'Sarah Chen (SGCC Chair)',
        notes: 'Approved 1-month extension at 75% quota',
      },
      {
        timestamp: '2025-11-22T16:00:00.000Z',
        action: 'Case Closed',
        actor: 'Amanda Foster',
        notes: 'Quota updated in system. Rep notified of new ramp schedule.',
      },
    ],
    resolution: {
      decision: 'APPROVED',
      decidedBy: 'Sarah Chen (SGCC Chair)',
      decidedAt: '2025-11-22T14:00:00.000Z',
      rationale: 'Extended onboarding was legitimate due to territory complexity and handoff timing. Standard policy allows for ramp adjustments when onboarding extends beyond normal timeline. Approved 1-month extension at 75% quota (November). Rep moves to 100% quota in December.',
    },
  },

  // Plan Modification - Mid-Year Change
  {
    id: 'case-005',
    caseNumber: 'CASE-2025-1256',
    type: 'PLAN_MODIFICATION',
    title: 'Role Change: BDR to AE Mid-Year Transition',
    description: 'BDR promoted to AE role effective Jan 1. Requesting mid-year plan transition with quota proration and commission plan change. Need to finalize before Q1 kickoff.',
    submittedBy: 'Michael Torres (VP Sales)',
    submittedAt: '2025-12-14T09:00:00.000Z',
    affectedRep: 'Christina Park',
    status: 'ESCALATED',
    priority: 'URGENT',
    assignedTo: 'Sarah Chen (VP Sales Compensation)',
    committee: 'SGCC',
    financialImpact: 0, // No retroactive impact
    resolutionDueDate: '2025-12-20T17:00:00.000Z',
    businessDaysElapsed: 3,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-12-14T09:00:00.000Z',
        action: 'Plan Change Request Submitted',
        actor: 'Michael Torres',
        notes: 'Promotion approved by HR. Need comp plan transition for Jan 1 start.',
      },
      {
        timestamp: '2025-12-14T14:00:00.000Z',
        action: 'Initial Review',
        actor: 'Lisa Park',
        notes: 'Standard BDR to AE transition. Preparing plan comparison and territory assignment.',
      },
      {
        timestamp: '2025-12-16T10:00:00.000Z',
        action: 'Escalated to VP Compensation',
        actor: 'Lisa Park',
        notes: 'Territory overlap with existing AE. Need SGCC approval for territory adjustment.',
      },
      {
        timestamp: '2025-12-17T11:00:00.000Z',
        action: 'SGCC Review Scheduled',
        actor: 'Sarah Chen',
        notes: 'Will review at emergency SGCC session 12/19. Need territory coverage plan finalized.',
      },
    ],
  },

  // Dispute - Performance Metric Dispute (Closed)
  {
    id: 'case-006',
    caseNumber: 'CASE-2025-1098',
    type: 'DISPUTE',
    title: 'Q2 Attainment Calculation - Activity Credit Dispute',
    description: 'Rep disputes Q2 attainment calculation. Two deals closed by other reps but rep provided significant support (demos, technical calls, customer intros). Believes support activity warrants split credit per overlay support policy.',
    submittedBy: 'David Park (Solutions Engineer)',
    submittedAt: '2025-10-15T10:00:00.000Z',
    affectedRep: 'David Park',
    status: 'CLOSED',
    priority: 'LOW',
    assignedTo: 'Lisa Park (Sales Compensation Manager)',
    financialImpact: 8000,
    resolutionDueDate: '2025-11-05T17:00:00.000Z',
    businessDaysElapsed: 15,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-10-15T10:00:00.000Z',
        action: 'Dispute Filed',
        actor: 'David Park',
      },
      {
        timestamp: '2025-10-18T14:00:00.000Z',
        action: 'Activity Records Reviewed',
        actor: 'Lisa Park',
        notes: 'Reviewed SFDC activity logs and meeting notes',
      },
      {
        timestamp: '2025-10-22T16:00:00.000Z',
        action: 'Manager Input Requested',
        actor: 'Lisa Park',
        notes: 'Requested input from AE managers on both deals',
      },
      {
        timestamp: '2025-10-28T11:00:00.000Z',
        action: 'Denied',
        actor: 'Amanda Foster (VP Sales Operations)',
        notes: 'SE role does not qualify for split credit per plan document. Standard SE compensation applies.',
      },
      {
        timestamp: '2025-10-28T15:00:00.000Z',
        action: 'Case Closed',
        actor: 'Lisa Park',
        notes: 'Rep notified of decision. Explained SE compensation structure and split credit policy.',
      },
    ],
    resolution: {
      decision: 'DENIED',
      decidedBy: 'Amanda Foster (VP Sales Operations)',
      decidedAt: '2025-10-28T11:00:00.000Z',
      rationale: 'While SE provided valuable technical support, the SE compensation plan does not include split credit provisions. SE role has separate quota and commission structure. Split credit policy applies only to Account Executives with overlapping territory coverage. Decision aligns with standard policy interpretation.',
    },
  },

  // Exception - Draw Repayment Extension
  {
    id: 'case-007',
    caseNumber: 'CASE-2025-1267',
    type: 'EXCEPTION',
    title: 'Draw Repayment Extension Request - Financial Hardship',
    description: 'Rep on guaranteed draw plan requesting 3-month extension on repayment schedule due to unexpected medical expenses. Standard repayment period ends Dec 31. Seeking extension through March 31.',
    submittedBy: 'Thomas Anderson (Account Executive)',
    submittedAt: '2025-12-16T15:00:00.000Z',
    affectedRep: 'Thomas Anderson',
    status: 'NEW',
    priority: 'MEDIUM',
    assignedTo: 'Lisa Park (Sales Compensation Manager)',
    committee: 'SGCC',
    financialImpact: 18000, // Outstanding draw balance
    resolutionDueDate: '2025-12-27T17:00:00.000Z',
    businessDaysElapsed: 1,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
    timeline: [
      {
        timestamp: '2025-12-16T15:00:00.000Z',
        action: 'Exception Request Submitted',
        actor: 'Thomas Anderson',
        notes: 'Requesting repayment extension with supporting documentation',
      },
      {
        timestamp: '2025-12-17T09:00:00.000Z',
        action: 'Assigned to Compensation Manager',
        actor: 'System',
      },
    ],
    attachments: [
      {
        name: 'Current_Repayment_Schedule.pdf',
        type: 'PDF',
        uploadedAt: '2025-12-16T15:00:00.000Z',
      },
      {
        name: 'Hardship_Documentation.pdf',
        type: 'PDF',
        uploadedAt: '2025-12-16T15:00:00.000Z',
      },
    ],
  },
];

/**
 * Case statistics for dashboard
 */
export const CASE_STATS = {
  new: CASE_ITEMS.filter(c => c.status === 'NEW').length,
  underReview: CASE_ITEMS.filter(c => c.status === 'UNDER_REVIEW').length,
  pendingInfo: CASE_ITEMS.filter(c => c.status === 'PENDING_INFO').length,
  escalated: CASE_ITEMS.filter(c => c.status === 'ESCALATED').length,
  resolved: CASE_ITEMS.filter(c => c.status === 'RESOLVED').length,
  closed: CASE_ITEMS.filter(c => c.status === 'CLOSED').length,
  avgResolutionDays: 10.5, // Average across all resolved cases
};

/**
 * Case type metadata
 */
export const CASE_TYPE_INFO = {
  EXCEPTION: {
    name: 'Exception Request',
    description: 'Request for exception to standard policy or plan rules',
    exampleScenarios: ['SPIF retroactive eligibility', 'Draw repayment extension', 'Policy interpretation'],
  },
  DISPUTE: {
    name: 'Compensation Dispute',
    description: 'Disagreement over commission calculation or plan interpretation',
    exampleScenarios: ['Commission calculation error', 'Credit allocation dispute', 'Attainment calculation'],
  },
  TERRITORY_CHANGE: {
    name: 'Territory Change',
    description: 'Adjustment needed due to territory reassignment or coverage change',
    exampleScenarios: ['Mid-quarter territory loss', 'Account reassignment', 'Coverage overlap'],
  },
  QUOTA_ADJUSTMENT: {
    name: 'Quota Adjustment',
    description: 'Request to modify quota due to special circumstances',
    exampleScenarios: ['New hire ramp extension', 'Territory size adjustment', 'Market condition impact'],
  },
  PLAN_MODIFICATION: {
    name: 'Plan Modification',
    description: 'Mid-year change to compensation plan due to role or assignment change',
    exampleScenarios: ['Role change', 'Promotion', 'Plan transition'],
  },
};
