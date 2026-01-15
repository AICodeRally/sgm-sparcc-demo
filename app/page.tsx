'use client';

import { useEffect, useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import RotatingMetricTile from '@/components/dashboard/RotatingMetricTile';
import { ModeCard } from '@/components/modes/ModeCard';
import { getMetricGroupsByMode } from '@/lib/data/metric-registry';
import { OperationalMode } from '@/types/operational-mode';
import { PulseWidget } from '@/components/pulse/PulseWidget';
import { TaskWidget } from '@/components/tasks/TaskWidget';

export default function SGMDashboard() {
  const [metricData, setMetricData] = useState<Record<string, number | string>>({});

  useEffect(() => {
    // Fetch live metrics from APIs
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch documents
      const docsRes = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
      const docsData = await docsRes.json();
      const documents = docsData.documents || [];

      // Fetch policies
      const policiesRes = await fetch('/api/sgm/policies?tenantId=demo-tenant-001');
      const policiesData = await policiesRes.json();
      const policies = policiesData.policies || [];

      // Calculate metrics from real data
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const metrics: Record<string, number | string> = {
        // Document metrics
        totalDocuments: documents.length,
        pendingReview: documents.filter((d: any) => d.status === 'UNDER_REVIEW').length,
        expiringSoon: documents.filter((d: any) => {
          if (!d.expirationDate) return false;
          const expDate = new Date(d.expirationDate);
          return expDate > now && expDate < thirtyDaysFromNow;
        }).length,
        recentUpdates: documents.filter((d: any) => {
          const updated = new Date(d.lastUpdated);
          return updated > sevenDaysAgo;
        }).length,
        needsLegalReview: documents.filter((d: any) => d.legalReviewStatus === 'PENDING').length,

        // Approval metrics (will be populated from API when available)
        pendingApprovals: 0,
        overdueApprovals: 0,
        slaCompliance: 0,
        avgApprovalTime: 0,
        completedThisMonth: 0,

        // Case metrics (will be populated from API when available)
        activeCases: 0,
        highPriorityCases: 0,
        approachingSLA: 0,
        avgResolution: 0,
        exceptionRequests: 0,

        // Policy metrics
        activePolicies: policies.filter((p: any) => p.status === 'ACTIVE').length,
        needsReview: policies.filter((p: any) => {
          if (!p.nextReview) return false;
          return new Date(p.nextReview) < now;
        }).length,
        complianceScore: 0,
        updatedThisQuarter: 0,
        auditFindings: 0,

        // Governance metrics (will be populated from API when available)
        committees: 2,
        upcomingMeetings: 0,
        decisionsThisMonth: 0,
        activeMembers: 0,
        activityScore: 0,
      };

      setMetricData(metrics);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  // Get one metric group per mode for the 4 rotating tiles
  const modeMetrics = [
    { group: getMetricGroupsByMode(OperationalMode.DESIGN)[0], tone: 'primary' as const, label: 'Studio / Build' },
    { group: getMetricGroupsByMode(OperationalMode.OPERATE)[0], tone: 'secondary' as const, label: 'Edge / Operate' },
    { group: getMetricGroupsByMode(OperationalMode.DISPUTE)[0], tone: 'accent' as const, label: 'Summit / Roll Out' },
    { group: getMetricGroupsByMode(OperationalMode.OVERSEE)[0], tone: 'infra' as const, label: 'Governance / Control' },
  ].filter((item) => item.group); // Filter out undefined

  return (
    <>
      <SetPageTitle
        title="Sales Governance Management"
        description="Choose your workflow mode: Design, Operate, Dispute, or Oversee"
      />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Mode Metrics Bar - 4 rotating tiles, one per mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
            {modeMetrics.map(({ group, tone }) => (
              <RotatingMetricTile key={group.id} group={group} metricData={metricData} tone={tone} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-muted)] mb-8">
            <span className="font-semibold text-[color:var(--color-foreground)]">Palette legend</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }} />
              Studio / Build
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-secondary)' }} />
              Edge / Operate
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-accent)' }} />
              Summit / Roll Out
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#0f172a]" />
              Governance / Control
            </span>
          </div>

          {/* 4 Operational Mode Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModeCard mode={OperationalMode.DESIGN} />
            <ModeCard mode={OperationalMode.OPERATE} />
            <ModeCard mode={OperationalMode.DISPUTE} />
            <ModeCard mode={OperationalMode.OVERSEE} />
          </div>

          {/* AICR Platform Integration - Pulse & Tasks */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <PulseWidget tone="accent" />
            <TaskWidget tone="infra" />
          </div>
        </div>
      </div>
    </>
  );
}
