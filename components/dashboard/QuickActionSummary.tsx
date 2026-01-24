'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FileTextIcon,
  PersonIcon,
} from '@radix-ui/react-icons';

interface QuickStats {
  pendingApprovals: number;
  overdueApprovals: number;
  activeCases: number;
  highPriorityCases: number;
  expiringSoon: number;
  upcomingMeetings: number;
}

/**
 * QuickActionSummary - Task 3.3
 * Shows actionable summary cards on dashboard for quick access
 */
export function QuickActionSummary() {
  const [stats, setStats] = useState<QuickStats>({
    pendingApprovals: 0,
    overdueApprovals: 0,
    activeCases: 0,
    highPriorityCases: 0,
    expiringSoon: 0,
    upcomingMeetings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      // Fetch approvals
      const approvalsRes = await fetch('/api/approvals');
      const approvalsData = await approvalsRes.json();
      const approvals = approvalsData.approvals || [];
      const pendingApprovals = approvals.filter((a: any) => a.status === 'PENDING' || a.status === 'IN_REVIEW').length;
      const overdueApprovals = approvals.filter((a: any) => {
        if (!a.dueDate) return false;
        return new Date(a.dueDate) < new Date() && a.status !== 'APPROVED' && a.status !== 'REJECTED';
      }).length;

      // Fetch cases
      const casesRes = await fetch('/api/cases');
      const casesData = await casesRes.json();
      const cases = casesData.cases || [];
      const activeCases = cases.filter((c: any) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
      const highPriorityCases = cases.filter((c: any) =>
        (c.status === 'OPEN' || c.status === 'IN_PROGRESS') && (c.priority === 'HIGH' || c.priority === 'CRITICAL')
      ).length;

      // Fetch documents for expiring soon
      const docsRes = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
      const docsData = await docsRes.json();
      const documents = docsData.documents || [];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringSoon = documents.filter((d: any) => {
        if (!d.expirationDate) return false;
        const expDate = new Date(d.expirationDate);
        return expDate > now && expDate < thirtyDaysFromNow;
      }).length;

      // Fetch calendar for upcoming meetings
      const calendarRes = await fetch('/api/calendar');
      const calendarData = await calendarRes.json();
      const events = calendarData.events || [];
      const upcomingMeetings = events.filter((e: any) =>
        e.eventType === 'COMMITTEE_MEETING' && new Date(e.date) > now
      ).length;

      setStats({
        pendingApprovals,
        overdueApprovals,
        activeCases,
        highPriorityCases,
        expiringSoon,
        upcomingMeetings,
      });
    } catch (err) {
      console.error('Failed to fetch quick stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Only show if there's something actionable
  const hasActions = stats.pendingApprovals > 0 || stats.activeCases > 0 ||
    stats.expiringSoon > 0 || stats.upcomingMeetings > 0;

  if (!hasActions) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        {stats.pendingApprovals > 0 && (
          <Link href="/approvals" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <CheckCircledIcon className="w-5 h-5 text-amber-500" />
                {stats.overdueApprovals > 0 && (
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    {stats.overdueApprovals} overdue
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-[color:var(--color-foreground)]">
                {stats.pendingApprovals}
              </div>
              <div className="text-sm text-[color:var(--color-muted)] group-hover:text-purple-600 transition-colors">
                Pending Approvals
              </div>
            </div>
          </Link>
        )}

        {/* Active Cases */}
        {stats.activeCases > 0 && (
          <Link href="/cases" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />
                {stats.highPriorityCases > 0 && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    {stats.highPriorityCases} high priority
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-[color:var(--color-foreground)]">
                {stats.activeCases}
              </div>
              <div className="text-sm text-[color:var(--color-muted)] group-hover:text-purple-600 transition-colors">
                Active Cases
              </div>
            </div>
          </Link>
        )}

        {/* Expiring Documents */}
        {stats.expiringSoon > 0 && (
          <Link href="/documents" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <FileTextIcon className="w-5 h-5 text-orange-500" />
                <ClockIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
              </div>
              <div className="text-2xl font-bold text-[color:var(--color-foreground)]">
                {stats.expiringSoon}
              </div>
              <div className="text-sm text-[color:var(--color-muted)] group-hover:text-purple-600 transition-colors">
                Expiring in 30 Days
              </div>
            </div>
          </Link>
        )}

        {/* Upcoming Meetings */}
        {stats.upcomingMeetings > 0 && (
          <Link href="/calendar" className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <PersonIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-[color:var(--color-foreground)]">
                {stats.upcomingMeetings}
              </div>
              <div className="text-sm text-[color:var(--color-muted)] group-hover:text-purple-600 transition-colors">
                Upcoming Meetings
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
