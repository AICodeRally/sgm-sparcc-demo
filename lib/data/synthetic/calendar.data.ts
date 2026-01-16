/**
 * Calendar & Timeline Events
 * Unified governance event calendar
 */

export interface EventTypeInfo {
  name: string;
  color: string;
  description: string;
}

export interface CalendarStats {
  upcomingEvents: number;
  criticalEvents: number;
}

export type EventType =
  | 'APPROVAL_DEADLINE'
  | 'COMMITTEE_MEETING'
  | 'POLICY_REVIEW'
  | 'DOCUMENT_EFFECTIVE'
  | 'SLA_EXPIRING'
  | 'AUDIT_DUE'
  | 'TRAINING_SESSION';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  relatedDocCode?: string;
  status: 'UPCOMING' | 'TODAY' | 'OVERDUE' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Calendar events for governance timeline
 */
export const CALENDAR_EVENTS: CalendarEvent[] = [
  // December 2025 Events
  {
    id: 'evt-001',
    title: 'SCP-017 Approval Deadline',
    type: 'APPROVAL_DEADLINE',
    date: '2025-12-20',
    description: 'Mid-Period Plan Change policy requires SGCC approval',
    relatedDocCode: 'SCP-017',
    status: 'UPCOMING',
    priority: 'CRITICAL',
  },
  {
    id: 'evt-002',
    title: 'SGCC Monthly Meeting',
    type: 'COMMITTEE_MEETING',
    date: '2025-12-22',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Sales Governance Compensation Committee monthly review',
    location: 'Conference Room A / Zoom',
    attendees: ['Jane Smith', 'Michael Chen', 'Sarah Johnson', 'David Lee'],
    status: 'UPCOMING',
    priority: 'HIGH',
  },
  {
    id: 'evt-003',
    title: 'Q4 Compliance Audit Due',
    type: 'AUDIT_DUE',
    date: '2025-12-31',
    description: 'Quarterly compliance audit report submission',
    relatedDocCode: 'SCP-015',
    status: 'UPCOMING',
    priority: 'HIGH',
  },

  // January 2026 Events
  {
    id: 'evt-004',
    title: 'Annual Policy Review: SCP-001',
    type: 'POLICY_REVIEW',
    date: '2026-01-10',
    description: 'Plan Design & Approval Policy annual review',
    relatedDocCode: 'SCP-001',
    status: 'UPCOMING',
    priority: 'MEDIUM',
  },
  {
    id: 'evt-005',
    title: 'SCP-009 Effective Date',
    type: 'DOCUMENT_EFFECTIVE',
    date: '2026-01-01',
    description: 'Updated Commission Calculation policy goes into effect',
    relatedDocCode: 'SCP-009',
    status: 'COMPLETED',
    priority: 'MEDIUM',
  },
  {
    id: 'evt-006',
    title: 'New Hire Comp Training',
    type: 'TRAINING_SESSION',
    date: '2026-01-15',
    startTime: '10:00',
    endTime: '12:00',
    description: 'Compensation training for new sales managers',
    location: 'Training Room B / Zoom',
    attendees: ['Emily Davis', 'Robert Wilson', 'Maria Garcia'],
    status: 'UPCOMING',
    priority: 'LOW',
  },
  {
    id: 'evt-007',
    title: 'CRB Quarterly Review',
    type: 'COMMITTEE_MEETING',
    date: '2026-01-18',
    startTime: '13:00',
    endTime: '15:00',
    description: 'Compensation Review Board quarterly meeting',
    location: 'Executive Boardroom',
    attendees: ['Jane Smith', 'Michael Chen'],
    status: 'UPCOMING',
    priority: 'HIGH',
  },
  {
    id: 'evt-008',
    title: 'SCP-002 SLA Expiring',
    type: 'SLA_EXPIRING',
    date: '2026-01-20',
    description: 'Quota Setting Framework pending approval - SLA expires in 2 days',
    relatedDocCode: 'SCP-002',
    status: 'UPCOMING',
    priority: 'CRITICAL',
  },
  {
    id: 'evt-009',
    title: 'SGCC Monthly Meeting',
    type: 'COMMITTEE_MEETING',
    date: '2026-01-26',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Sales Governance Compensation Committee monthly review',
    location: 'Conference Room A / Zoom',
    attendees: ['Jane Smith', 'Michael Chen', 'Sarah Johnson', 'David Lee'],
    status: 'UPCOMING',
    priority: 'HIGH',
  },

  // February 2026 Events
  {
    id: 'evt-010',
    title: 'Annual Policy Review: SCP-007',
    type: 'POLICY_REVIEW',
    date: '2026-02-05',
    description: 'Windfall Deal Review policy annual review',
    relatedDocCode: 'SCP-007',
    status: 'UPCOMING',
    priority: 'MEDIUM',
  },
  {
    id: 'evt-011',
    title: 'Dispute Resolution Training',
    type: 'TRAINING_SESSION',
    date: '2026-02-12',
    startTime: '09:00',
    endTime: '11:00',
    description: 'Training on handling compensation disputes',
    location: 'Training Room A / Zoom',
    status: 'UPCOMING',
    priority: 'LOW',
  },
  {
    id: 'evt-012',
    title: 'SGCC Monthly Meeting',
    type: 'COMMITTEE_MEETING',
    date: '2026-02-23',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Sales Governance Compensation Committee monthly review',
    location: 'Conference Room A / Zoom',
    attendees: ['Jane Smith', 'Michael Chen', 'Sarah Johnson', 'David Lee'],
    status: 'UPCOMING',
    priority: 'HIGH',
  },
  {
    id: 'evt-013',
    title: 'SCP-014 Approval Deadline',
    type: 'APPROVAL_DEADLINE',
    date: '2026-02-28',
    description: 'Clawback Policy updates require approval',
    relatedDocCode: 'SCP-014',
    status: 'UPCOMING',
    priority: 'HIGH',
  },

  // March 2026 Events
  {
    id: 'evt-014',
    title: 'Q1 Compliance Audit Due',
    type: 'AUDIT_DUE',
    date: '2026-03-31',
    description: 'Quarterly compliance audit report submission',
    relatedDocCode: 'SCP-015',
    status: 'UPCOMING',
    priority: 'HIGH',
  },
  {
    id: 'evt-015',
    title: 'Annual Policy Review: SCP-015',
    type: 'POLICY_REVIEW',
    date: '2026-03-10',
    description: 'Compliance & Audit policy annual review',
    relatedDocCode: 'SCP-015',
    status: 'UPCOMING',
    priority: 'MEDIUM',
  },
  {
    id: 'evt-016',
    title: 'CRB Quarterly Review',
    type: 'COMMITTEE_MEETING',
    date: '2026-03-20',
    startTime: '13:00',
    endTime: '15:00',
    description: 'Compensation Review Board quarterly meeting',
    location: 'Executive Boardroom',
    attendees: ['Jane Smith', 'Michael Chen'],
    status: 'UPCOMING',
    priority: 'HIGH',
  },
  {
    id: 'evt-017',
    title: 'SGCC Monthly Meeting',
    type: 'COMMITTEE_MEETING',
    date: '2026-03-27',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Sales Governance Compensation Committee monthly review',
    location: 'Conference Room A / Zoom',
    attendees: ['Jane Smith', 'Michael Chen', 'Sarah Johnson', 'David Lee'],
    status: 'UPCOMING',
    priority: 'HIGH',
  },
];

