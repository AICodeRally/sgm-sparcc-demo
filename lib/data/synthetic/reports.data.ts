/**
 * Reports & Export Templates
 * Pre-built governance reports
 */

export type ReportFormat = 'PDF' | 'CSV' | 'EXCEL' | 'JSON';

export type ReportCategory = 'COMPLIANCE' | 'PERFORMANCE' | 'OPERATIONS' | 'AUDIT';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  supportedFormats: ReportFormat[];
  parameters: ReportParameter[];
  estimatedTime: string;
  icon: string;
}

export interface ReportParameter {
  id: string;
  label: string;
  type: 'date_range' | 'select' | 'multi_select' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  format: ReportFormat;
  generatedAt: string;
  generatedBy: string;
  parameters: { [key: string]: any };
  fileSize: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
}

export interface ReportStats {
  totalTemplates: number;
  recentlyGenerated: number;
  byCategory: Record<ReportCategory, number>;
}

/**
 * Report templates
 */
export const REPORT_TEMPLATES: ReportTemplate[] = [
  // Compliance Reports
  {
    id: 'rpt-001',
    name: 'Quarterly Compliance Report',
    description: 'Comprehensive compliance audit report with SLA performance, policy coverage, and risk assessment',
    category: 'COMPLIANCE',
    supportedFormats: ['PDF', 'EXCEL'],
    estimatedTime: '2-3 minutes',
    icon: 'FileCheck',
    parameters: [
      {
        id: 'quarter',
        label: 'Quarter',
        type: 'select',
        required: true,
        options: [
          { value: 'Q4-2025', label: 'Q4 2025' },
          { value: 'Q3-2025', label: 'Q3 2025' },
          { value: 'Q2-2025', label: 'Q2 2025' },
          { value: 'Q1-2025', label: 'Q1 2025' },
        ],
      },
      {
        id: 'includeDetails',
        label: 'Include Detailed Findings',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    ],
  },
  {
    id: 'rpt-002',
    name: 'Policy Coverage Analysis',
    description: 'Analysis of governance policy coverage across sales roles and territories',
    category: 'COMPLIANCE',
    supportedFormats: ['PDF', 'EXCEL', 'CSV'],
    estimatedTime: '1-2 minutes',
    icon: 'FileText',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
      {
        id: 'departments',
        label: 'Departments',
        type: 'multi_select',
        required: false,
        options: [
          { value: 'enterprise', label: 'Enterprise Sales' },
          { value: 'commercial', label: 'Commercial Sales' },
          { value: 'smb', label: 'SMB Sales' },
          { value: 'channel', label: 'Channel Sales' },
        ],
      },
    ],
  },
  {
    id: 'rpt-003',
    name: 'Audit Trail Export',
    description: 'Complete audit trail of document changes, approvals, and access logs',
    category: 'AUDIT',
    supportedFormats: ['CSV', 'EXCEL', 'JSON'],
    estimatedTime: '3-5 minutes',
    icon: 'Archive',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
      {
        id: 'event_types',
        label: 'Event Types',
        type: 'multi_select',
        required: false,
        options: [
          { value: 'approval', label: 'Approvals' },
          { value: 'edit', label: 'Document Edits' },
          { value: 'access', label: 'Access Logs' },
          { value: 'comment', label: 'Comments' },
        ],
      },
    ],
  },

  // Performance Reports
  {
    id: 'rpt-004',
    name: 'SLA Performance Dashboard',
    description: 'Analysis of SLA compliance, approval velocity, and bottlenecks',
    category: 'PERFORMANCE',
    supportedFormats: ['PDF', 'EXCEL'],
    estimatedTime: '1-2 minutes',
    icon: 'BarChart',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
      {
        id: 'committee',
        label: 'Committee',
        type: 'select',
        required: false,
        options: [
          { value: 'all', label: 'All Committees' },
          { value: 'sgcc', label: 'SGCC' },
          { value: 'crb', label: 'CRB' },
        ],
      },
    ],
  },
  {
    id: 'rpt-005',
    name: 'Approval Volume & Trends',
    description: 'Analysis of approval volume, trends, and forecasting',
    category: 'PERFORMANCE',
    supportedFormats: ['PDF', 'EXCEL', 'CSV'],
    estimatedTime: '2-3 minutes',
    icon: 'TrendingUp',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
      {
        id: 'groupBy',
        label: 'Group By',
        type: 'select',
        required: true,
        defaultValue: 'month',
        options: [
          { value: 'day', label: 'Daily' },
          { value: 'week', label: 'Weekly' },
          { value: 'month', label: 'Monthly' },
        ],
      },
    ],
  },
  {
    id: 'rpt-006',
    name: 'Committee Performance Summary',
    description: 'Summary of committee meeting frequency, decisions, and efficiency',
    category: 'PERFORMANCE',
    supportedFormats: ['PDF', 'EXCEL'],
    estimatedTime: '1-2 minutes',
    icon: 'Users',
    parameters: [
      {
        id: 'quarter',
        label: 'Quarter',
        type: 'select',
        required: true,
        options: [
          { value: 'Q4-2025', label: 'Q4 2025' },
          { value: 'Q3-2025', label: 'Q3 2025' },
          { value: 'Q2-2025', label: 'Q2 2025' },
        ],
      },
    ],
  },

  // Operations Reports
  {
    id: 'rpt-007',
    name: 'Case Management Summary',
    description: 'Summary of dispute cases, resolution time, and outcomes',
    category: 'OPERATIONS',
    supportedFormats: ['PDF', 'EXCEL', 'CSV'],
    estimatedTime: '1-2 minutes',
    icon: 'FileStack',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
      {
        id: 'status',
        label: 'Case Status',
        type: 'multi_select',
        required: false,
        options: [
          { value: 'open', label: 'Open' },
          { value: 'in_review', label: 'In Review' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'closed', label: 'Closed' },
        ],
      },
    ],
  },
  {
    id: 'rpt-008',
    name: 'Document Lifecycle Report',
    description: 'Analysis of document creation, updates, approvals, and expiration',
    category: 'OPERATIONS',
    supportedFormats: ['PDF', 'EXCEL', 'CSV'],
    estimatedTime: '2-3 minutes',
    icon: 'Loop',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
      {
        id: 'documentTypes',
        label: 'Document Types',
        type: 'multi_select',
        required: false,
        options: [
          { value: 'policy', label: 'Policies' },
          { value: 'procedure', label: 'Procedures' },
          { value: 'template', label: 'Templates' },
          { value: 'framework', label: 'Frameworks' },
        ],
      },
    ],
  },
  {
    id: 'rpt-009',
    name: 'Exception Request Analysis',
    description: 'Analysis of exception requests, approval rates, and patterns',
    category: 'OPERATIONS',
    supportedFormats: ['PDF', 'EXCEL', 'CSV'],
    estimatedTime: '1-2 minutes',
    icon: 'ExclamationTriangle',
    parameters: [
      {
        id: 'date_range',
        label: 'Date Range',
        type: 'date_range',
        required: true,
      },
    ],
  },
];

