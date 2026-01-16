/**
 * Document Version History & Comparison
 * Track document changes and enable version comparison
 */

export interface DocumentVersion {
  id: string;
  documentCode: string;
  version: string;
  title: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ARCHIVED';
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  changesSummary: string;
  changeCount: number;
  content: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface VersionDiff {
  sectionId: string;
  sectionTitle: string;
  changes: Change[];
}

export interface Change {
  type: 'addition' | 'deletion' | 'modification';
  lineNumber: number;
  oldText?: string;
  newText?: string;
  context?: string;
}

export interface VersionStats {
  totalVersions: number;
  recentUpdates: number;
}

export interface VersionComparison {
  oldVersionId: string;
  newVersionId: string;
  diffs: VersionDiff[];
}

/**
 * Sample document versions
 */
export const DOCUMENT_VERSIONS: DocumentVersion[] = [
  // SCP-001 Plan Design & Approval Policy
  {
    id: 'ver-001-v3',
    documentCode: 'SCP-001',
    version: 'v3.0',
    title: 'Plan Design & Approval Policy',
    status: 'APPROVED',
    createdAt: '2025-12-01T10:00:00',
    createdBy: 'Jane Smith',
    approvedAt: '2025-12-05T14:30:00',
    approvedBy: 'Michael Chen',
    changesSummary: 'Added mid-period change approval process, updated SLA timelines',
    changeCount: 12,
    content: 'Full document content v3.0...',
    sections: [
      {
        id: 'sec-1',
        title: '1. Purpose',
        content: 'This policy establishes the framework for designing, documenting, and approving sales compensation plans to ensure alignment with business objectives, regulatory compliance, and best practices.',
        order: 1,
      },
      {
        id: 'sec-2',
        title: '2. Scope',
        content: 'This policy applies to all sales compensation plans including base salary structures, variable compensation components, incentive programs, and special performance incentive funds (SPIFs). It covers all sales roles globally across Enterprise, Commercial, SMB, and Channel segments.',
        order: 2,
      },
      {
        id: 'sec-3',
        title: '3. Approval Process',
        content: 'All new compensation plans must be submitted to SGCC for review at least 30 business days before the intended effective date. Mid-period plan changes require accelerated review within 10 business days. Plans must include financial modeling, impact analysis, and legal review documentation.',
        order: 3,
      },
      {
        id: 'sec-4',
        title: '4. Design Principles',
        content: 'Compensation plans must align with corporate revenue objectives, maintain internal equity, ensure external competitiveness, comply with all applicable laws and regulations, and provide clear line of sight between performance and rewards.',
        order: 4,
      },
    ],
  },
  {
    id: 'ver-001-v2',
    documentCode: 'SCP-001',
    version: 'v2.1',
    title: 'Plan Design & Approval Policy',
    status: 'ARCHIVED',
    createdAt: '2025-06-15T09:00:00',
    createdBy: 'Sarah Johnson',
    approvedAt: '2025-06-20T16:00:00',
    approvedBy: 'David Lee',
    changesSummary: 'Updated compliance requirements, clarified role definitions',
    changeCount: 8,
    content: 'Full document content v2.1...',
    sections: [
      {
        id: 'sec-1',
        title: '1. Purpose',
        content: 'This policy establishes the framework for designing, documenting, and approving sales compensation plans to ensure alignment with business objectives and regulatory compliance.',
        order: 1,
      },
      {
        id: 'sec-2',
        title: '2. Scope',
        content: 'This policy applies to all sales compensation plans including base salary structures, variable compensation components, and incentive programs. It covers all sales roles globally.',
        order: 2,
      },
      {
        id: 'sec-3',
        title: '3. Approval Process',
        content: 'All new compensation plans must be submitted to SGCC for review at least 30 business days before the intended effective date. Plans must include financial modeling and impact analysis.',
        order: 3,
      },
      {
        id: 'sec-4',
        title: '4. Design Principles',
        content: 'Compensation plans must align with corporate revenue objectives, maintain internal equity, ensure external competitiveness, and comply with all applicable regulations.',
        order: 4,
      },
    ],
  },
  {
    id: 'ver-001-v1',
    documentCode: 'SCP-001',
    version: 'v1.0',
    title: 'Plan Design & Approval Policy',
    status: 'ARCHIVED',
    createdAt: '2025-01-10T08:00:00',
    createdBy: 'Michael Chen',
    approvedAt: '2025-01-15T10:00:00',
    approvedBy: 'Jane Smith',
    changesSummary: 'Initial version',
    changeCount: 0,
    content: 'Full document content v1.0...',
    sections: [
      {
        id: 'sec-1',
        title: '1. Purpose',
        content: 'This policy establishes the framework for designing and approving sales compensation plans.',
        order: 1,
      },
      {
        id: 'sec-2',
        title: '2. Scope',
        content: 'This policy applies to all sales compensation plans.',
        order: 2,
      },
      {
        id: 'sec-3',
        title: '3. Approval Process',
        content: 'All compensation plans must be submitted to SGCC for review 30 days before effective date.',
        order: 3,
      },
      {
        id: 'sec-4',
        title: '4. Design Principles',
        content: 'Compensation plans must align with business objectives and comply with regulations.',
        order: 4,
      },
    ],
  },

  // SCP-009 Commission Calculation
  {
    id: 'ver-009-v2',
    documentCode: 'SCP-009',
    version: 'v2.0',
    title: 'Commission Calculation Policy',
    status: 'APPROVED',
    createdAt: '2025-11-20T11:00:00',
    createdBy: 'David Lee',
    approvedAt: '2025-11-28T15:00:00',
    approvedBy: 'Jane Smith',
    changesSummary: 'Added split credit rules, updated payment timing',
    changeCount: 15,
    content: 'Full document content v2.0...',
    sections: [
      {
        id: 'sec-1',
        title: '1. Calculation Methodology',
        content: 'Commissions are calculated based on recognized revenue, applied rates, and applicable accelerators. Split credit scenarios require documented approval from sales management and follow the 70-30 split rule unless otherwise approved.',
        order: 1,
      },
      {
        id: 'sec-2',
        title: '2. Payment Timing',
        content: 'Standard commissions are paid monthly in arrears, within 15 business days of month close. Quarterly bonuses are paid within 30 days of quarter close. Annual incentives are paid by March 31st.',
        order: 2,
      },
    ],
  },
  {
    id: 'ver-009-v1',
    documentCode: 'SCP-009',
    version: 'v1.5',
    title: 'Commission Calculation Policy',
    status: 'ARCHIVED',
    createdAt: '2025-03-10T09:30:00',
    createdBy: 'Emily Davis',
    approvedAt: '2025-03-15T14:00:00',
    approvedBy: 'Michael Chen',
    changesSummary: 'Clarified accelerator tiers',
    changeCount: 6,
    content: 'Full document content v1.5...',
    sections: [
      {
        id: 'sec-1',
        title: '1. Calculation Methodology',
        content: 'Commissions are calculated based on recognized revenue and applied rates. Split credit scenarios require documented approval from sales management.',
        order: 1,
      },
      {
        id: 'sec-2',
        title: '2. Payment Timing',
        content: 'Commissions are paid monthly in arrears, within 15 business days of month close.',
        order: 2,
      },
    ],
  },
];

/**
 * Get versions for a document
 */
export function getDocumentVersions(documentCode: string): DocumentVersion[] {
  return DOCUMENT_VERSIONS.filter(v => v.documentCode === documentCode)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get specific version
 */
export function getVersion(versionId: string): DocumentVersion | undefined {
  return DOCUMENT_VERSIONS.find(v => v.id === versionId);
}

/**
 * Compare two versions and generate diff
 */
export function compareVersions(oldVersionId: string, newVersionId: string): VersionDiff[] {
  const oldVersion = getVersion(oldVersionId);
  const newVersion = getVersion(newVersionId);

  if (!oldVersion || !newVersion) {
    return [];
  }

  const diffs: VersionDiff[] = [];

  // Compare sections
  newVersion.sections.forEach(newSection => {
    const oldSection = oldVersion.sections.find(s => s.id === newSection.id);

    if (!oldSection) {
      // New section added
      diffs.push({
        sectionId: newSection.id,
        sectionTitle: newSection.title,
        changes: [
          {
            type: 'addition',
            lineNumber: 1,
            newText: newSection.content,
            context: 'Entire section added',
          },
        ],
      });
    } else if (oldSection.content !== newSection.content) {
      // Section modified
      const changes = detectChanges(oldSection.content, newSection.content);
      if (changes.length > 0) {
        diffs.push({
          sectionId: newSection.id,
          sectionTitle: newSection.title,
          changes,
        });
      }
    }
  });

  // Check for deleted sections
  oldVersion.sections.forEach(oldSection => {
    const exists = newVersion.sections.find(s => s.id === oldSection.id);
    if (!exists) {
      diffs.push({
        sectionId: oldSection.id,
        sectionTitle: oldSection.title,
        changes: [
          {
            type: 'deletion',
            lineNumber: 1,
            oldText: oldSection.content,
            context: 'Entire section removed',
          },
        ],
      });
    }
  });

  return diffs;
}

/**
 * Detect changes between two text strings
 */
function detectChanges(oldText: string, newText: string): Change[] {
  const changes: Change[] = [];

  // Simple word-level comparison
  const oldWords = oldText.split(' ');
  const newWords = newText.split(' ');

  // Look for additions and modifications
  if (newText.length > oldText.length + 20) {
    changes.push({
      type: 'addition',
      lineNumber: 1,
      newText: newText,
      oldText: oldText,
      context: 'Content expanded with additional details',
    });
  } else if (oldText.length > newText.length + 20) {
    changes.push({
      type: 'deletion',
      lineNumber: 1,
      oldText: oldText,
      newText: newText,
      context: 'Content shortened or removed',
    });
  } else {
    changes.push({
      type: 'modification',
      lineNumber: 1,
      oldText: oldText,
      newText: newText,
      context: 'Content modified',
    });
  }

  return changes;
}

/**
 * Version history statistics
 */
export const VERSION_STATS = {
  totalVersions: DOCUMENT_VERSIONS.length,
  recentUpdates: DOCUMENT_VERSIONS.filter(v => {
    const createdDate = new Date(v.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return createdDate >= monthAgo;
  }).length,
};
