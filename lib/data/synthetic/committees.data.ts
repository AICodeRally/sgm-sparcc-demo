/**
 * SPARCC Governance Committees
 */

import type { DataType, DemoMetadata } from '@/lib/contracts/data-type.contract';

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  title: string;
  email: string;
  department: string;
  isVoting: boolean;
  joinedDate: string;
}

export interface Committee {
  id: string;
  code: string;
  name: string;
  description: string;
  purpose: string;
  authority: string[];
  members: CommitteeMember[];
  meetingCadence: string;
  quorumRequirement: string;
  charterDocument: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  // Data Type (demo, template, or client)
  dataType?: DataType;
  demoMetadata?: DemoMetadata;
}

export interface CRBDecisionOption {
  id: string;
  name: string;
  description: string;
  rationale: string;
  example: string;
}

/**
 * Sales Compensation Governance Committee (SGCC)
 * 7 voting members - GC-001 Charter
 */
export const SGCC_COMMITTEE: Committee = {
  id: 'committee-sgcc',
  code: 'SGCC',
  name: 'Sales Compensation Governance Committee',
  description: 'Establishes and oversees the governance framework for all sales compensation programs',
  purpose: 'Responsible for establishing, maintaining, and improving the sales compensation governance framework. Ensures all compensation plans, policies, and procedures are fair, compliant, transparent, and aligned with business strategy.',
  authority: [
    'Approve new compensation plans and significant plan changes',
    'Approve all compensation policies and procedures',
    'Establish approval thresholds for exceptions and SPIFs',
    'Review and resolve compensation disputes requiring escalation',
    'Recommend plan changes to executive leadership',
    'Establish governance standards and best practices',
  ],
  members: [
    {
      id: 'member-sgcc-001',
      name: 'Sarah Chen',
      role: 'Chair',
      title: 'VP Sales Compensation',
      email: 'sarah.chen@sparcc.demo',
      department: 'Sales Operations',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-002',
      name: 'Michael Rodriguez',
      role: 'Vice Chair',
      title: 'Chief Financial Officer',
      email: 'michael.rodriguez@sparcc.demo',
      department: 'Finance',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-003',
      name: 'Jennifer Williams',
      role: 'Member',
      title: 'Chief Human Resources Officer',
      email: 'jennifer.williams@sparcc.demo',
      department: 'Human Resources',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-004',
      name: 'David Thompson',
      role: 'Member',
      title: 'General Counsel',
      email: 'david.thompson@sparcc.demo',
      department: 'Legal',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-005',
      name: 'Robert Kim',
      role: 'Member',
      title: 'Chief Sales Officer',
      email: 'robert.kim@sparcc.demo',
      department: 'Sales',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-006',
      name: 'Amanda Foster',
      role: 'Member',
      title: 'VP Sales Operations',
      email: 'amanda.foster@sparcc.demo',
      department: 'Sales Operations',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-007',
      name: 'James Martinez',
      role: 'Member',
      title: 'Regional Sales Director (Rotating)',
      email: 'james.martinez@sparcc.demo',
      department: 'Sales',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-008',
      name: 'Lisa Park',
      role: 'Secretary (Non-Voting)',
      title: 'Sales Compensation Manager',
      email: 'lisa.park@sparcc.demo',
      department: 'Sales Operations',
      isVoting: false,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-sgcc-009',
      name: 'Kevin Nguyen',
      role: 'Advisor (Non-Voting)',
      title: 'Compensation Administrator',
      email: 'kevin.nguyen@sparcc.demo',
      department: 'Sales Operations',
      isVoting: false,
      joinedDate: '2025-01-01',
    },
  ],
  meetingCadence: 'Quarterly (minimum), with additional meetings as needed',
  quorumRequirement: '5 of 7 voting members required for quorum',
  charterDocument: 'GC-001',
  status: 'ACTIVE',
  createdAt: '2025-01-01T00:00:00.000Z',
  dataType: 'demo',
  demoMetadata: { year: 2025, bu: 'SPARCC', division: 'Governance', category: 'Sample Data' },
};

/**
 * Compensation Review Board (CRB)
 * 3 voting members + non-voting advisors - CRB-001 Charter
 */
