'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { GapAnalysisSection } from '@/components/client/GapAnalysisSection';

interface GapsPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function GapsPage({ params }: GapsPageProps) {
  const { tenantSlug } = use(params);
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const response = await fetch(`/api/client/${tenantSlug}/gaps`);
        const data = await response.json();
        setGaps(data.gaps || []);
      } catch (error) {
        console.error('Failed to load gaps:', error);
        setGaps(getMockGaps());
      } finally {
        setLoading(false);
      }
    };

    fetchGaps();
  }, [tenantSlug]);

  if (loading) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Loading...">
        <div className="text-center py-12">
          <p className="text-[color:var(--color-muted)]">Loading gaps...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">Gap Analysis</h1>
        <p className="text-[color:var(--color-muted)]">
          Identified governance gaps with severity assessment and recommendations
        </p>
      </div>

      <GapAnalysisSection gaps={gaps} />
    </ClientDashboardLayout>
  );
}

function getMockGaps() {
  const policyAreas = ['SGCC Approval', 'CRB Review', 'Territory Management', 'Windfall Deals', 'Commission Disputes'];
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
  const statuses = ['OPEN', 'PLANNED', 'IN_PROGRESS', 'RESOLVED'] as const;

  return Array.from({ length: 12 }, (_, i) => ({
    id: `gap-${i + 1}`,
    planCode: `PLAN-2025-${String(Math.floor(i / 3) + 1).padStart(3, '0')}`,
    policyArea: policyAreas[i % policyAreas.length],
    gapDescription: `Gap description for ${policyAreas[i % policyAreas.length]} requiring attention and remediation`,
    severity: severities[Math.floor(i / 3)] as any,
    status: statuses[i % statuses.length] as any,
    bhgPolicyRef: `BHG-POL-${String(i + 1).padStart(3, '0')}`,
    assignedTo: i % 2 === 0 ? 'Consultant Team' : undefined,
    dueDate: i % 2 === 0 ? new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  }));
}
