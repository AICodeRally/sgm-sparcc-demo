'use client';

import { useEffect, useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeCard } from '@/components/modes/ModeCard';
import { OperationalMode } from '@/types/operational-mode';
import { QuickActionSummary } from '@/components/dashboard/QuickActionSummary';

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

  return (
    <>
      <SetPageTitle
        title="Sales Governance Management"
        description="Choose your workflow mode: Design, Operate, Dispute, or Oversee"
      />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Action Summary - Task 3.3 */}
          <QuickActionSummary />

          {/* 4 Operational Mode Hero Cards with Stackable Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModeCard mode={OperationalMode.DESIGN} metricData={metricData} />
            <ModeCard mode={OperationalMode.OPERATE} metricData={metricData} />
            <ModeCard mode={OperationalMode.DISPUTE} metricData={metricData} />
            <ModeCard mode={OperationalMode.OVERSEE} metricData={metricData} />
          </div>
        </div>
      </div>
    </>
  );
}
