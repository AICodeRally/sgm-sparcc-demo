'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { MetricsGrid } from '@/components/client/MetricsGrid';
import { PlanCard } from '@/components/client/PlanCard';
import { GapAnalysisSection } from '@/components/client/GapAnalysisSection';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface ClientDashboardPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { tenantSlug } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/client/${tenantSlug}/dashboard`);
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Use mock data as fallback
        setDashboardData(getMockDashboardData());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantSlug]);

  if (loading || !dashboardData) {
    return (
      <ClientDashboardLayout
        tenantSlug={tenantSlug}
        tenantName="Loading..."
      >
        <div className="text-center py-12">
          <p className="text-[color:var(--color-muted)]">Loading dashboard...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  const {
    tenantName,
    brandingConfig,
    metrics,
    topPlans = [],
    criticalGaps = [],
    engagementStatus,
  } = dashboardData;

  return (
    <ClientDashboardLayout
      tenantSlug={tenantSlug}
      tenantName={tenantName}
      brandingConfig={brandingConfig}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">
          Governance Dashboard
        </h1>
        <p className="text-[color:var(--color-muted)]">
          Comprehensive gap analysis and implementation roadmap
        </p>
      </div>

      {/* Engagement Status Banner */}
      {engagementStatus && (
        <div className="bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">{engagementStatus.type}</h2>
              <p className="text-white/80">
                Started: {new Date(engagementStatus.startDate).toLocaleDateString()} •
                Status: <span className="font-semibold">{engagementStatus.status}</span>
              </p>
            </div>
            <Link href={`/client/${tenantSlug}/roadmap`}>
              <button className="bg-[color:var(--color-surface)] text-[color:var(--color-accent)] px-4 py-2 rounded-lg font-semibold hover:bg-[color:var(--color-accent-bg)] transition-colors flex items-center gap-2">
                View Roadmap <ArrowRightIcon className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-4">Key Metrics</h2>
        <MetricsGrid metrics={metrics} />
      </div>

      {/* Top Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">High-Risk Plans</h2>
          <Link
            href={`/client/${tenantSlug}/plans`}
            className="text-sm text-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] font-semibold flex items-center gap-1"
          >
            View All Plans <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {topPlans.map((plan: any) => (
            <PlanCard
              key={plan.planCode}
              {...plan}
              detailsHref={`/client/${tenantSlug}/plans?plan=${plan.planCode}`}
            />
          ))}
        </div>
      </div>

      {/* Critical Gaps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Critical & High Priority Gaps</h2>
          <Link
            href={`/client/${tenantSlug}/gaps`}
            className="text-sm text-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] font-semibold flex items-center gap-1"
          >
            View All Gaps <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <GapAnalysisSection gaps={criticalGaps} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-6">
        <Link href={`/client/${tenantSlug}/coverage`}>
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6 hover:shadow-lg hover:border-[color:var(--color-accent-border)] transition-all cursor-pointer">
            <h3 className="font-bold text-[color:var(--color-foreground)] mb-2">Coverage Matrix</h3>
            <p className="text-sm text-[color:var(--color-muted)] mb-4">
              Interactive policy coverage visualization
            </p>
            <span className="text-[color:var(--color-accent)] text-sm font-semibold flex items-center gap-1">
              View Matrix <ArrowRightIcon className="w-4 h-4" />
            </span>
          </div>
        </Link>

        <Link href={`/client/${tenantSlug}/policies`}>
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6 hover:shadow-lg hover:border-[color:var(--color-accent-border)] transition-all cursor-pointer">
            <h3 className="font-bold text-[color:var(--color-foreground)] mb-2">Policy Recommendations</h3>
            <p className="text-sm text-[color:var(--color-muted)] mb-4">
              BHG best practice policy suggestions
            </p>
            <span className="text-[color:var(--color-accent)] text-sm font-semibold flex items-center gap-1">
              View Policies <ArrowRightIcon className="w-4 h-4" />
            </span>
          </div>
        </Link>

        <Link href={`/client/${tenantSlug}/roadmap`}>
          <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6 hover:shadow-lg hover:border-[color:var(--color-accent-border)] transition-all cursor-pointer">
            <h3 className="font-bold text-[color:var(--color-foreground)] mb-2">Implementation Roadmap</h3>
            <p className="text-sm text-[color:var(--color-muted)] mb-4">
              Phase-by-phase timeline and milestones
            </p>
            <span className="text-[color:var(--color-accent)] text-sm font-semibold flex items-center gap-1">
              View Roadmap <ArrowRightIcon className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>
    </ClientDashboardLayout>
  );
}

// Mock data for development
function getMockDashboardData() {
  return {
    tenantName: 'Demo Client',
    brandingConfig: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
    },
    metrics: [
      { label: 'Plans Analyzed', value: 27, colorClass: 'border-[color:var(--color-accent-border)]' },
      { label: 'Critical Gaps', value: 8, colorClass: 'border-[color:var(--color-error-border)]' },
      { label: 'Avg Risk Score', value: 64, subtext: 'High Risk', colorClass: 'border-[color:var(--color-warning-border)]' },
      { label: 'Coverage', value: '68%', trend: 'up', trendValue: '+5%', colorClass: 'border-[color:var(--color-success-border)]' },
    ],
    topPlans: [
      {
        planCode: 'SALES-2025-001',
        planName: 'Executive Sales Compensation Plan',
        planType: 'SALES',
        businessUnit: 'Corporate',
        coverageFull: 10,
        coverageLimited: 8,
        coverageNo: 8,
        riskScore: 78,
      },
      {
        planCode: 'SERVICE-2025-002',
        planName: 'Technical Services Commission Plan',
        planType: 'SERVICE',
        businessUnit: 'Operations',
        coverageFull: 8,
        coverageLimited: 12,
        coverageNo: 6,
        riskScore: 72,
      },
    ],
    criticalGaps: [
      {
        id: '1',
        planCode: 'SALES-2025-001',
        policyArea: 'SGCC Approval Authority',
        gapDescription: 'No formal SGCC approval process defined for windfall deals over $100K',
        severity: 'CRITICAL' as const,
        status: 'OPEN' as const,
        bhgPolicyRef: 'BHG-POL-001',
      },
      {
        id: '2',
        planCode: 'SALES-2025-001',
        policyArea: 'Territory Management',
        gapDescription: 'Territory change documentation requirements not specified',
        severity: 'HIGH' as const,
        status: 'PLANNED' as const,
        bhgPolicyRef: 'BHG-POL-015',
        assignedTo: 'Consultant Team',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    engagementStatus: {
      type: 'Gap Analysis & Implementation',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}