/**
 * Get events for a specific date
 */
export function getEventsForDate(date: string): CalendarEvent[] {
  return CALENDAR_EVENTS.filter(event => event.date === date);
}

/**
 * Get events for a specific month
 */
export function getEventsForMonth(year: number, month: number): CalendarEvent[] {
  const monthStr = month.toString().padStart(2, '0');
  const yearMonth = `${year}-${monthStr}`;
  return CALENDAR_EVENTS.filter(event => event.date.startsWith(yearMonth));
}

/**
 * Get upcoming events (next 30 days)
 */
export function getUpcomingEvents(limit?: number): CalendarEvent[] {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcoming = CALENDAR_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Event type metadata
 */
export const EVENT_TYPE_INFO = {
  APPROVAL_DEADLINE: {
    name: 'Approval Deadline',
    color: '#ef4444',
    icon: 'CheckCircle',
  },
  COMMITTEE_MEETING: {
    name: 'Committee Meeting',
    color: '#8b5cf6',
    icon: 'Users',
  },
  POLICY_REVIEW: {
    name: 'Policy Review',
    color: '#3b82f6',
    icon: 'FileText',
  },
  DOCUMENT_EFFECTIVE: {
    name: 'Document Effective',
    color: '#10b981',
    icon: 'Calendar',
  },
  SLA_EXPIRING: {
    name: 'SLA Expiring',
    color: '#f59e0b',
    icon: 'Clock',
  },
  AUDIT_DUE: {
    name: 'Audit Due',
    color: '#ec4899',
    icon: 'FileCheck',
  },
  TRAINING_SESSION: {
    name: 'Training Session',
    color: '#06b6d4',
    icon: 'BookOpen',
  },
};

/**
 * Calendar statistics
 */
export const CALENDAR_STATS = {
  totalEvents: CALENDAR_EVENTS.length,
  upcomingEvents: CALENDAR_EVENTS.filter(e => e.status === 'UPCOMING').length,
  criticalEvents: CALENDAR_EVENTS.filter(e => e.priority === 'CRITICAL').length,
  thisMonthEvents: getEventsForMonth(2025, 12).length,
};
