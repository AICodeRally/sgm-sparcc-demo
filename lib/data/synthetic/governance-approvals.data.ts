/**
 * Approval Workflow Synthetic Data - SPARCC Governance
 * Based on SGCC and CRB approval thresholds
 */

import type { DataType, DemoMetadata } from '@/lib/contracts/data-type.contract';

export interface ApprovalItem {
  id: string;
  type: 'POLICY' | 'SPIF' | 'WINDFALL' | 'EXCEPTION' | 'DOCUMENT';
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  committee: 'SGCC' | 'CRB';
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  amount?: number; // For SPIF/Exception/Windfall
  documentCode?: string;
  dealId?: string;
  repName?: string;
  approvers: {
    id: string;
    name: string;
    role: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decidedAt?: string;
    comments?: string;
  }[];
  currentStep: number;
  totalSteps: number;
  slaStatus: 'ON_TIME' | 'AT_RISK' | 'OVERDUE';
  businessDaysRemaining: number;
  // Data Type (demo, template, or client)
  dataType?: DataType;
  demoMetadata?: DemoMetadata;
}

/**
 * Sample approval items across different workflows
 */
export const APPROVAL_ITEMS: ApprovalItem[] = [
  // SGCC Policy Approval
  {
    id: 'approval-001',
    type: 'POLICY',
    title: 'Mid-Period Plan Change Policy - v2.0',
    description: 'New policy governing mid-year compensation plan changes with grandfathering rules',
    requestedBy: 'Sarah Chen (VP Sales Compensation)',
    requestedAt: '2025-12-15T10:00:00.000Z',
    committee: 'SGCC',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    dueDate: '2026-01-14T17:00:00.000Z', // 30 days
    documentCode: 'SCP-017',
    approvers: [
      {
        id: 'approver-001',
        name: 'Michael Rodriguez',
        role: 'CFO (Vice Chair)',
        status: 'APPROVED',
        decidedAt: '2025-12-16T14:30:00.000Z',
        comments: 'Financial impact is acceptable. Approved.',
      },
      {
        id: 'approver-002',
        name: 'David Thompson',
        role: 'General Counsel',
        status: 'PENDING',
      },
      {
        id: 'approver-003',
        name: 'Jennifer Williams',
        role: 'CHRO',
        status: 'PENDING',
      },
    ],
    currentStep: 1,
    totalSteps: 5,
    slaStatus: 'ON_TIME',
    businessDaysRemaining: 22,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },

  // CRB Windfall Deal
  {
    id: 'approval-002',
    type: 'WINDFALL',
    title: 'Windfall Deal Review - Acme Corp $2.5M ARR',
    description: 'Large enterprise deal: $2.5M ARR, 3-year contract, $180K commission payout to James Martinez',
    requestedBy: 'Amanda Foster (VP Sales Operations)',
    requestedAt: '2025-12-12T09:00:00.000Z',
    committee: 'CRB',
    status: 'PENDING',
    priority: 'URGENT',
    dueDate: '2026-01-08T17:00:00.000Z', // 20 business days
    amount: 180000,
    dealId: 'OPP-2025-1247',
    repName: 'James Martinez',
    approvers: [
      {
        id: 'approver-004',
        name: 'Sarah Chen',
        role: 'CRB Chair',
        status: 'PENDING',
      },
      {
        id: 'approver-005',
        name: 'Patricia Garcia',
        role: 'Director of Finance',
        status: 'PENDING',
      },
      {
        id: 'approver-006',
        name: 'Amanda Foster',
        role: 'VP Sales Operations',
        status: 'PENDING',
      },
    ],
    currentStep: 0,
    totalSteps: 1,
    slaStatus: 'AT_RISK',
    businessDaysRemaining: 5,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },

  // SGCC SPIF Approval (<$50K)
  {
    id: 'approval-003',
    type: 'SPIF',
    title: 'Q1 2026 New Product Launch SPIF',
    description: 'Product launch incentive for Enterprise Security Suite: $500 per qualified deal, $40K total budget',
    requestedBy: 'Lisa Park (Sales Compensation Manager)',
    requestedAt: '2025-12-10T14:00:00.000Z',
    committee: 'SGCC',
    status: 'APPROVED',
    priority: 'MEDIUM',
    dueDate: '2025-12-17T17:00:00.000Z', // 5 business days
    amount: 40000,
    approvers: [
      {
        id: 'approver-007',
        name: 'Sarah Chen',
        role: 'SGCC Chair',
        status: 'APPROVED',
        decidedAt: '2025-12-11T10:15:00.000Z',
        comments: 'Aligned with product GTM strategy. Approved.',
      },
    ],
    currentStep: 1,
    totalSteps: 1,
    slaStatus: 'ON_TIME',
    businessDaysRemaining: 0,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },

  // SGCC Large SPIF ($50K-$250K) - Requires CFO
  {
    id: 'approval-004',
    type: 'SPIF',
    title: 'H1 2026 Territory Expansion SPIF',
    description: 'Accelerator for reps opening new named accounts in expansion territories: $150K total budget',
    requestedBy: 'Robert Kim (Chief Sales Officer)',
    requestedAt: '2025-12-14T11:00:00.000Z',
    committee: 'SGCC',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    dueDate: '2025-12-28T17:00:00.000Z', // 10 business days
    amount: 150000,
    approvers: [
      {
        id: 'approver-008',
        name: 'Sarah Chen',
        role: 'SGCC Chair',
        status: 'APPROVED',
        decidedAt: '2025-12-15T09:00:00.000Z',
        comments: 'Strategic initiative. Approved pending CFO sign-off.',
      },
      {
        id: 'approver-009',
        name: 'Michael Rodriguez',
        role: 'CFO',
        status: 'PENDING',
      },
    ],
    currentStep: 1,
    totalSteps: 2,
    slaStatus: 'ON_TIME',
    businessDaysRemaining: 7,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },

  // CRB Exception Request
  {
    id: 'approval-005',
    type: 'EXCEPTION',
    title: 'Territory Adjustment Exception - Lisa Johnson',
    description: 'Request to adjust Q4 quota by $30K due to mid-quarter territory reassignment impacting pipeline',
    requestedBy: 'Amanda Foster (VP Sales Operations)',
    requestedAt: '2025-12-08T13:00:00.000Z',
    committee: 'CRB',
    status: 'NEEDS_INFO',
    priority: 'MEDIUM',
    dueDate: '2025-12-29T17:00:00.000Z', // 15 business days
    amount: 30000,
    repName: 'Lisa Johnson',
    approvers: [
      {
        id: 'approver-010',
        name: 'Sarah Chen',
        role: 'CRB Chair',
        status: 'PENDING',
        comments: 'Need additional pipeline impact analysis before decision.',
      },
    ],
    currentStep: 0,
    totalSteps: 1,
    slaStatus: 'ON_TIME',
    businessDaysRemaining: 10,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },

  // SGCC Document Approval
  {
    id: 'approval-006',
    type: 'DOCUMENT',
    title: 'Draws & Guarantees Policy',
    description: 'New policy governing draw requests, guarantee terms, and repayment obligations for new hires',
    requestedBy: 'Lisa Park (Sales Compensation Manager)',
    requestedAt: '2025-12-05T10:00:00.000Z',
    committee: 'SGCC',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    dueDate: '2026-01-04T17:00:00.000Z', // 30 days
    documentCode: 'SCP-016',
    approvers: [
      {
        id: 'approver-011',
        name: 'Michael Rodriguez',
        role: 'CFO',
        status: 'APPROVED',
        decidedAt: '2025-12-09T11:00:00.000Z',
      },
      {
        id: 'approver-012',
        name: 'Jennifer Williams',
        role: 'CHRO',
        status: 'APPROVED',
        decidedAt: '2025-12-10T14:30:00.000Z',
      },
      {
        id: 'approver-013',
        name: 'David Thompson',
        role: 'General Counsel',
        status: 'PENDING',
      },
    ],
    currentStep: 2,
    totalSteps: 5,
    slaStatus: 'ON_TIME',
    businessDaysRemaining: 18,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },

  // CRB Windfall - Already Decided
  {
    id: 'approval-007',
    type: 'WINDFALL',
    title: 'Windfall Deal Review - TechStart Inc $1.2M ARR',
    description: 'Mid-market deal: $1.2M ARR, 2-year contract, $95K commission to Sarah Williams. Decision: Commission Cap at $80K.',
    requestedBy: 'Amanda Foster (VP Sales Operations)',
    requestedAt: '2025-11-20T09:00:00.000Z',
    committee: 'CRB',
    status: 'APPROVED',
    priority: 'HIGH',
    dueDate: '2025-12-18T17:00:00.000Z',
    amount: 95000,
    dealId: 'OPP-2025-1189',
    repName: 'Sarah Williams',
    approvers: [
      {
        id: 'approver-014',
        name: 'Sarah Chen',
        role: 'CRB Chair',
        status: 'APPROVED',
        decidedAt: '2025-12-02T15:00:00.000Z',
        comments: 'Deal is legitimate but payout is 2.5x target. Applying commission cap at $80K (2x monthly target).',
      },
      {
        id: 'approver-015',
        name: 'Patricia Garcia',
        role: 'Director of Finance',
        status: 'APPROVED',
        decidedAt: '2025-12-02T15:30:00.000Z',
        comments: 'Concur with cap. Financial impact acceptable.',
      },
    ],
    currentStep: 1,
    totalSteps: 1,
    slaStatus: 'ON_TIME',
    businessDaysRemaining: 0,
    dataType: 'demo',
    demoMetadata: { year: 2025, bu: "SPARCC", division: "Governance", category: "Sample Data" },
  },
];

