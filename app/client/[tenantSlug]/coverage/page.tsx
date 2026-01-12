'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { CoverageMatrix } from '@/components/client/CoverageMatrix';

interface CoveragePageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function CoveragePage({ params }: CoveragePageProps) {
  const { tenantSlug } = use(params);
  const [coverageData, setCoverageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const response = await fetch(`/api/client/${tenantSlug}/coverage`);
        const data = await response.json();
        setCoverageData(data);
      } catch (error) {
        console.error('Failed to load coverage data:', error);
        setCoverageData(getMockCoverageData());
      } finally {
        setLoading(false);
      }
    };

    fetchCoverage();
  }, [tenantSlug]);

  if (loading || !coverageData) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Loading...">
        <div className="text-center py-12">
          <p className="text-[color:var(--color-muted)]">Loading coverage matrix...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">Coverage Matrix</h1>
        <p className="text-[color:var(--color-muted)]">
          Interactive view of policy coverage across all compensation plans
        </p>
      </div>

      <CoverageMatrix plans={coverageData.plans} policyAreas={coverageData.policyAreas} />
    </ClientDashboardLayout>
  );
}

function getMockCoverageData() {
  const policyAreas = [
    'SGCC Approval Authority', 'CRB Review Process', 'Territory Management',
    'Windfall Deal Procedures', 'Commission Dispute Resolution', 'Plan Documentation',
    'Audit Trail Requirements', 'Approval Workflows', 'Exception Handling',
    'Compliance Monitoring', 'Data Retention', 'System Access Controls'
  ];

  const plans = Array.from({ length: 6 }, (_, i) => ({
    planCode: `PLAN-2025-${String(i + 1).padStart(3, '0')}`,
    planName: `Compensation Plan ${i + 1}`,
    policies: policyAreas.map((area) => ({
      policyArea: area,
      policyName: `${area} Policy`,
      coverage: (['FULL', 'LIMITED', 'NO'] as const)[Math.floor(Math.random() * 3)],
      notes: Math.random() > 0.7 ? 'Requires implementation or clarification' : undefined,
    })),
  }));

  return { plans, policyAreas };
}
