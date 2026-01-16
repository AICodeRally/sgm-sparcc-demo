/**
 * Notifications & Action Items
 * Centralized inbox for governance actions
 */

export interface NotificationTypeInfo {
  name: string;
  color: string;
  icon: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  actionRequired: number;
  critical?: number;
  high?: number;
  byType?: Record<string, number>;
}

export type NotificationType =
  | 'APPROVAL_REQUIRED'
  | 'CASE_ASSIGNED'
  | 'SLA_WARNING'
  | 'MEETING_INVITE'
  | 'POLICY_REVIEW'
  | 'COMMENT_MENTION'
  | 'STATUS_CHANGE'
  | 'DOCUMENT_PUBLISHED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isArchived: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionRequired: boolean;
  actionUrl?: string;
  relatedDocCode?: string;
  relatedCaseId?: string;
  sender?: string;
  metadata?: {
    dueDate?: string;
    slaRemaining?: number;
    approvalId?: string;
    caseId?: string;
    meetingId?: string;
  };
}

/**
 * Notifications for current user
 */
export const NOTIFICATIONS: Notification[] = [
  // Critical - Action Required
  {
    id: 'notif-001',
    type: 'APPROVAL_REQUIRED',
    title: 'Approval Required: SCP-017',
    message: 'Mid-Period Plan Change policy requires your approval. SLA expires in 2 days.',
    timestamp: '2025-12-18T09:30:00',
    isRead: false,
    isArchived: false,
    priority: 'CRITICAL',
    actionRequired: true,
    actionUrl: '/approvals/APR-017',
    relatedDocCode: 'SCP-017',
    sender: 'Sarah Johnson',
    metadata: {
      dueDate: '2025-12-20',
      slaRemaining: 2,
      approvalId: 'APR-017',
    },
  },
  {
    id: 'notif-002',
    type: 'SLA_WARNING',
    title: 'SLA Expiring: Quota Framework',
    message: 'SCP-002 Quota Setting Framework approval is expiring in 24 hours.',
    timestamp: '2025-12-18T08:15:00',
    isRead: false,
    isArchived: false,
    priority: 'CRITICAL',
    actionRequired: true,
    actionUrl: '/approvals/APR-002',
    relatedDocCode: 'SCP-002',
    metadata: {
      slaRemaining: 1,
      approvalId: 'APR-002',
    },
  },

  // High Priority
  {
    id: 'notif-003',
    type: 'CASE_ASSIGNED',
    title: 'New Case Assigned: Territory Dispute',
    message: 'Case CASE-042 has been assigned to you for investigation.',
    timestamp: '2025-12-18T07:45:00',
    isRead: false,
    isArchived: false,
    priority: 'HIGH',
    actionRequired: true,
    actionUrl: '/cases/CASE-042',
    relatedCaseId: 'CASE-042',
    sender: 'David Lee',
    metadata: {
      dueDate: '2025-12-25',
      caseId: 'CASE-042',
    },
  },
  {
    id: 'notif-004',
    type: 'MEETING_INVITE',
    title: 'SGCC Meeting Tomorrow',
    message: 'Sales Governance Compensation Committee monthly meeting at 2:00 PM.',
    timestamp: '2025-12-17T16:30:00',
    isRead: false,
    isArchived: false,
    priority: 'HIGH',
    actionRequired: true,
    actionUrl: '/calendar',
    metadata: {
      meetingId: 'evt-002',
      dueDate: '2025-12-22',
    },
  },
  {
    id: 'notif-005',
    type: 'POLICY_REVIEW',
    title: 'Annual Review Due: Plan Design Policy',
    message: 'SCP-001 Plan Design & Approval Policy requires annual review by January 10.',
    timestamp: '2025-12-17T14:00:00',
    isRead: false,
    isArchived: false,
    priority: 'HIGH',
    actionRequired: true,
    actionUrl: '/documents/SCP-001',
    relatedDocCode: 'SCP-001',
    metadata: {
      dueDate: '2026-01-10',
    },
  },

  // Medium Priority
  {
    id: 'notif-006',
    type: 'COMMENT_MENTION',
    title: 'Mentioned in Comment',
    message: 'Emily Davis mentioned you in a comment on SCP-009 Commission Calculation.',
    timestamp: '2025-12-17T11:20:00',
    isRead: false,
    isArchived: false,
    priority: 'MEDIUM',
    actionRequired: false,
    actionUrl: '/documents/SCP-009',
    relatedDocCode: 'SCP-009',
    sender: 'Emily Davis',
  },
  {
    id: 'notif-007',
    type: 'STATUS_CHANGE',
    title: 'Status Update: Windfall Policy',
    message: 'SCP-007 Windfall Deal Review has been approved by CRB.',
    timestamp: '2025-12-17T09:15:00',
    isRead: true,
    isArchived: false,
    priority: 'MEDIUM',
    actionRequired: false,
    actionUrl: '/documents/SCP-007',
    relatedDocCode: 'SCP-007',
  },
  {
    id: 'notif-008',
    type: 'DOCUMENT_PUBLISHED',
    title: 'New Document Published',
    message: 'PROC-005 Audit Procedure v1.0 has been published.',
    timestamp: '2025-12-16T15:45:00',
    isRead: true,
    isArchived: false,
    priority: 'LOW',
    actionRequired: false,
    actionUrl: '/documents/PROC-005',
    relatedDocCode: 'PROC-005',
    sender: 'Michael Chen',
  },

  // More notifications (older)
  {
    id: 'notif-009',
    type: 'APPROVAL_REQUIRED',
    title: 'Approval Required: Clawback Policy',
    message: 'SCP-014 Clawback Policy updates require SGCC approval.',
    timestamp: '2025-12-16T13:30:00',
    isRead: true,
    isArchived: false,
    priority: 'HIGH',
    actionRequired: true,
    actionUrl: '/approvals/APR-014',
    relatedDocCode: 'SCP-014',
    sender: 'Jane Smith',
    metadata: {
      dueDate: '2026-02-28',
      approvalId: 'APR-014',
    },
  },
  {
    id: 'notif-010',
    type: 'CASE_ASSIGNED',
    title: 'Case Assigned: Commission Dispute',
    message: 'Case CASE-038 (Commission calculation dispute) assigned to you.',
    timestamp: '2025-12-16T10:00:00',
    isRead: true,
    isArchived: false,
    priority: 'MEDIUM',
    actionRequired: true,
    actionUrl: '/cases/CASE-038',
    relatedCaseId: 'CASE-038',
    sender: 'Sarah Johnson',
    metadata: {
      dueDate: '2025-12-23',
      caseId: 'CASE-038',
    },
  },
  {
    id: 'notif-011',
    type: 'STATUS_CHANGE',
    title: 'Case Resolved: CASE-035',
    message: 'Territory alignment case has been marked as resolved.',
    timestamp: '2025-12-15T16:20:00',
    isRead: true,
    isArchived: false,
    priority: 'LOW',
    actionRequired: false,
    actionUrl: '/cases/CASE-035',
    relatedCaseId: 'CASE-035',
  },
  {
    id: 'notif-012',
    type: 'MEETING_INVITE',
    title: 'CRB Quarterly Review',
    message: 'Compensation Review Board quarterly meeting scheduled for January 18.',
    timestamp: '2025-12-15T09:00:00',
    isRead: true,
    isArchived: false,
    priority: 'MEDIUM',
    actionRequired: false,
    actionUrl: '/calendar',
    metadata: {
      meetingId: 'evt-007',
      dueDate: '2026-01-18',
    },
  },
  {
    id: 'notif-013',
    type: 'DOCUMENT_PUBLISHED',
    title: 'Template Updated: SPIF Template',
    message: 'TMPL-002 SPIF Template v2.0 has been published with new guidelines.',
    timestamp: '2025-12-14T14:30:00',
    isRead: true,
    isArchived: true,
    priority: 'LOW',
    actionRequired: false,
    actionUrl: '/documents/TMPL-002',
    relatedDocCode: 'TMPL-002',
    sender: 'Robert Wilson',
  },
  {
    id: 'notif-014',
    type: 'POLICY_REVIEW',
    title: 'Review Reminder: Compliance Policy',
    message: 'SCP-015 Compliance & Audit policy annual review due March 10.',
    timestamp: '2025-12-14T11:00:00',
    isRead: true,
    isArchived: true,
    priority: 'LOW',
    actionRequired: false,
    actionUrl: '/documents/SCP-015',
    relatedDocCode: 'SCP-015',
    metadata: {
      dueDate: '2026-03-10',
    },
  },
  {
    id: 'notif-015',
    type: 'COMMENT_MENTION',
    title: 'Mentioned in Comment',
    message: 'Michael Chen mentioned you in a comment on exception request workflow.',
    timestamp: '2025-12-13T15:45:00',
    isRead: true,
    isArchived: true,
    priority: 'LOW',
    actionRequired: false,
    actionUrl: '/documents/SCP-011',
    relatedDocCode: 'SCP-011',
    sender: 'Michael Chen',
  },
];