export const CRB_COMMITTEE: Committee = {
  id: 'committee-crb',
  code: 'CRB',
  name: 'Compensation Review Board',
  description: 'Reviews and approves windfall deals, large SPIFs, and high-value exceptions',
  purpose: 'The Compensation Review Board reviews and approves large deals, SPIFs, and exceptions above certain thresholds. Provides rapid decision-making for windfall transactions and exceptional circumstances.',
  authority: [
    'Windfall deal review (>$1M ARR, >$100K commission, >50% quarterly quota)',
    'SPIF approvals ($50K-$250K range)',
    'Exception requests >$25K',
    'Individual dispute escalations',
    '20 business day review SLA for windfall deals',
  ],
  members: [
    {
      id: 'member-crb-001',
      name: 'Sarah Chen',
      role: 'Chair',
      title: 'VP Sales Compensation',
      email: 'sarah.chen@sparcc.demo',
      department: 'Sales Operations',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-crb-002',
      name: 'Patricia Garcia',
      role: 'Member',
      title: 'Director of Finance',
      email: 'patricia.garcia@sparcc.demo',
      department: 'Finance',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-crb-003',
      name: 'Amanda Foster',
      role: 'Member',
      title: 'VP Sales Operations',
      email: 'amanda.foster@sparcc.demo',
      department: 'Sales Operations',
      isVoting: true,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-crb-004',
      name: 'David Thompson',
      role: 'Advisor (Non-Voting)',
      title: 'General Counsel',
      email: 'david.thompson@sparcc.demo',
      department: 'Legal',
      isVoting: false,
      joinedDate: '2025-01-01',
    },
    {
      id: 'member-crb-005',
      name: 'Robert Kim',
      role: 'Advisor (Non-Voting)',
      title: 'Chief Sales Officer',
      email: 'robert.kim@sparcc.demo',
      department: 'Sales',
      isVoting: false,
      joinedDate: '2025-01-01',
    },
  ],
  meetingCadence: 'Ad-hoc as needed for windfall deals and exception requests',
  quorumRequirement: '2 of 3 voting members required for quorum',
  charterDocument: 'CRB-001',
  status: 'ACTIVE',
  createdAt: '2025-01-01T00:00:00.000Z',
  dataType: 'demo',
  demoMetadata: { year: 2025, bu: 'SPARCC', division: 'Governance', category: 'Sample Data' },
};

/**
 * CRB Decision Options for Windfall Deals
 * From Windfall Policy (SCP-007)
 */
export const CRB_DECISION_OPTIONS = [
  {
    id: 'option-1',
    name: 'Full Payment',
    description: 'No modification to commission. Standard payout per plan.',
    rationale: 'Most common if deal is legitimate and well-earned',
    example: 'Rep closed $2M deal through normal sales cycle with proper engagement',
  },
  {
    id: 'option-2',
    name: 'Commission Cap',
    description: 'Maximum commission paid: 2x target monthly incentive (or $250K, whichever is lower)',
    rationale: 'Applied if payout would be extreme relative to target',
    example: 'Target incentive $100K/month → max commission $200K on windfall',
  },
  {
    id: 'option-3',
    name: 'Amortization',
    description: 'Commission spread over contract term (up to 36 months)',
    rationale: 'Applies if rep will benefit from implementation/retention',
    example: '3-year contract → commission paid over 3 years',
  },
  {
    id: 'option-4',
    name: 'Split Credit',
    description: 'Commission split among multiple contributors',
    rationale: 'Large deal with team support',
    example: 'Split between AE (70%) and supporting reps (30%)',
  },
  {
    id: 'option-5',
    name: 'Special Recognition Bonus',
    description: 'Fixed bonus amount ($25K-$100K) in lieu of full commission',
    rationale: 'Recognizes extraordinary effort with controlled payout',
    example: '$50K spot bonus instead of $300K commission',
  },
  {
    id: 'option-6',
    name: 'No Payment (Rare)',
    description: 'Applied only if deal is questionable or non-compliant',
    rationale: 'Requires extensive documentation and full appeals process available',
    example: 'Deal credited incorrectly or violates policy',
  },
];

export const ALL_COMMITTEES = [SGCC_COMMITTEE, CRB_COMMITTEE];
