'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { ChecklistFrameworkView } from '@/components/governance/checklist';
import type { GovernanceFramework } from '@/lib/contracts/governance-framework.contract';

interface ChecklistPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function ChecklistPage({ params }: ChecklistPageProps) {
  const { tenantSlug } = use(params);
  const [framework, setFramework] = useState<GovernanceFramework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        // Fetch the governance implementation checklist (SPM-FW-004)
        const response = await fetch('/api/governance-framework/fw-004-id');
        if (!response.ok) {
          throw new Error('Failed to load checklist framework');
        }
        const data = await response.json();
        setFramework(data.framework);
      } catch (err) {
        console.error('Failed to load checklist:', err);
        setError('Unable to load the governance checklist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [tenantSlug]);

  if (loading) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Loading...">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--color-muted)]">Loading governance checklist...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (error || !framework) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
        <div className="text-center py-12">
          <p className="text-[color:var(--color-error)]">{error || 'Checklist not found'}</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">
          Governance Implementation Checklist
        </h1>
        <p className="text-[color:var(--color-muted)]">
          Track your progress through the 12-phase governance maturity journey
        </p>
      </div>

      {/* The ChecklistFrameworkView uses demo-engagement as the engagementId */}
      <ChecklistFrameworkView
        framework={framework}
        engagementId={`engagement-${tenantSlug}`}
      />
    </ClientDashboardLayout>
  );
}