/**
 * Summary stats for approvals dashboard
 */
export const APPROVAL_STATS = {
  pending: APPROVAL_ITEMS.filter(a => a.status === 'PENDING').length,
  inReview: APPROVAL_ITEMS.filter(a => a.status === 'IN_REVIEW').length,
  approved: APPROVAL_ITEMS.filter(a => a.status === 'APPROVED').length,
  rejected: APPROVAL_ITEMS.filter(a => a.status === 'REJECTED').length,
  needsInfo: APPROVAL_ITEMS.filter(a => a.status === 'NEEDS_INFO').length,
  atRisk: APPROVAL_ITEMS.filter(a => a.slaStatus === 'AT_RISK' && a.status !== 'APPROVED' && a.status !== 'REJECTED').length,
  overdue: APPROVAL_ITEMS.filter(a => a.slaStatus === 'OVERDUE').length,
};

/**
 * CRB Decision Options (reference for windfall approvals)
 */
export const CRB_WINDFALL_DECISIONS = [
  { id: 'full-payment', name: 'Full Payment', description: 'No modification to commission' },
  { id: 'commission-cap', name: 'Commission Cap', description: '2x target monthly incentive or $250K max' },
  { id: 'amortization', name: 'Amortization', description: 'Spread over contract term (up to 36 months)' },
  { id: 'split-credit', name: 'Split Credit', description: 'Split among multiple contributors' },
  { id: 'special-bonus', name: 'Special Recognition Bonus', description: 'Fixed bonus $25K-$100K' },
  { id: 'no-payment', name: 'No Payment', description: 'Questionable or non-compliant deal' },
];