/**
 * Recent generated reports
 */
export const GENERATED_REPORTS: GeneratedReport[] = [
  {
    id: 'gen-001',
    templateId: 'rpt-001',
    templateName: 'Quarterly Compliance Report',
    format: 'PDF',
    generatedAt: '2025-12-18T10:30:00',
    generatedBy: 'Jane Smith',
    parameters: { quarter: 'Q4-2025', includeDetails: true },
    fileSize: '2.4 MB',
    status: 'COMPLETED',
    downloadUrl: '/downloads/compliance-q4-2025.pdf',
  },
  {
    id: 'gen-002',
    templateId: 'rpt-004',
    templateName: 'SLA Performance Dashboard',
    format: 'EXCEL',
    generatedAt: '2025-12-18T09:15:00',
    generatedBy: 'Michael Chen',
    parameters: { date_range: '2025-11-01 to 2025-11-30', committee: 'all' },
    fileSize: '856 KB',
    status: 'COMPLETED',
    downloadUrl: '/downloads/sla-performance-nov-2025.xlsx',
  },
  {
    id: 'gen-003',
    templateId: 'rpt-007',
    templateName: 'Case Management Summary',
    format: 'PDF',
    generatedAt: '2025-12-17T16:45:00',
    generatedBy: 'David Lee',
    parameters: { date_range: '2025-12-01 to 2025-12-17', status: ['open', 'in_review'] },
    fileSize: '1.1 MB',
    status: 'COMPLETED',
    downloadUrl: '/downloads/case-summary-dec-2025.pdf',
  },
  {
    id: 'gen-004',
    templateId: 'rpt-003',
    templateName: 'Audit Trail Export',
    format: 'CSV',
    generatedAt: '2025-12-17T14:20:00',
    generatedBy: 'Sarah Johnson',
    parameters: { date_range: '2025-12-01 to 2025-12-17', event_types: ['approval', 'edit'] },
    fileSize: '3.2 MB',
    status: 'COMPLETED',
    downloadUrl: '/downloads/audit-trail-dec-2025.csv',
  },
  {
    id: 'gen-005',
    templateId: 'rpt-005',
    templateName: 'Approval Volume & Trends',
    format: 'EXCEL',
    generatedAt: '2025-12-16T11:00:00',
    generatedBy: 'Jane Smith',
    parameters: { date_range: '2025-01-01 to 2025-12-16', groupBy: 'month' },
    fileSize: '1.8 MB',
    status: 'COMPLETED',
    downloadUrl: '/downloads/approval-trends-2025.xlsx',
  },
];

/**
 * Get reports by category
 */
export function getReportsByCategory(category: ReportCategory): ReportTemplate[] {
  return REPORT_TEMPLATES.filter(r => r.category === category);
}

/**
 * Report statistics
 */
export const REPORT_STATS = {
  totalTemplates: REPORT_TEMPLATES.length,
  recentlyGenerated: GENERATED_REPORTS.filter(r => {
    const generatedDate = new Date(r.generatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return generatedDate >= weekAgo;
  }).length,
  byCategory: {
    COMPLIANCE: getReportsByCategory('COMPLIANCE').length,
    PERFORMANCE: getReportsByCategory('PERFORMANCE').length,
    OPERATIONS: getReportsByCategory('OPERATIONS').length,
    AUDIT: getReportsByCategory('AUDIT').length,
  },
};
