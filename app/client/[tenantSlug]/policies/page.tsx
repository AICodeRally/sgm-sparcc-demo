'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { PolicyRecommendations } from '@/components/client/PolicyRecommendations';

interface PoliciesPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function PoliciesPage({ params }: PoliciesPageProps) {
  const { tenantSlug } = use(params);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/client/${tenantSlug}/policies`);
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecommendations(getMockRecommendations());
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [tenantSlug]);

  if (loading) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Loading...">
        <div className="text-center py-12">
          <p className="text-[color:var(--color-muted)]">Loading policy recommendations...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">Policy Recommendations</h1>
        <p className="text-[color:var(--color-muted)]">
          BHG best practice policies recommended for implementation
        </p>
      </div>

      <PolicyRecommendations recommendations={recommendations} />
    </ClientDashboardLayout>
  );
}

function getMockRecommendations() {
  const categories = ['SGCC', 'CRB', 'Territory', 'Windfall', 'Dispute', 'Audit'];
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

  return Array.from({ length: 10 }, (_, i) => ({
    id: `rec-${i + 1}`,
    policyCode: `BHG-POL-${String(i + 1).padStart(3, '0')}`,
    policyName: `${categories[i % categories.length]} Governance Policy`,
    category: categories[i % categories.length],
    priority: priorities[Math.floor(i / 3)] as any,
    rationale: `This policy addresses critical gaps in ${categories[i % categories.length].toLowerCase()} governance and should be implemented to reduce compliance risk.`,
    impactedPlans: [`PLAN-2025-${String(Math.floor(i / 2) + 1).padStart(3, '0')}`],
    bhgReference: `BHG Framework Section ${i + 1}`,
  }));
}