/**
 * Get unread notifications
 */
export function getUnreadNotifications(): Notification[] {
  return NOTIFICATIONS.filter(n => !n.isRead && !n.isArchived);
}

/**
 * Get notifications requiring action
 */
export function getActionRequiredNotifications(): Notification[] {
  return NOTIFICATIONS.filter(n => n.actionRequired && !n.isArchived);
}

/**
 * Get notifications by priority
 */
export function getNotificationsByPriority(priority: string): Notification[] {
  return NOTIFICATIONS.filter(n => n.priority === priority && !n.isArchived);
}

/**
 * Get notifications by type
 */
export function getNotificationsByType(type: NotificationType): Notification[] {
  return NOTIFICATIONS.filter(n => n.type === type && !n.isArchived);
}

/**
 * Notification type metadata
 */
export const NOTIFICATION_TYPE_INFO = {
  APPROVAL_REQUIRED: {
    name: 'Approval Required',
    color: '#ef4444',
    icon: 'CheckCircle',
  },
  CASE_ASSIGNED: {
    name: 'Case Assigned',
    color: '#f59e0b',
    icon: 'FileText',
  },
  SLA_WARNING: {
    name: 'SLA Warning',
    color: '#dc2626',
    icon: 'Clock',
  },
  MEETING_INVITE: {
    name: 'Meeting Invite',
    color: '#8b5cf6',
    icon: 'Calendar',
  },
  POLICY_REVIEW: {
    name: 'Policy Review',
    color: '#3b82f6',
    icon: 'FileCheck',
  },
  COMMENT_MENTION: {
    name: 'Comment Mention',
    color: '#06b6d4',
    icon: 'ChatBubble',
  },
  STATUS_CHANGE: {
    name: 'Status Change',
    color: '#10b981',
    icon: 'Update',
  },
  DOCUMENT_PUBLISHED: {
    name: 'Document Published',
    color: '#6b7280',
    icon: 'File',
  },
};

/**
 * Notification statistics
 */
export const NOTIFICATION_STATS = {
  total: NOTIFICATIONS.filter(n => !n.isArchived).length,
  unread: getUnreadNotifications().length,
  actionRequired: getActionRequiredNotifications().length,
  critical: getNotificationsByPriority('CRITICAL').length,
  high: getNotificationsByPriority('HIGH').length,
};
