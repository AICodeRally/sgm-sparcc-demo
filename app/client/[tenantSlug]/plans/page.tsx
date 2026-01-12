'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { PlanCard } from '@/components/client/PlanCard';

interface PlansPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function PlansPage({ params }: PlansPageProps) {
  const { tenantSlug } = React.use(params);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`/api/client/${tenantSlug}/plans`);
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (error) {
        console.error('Failed to load plans:', error);
        setPlans(getMockPlans());
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [tenantSlug]);

  if (loading) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Loading...">
        <div className="text-center py-12">
          <p className="text-[color:var(--color-muted)]">Loading plans...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">Plan Analysis</h1>
        <p className="text-[color:var(--color-muted)]">
          {plans.length} compensation plans analyzed with policy coverage scoring
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.planCode}
            {...plan}
            detailsHref={`/client/${tenantSlug}/coverage?plan=${plan.planCode}`}
          />
        ))}
      </div>
    </ClientDashboardLayout>
  );
}

function getMockPlans() {
  return Array.from({ length: 6 }, (_, i) => ({
    planCode: `PLAN-2025-${String(i + 1).padStart(3, '0')}`,
    planName: `Sample Compensation Plan ${i + 1}`,
    planType: ['SALES', 'SERVICE', 'EXECUTIVE'][i % 3],
    businessUnit: ['Corporate', 'Operations', 'Regional'][i % 3],
    coverageFull: Math.floor(Math.random() * 15) + 5,
    coverageLimited: Math.floor(Math.random() * 10) + 5,
    coverageNo: Math.floor(Math.random() * 8) + 2,
    riskScore: Math.floor(Math.random() * 50) + 25,
  }));
}
