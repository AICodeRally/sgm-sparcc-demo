'use client';

import React, { useEffect, useState, use } from 'react';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { RoadmapTimeline } from '@/components/client/RoadmapTimeline';

interface RoadmapPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function RoadmapPage({ params }: RoadmapPageProps) {
  const { tenantSlug } = use(params);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch(`/api/client/${tenantSlug}/roadmap`);
        const data = await response.json();
        setPhases(data.phases || []);
      } catch (error) {
        console.error('Failed to load roadmap:', error);
        setPhases(getMockRoadmap());
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [tenantSlug]);

  if (loading) {
    return (
      <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Loading...">
        <div className="text-center py-12">
          <p className="text-[color:var(--color-muted)]">Loading roadmap...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout tenantSlug={tenantSlug} tenantName="Demo Client">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">Implementation Roadmap</h1>
        <p className="text-[color:var(--color-muted)]">
          Phased implementation plan with milestones and deliverables
        </p>
      </div>

      <RoadmapTimeline phases={phases} />
    </ClientDashboardLayout>
  );
}

function getMockRoadmap() {
  const baseDate = new Date();

  return [
    {
      id: 'phase-1',
      phase: 'Weeks 1-3',
      title: 'Discovery & Gap Analysis',
      description: 'Analyze existing plans, identify gaps, and establish governance baseline',
      status: 'COMPLETED',
      completionPct: 100,
      milestones: [
        { title: 'Plan documentation review', completed: true },
        { title: 'Stakeholder interviews', completed: true },
        { title: 'Gap identification workshop', completed: true },
        { title: 'Initial findings report', completed: true },
      ],
      startDate: new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(baseDate.getTime() - 39 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'phase-2',
      phase: 'Weeks 4-6',
      title: 'Policy Framework Design',
      description: 'Design governance framework, draft policies, and establish approval processes',
      status: 'IN_PROGRESS',
      completionPct: 60,
      milestones: [
        { title: 'SGCC charter and procedures', completed: true },
        { title: 'CRB charter and procedures', completed: true },
        { title: 'Territory management policy', completed: false },
        { title: 'Windfall deal procedures', completed: false },
      ],
      startDate: new Date(baseDate.getTime() - 38 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(baseDate.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'phase-3',
      phase: 'Weeks 7-10',
      title: 'Implementation & Rollout',
      description: 'Implement policies, configure systems, and train stakeholders',
      status: 'NOT_STARTED',
      completionPct: 0,
      milestones: [
        { title: 'Policy documentation finalization', completed: false },
        { title: 'System configuration and testing', completed: false },
        { title: 'Stakeholder training sessions', completed: false },
        { title: 'Soft launch and monitoring', completed: false },
      ],
      startDate: new Date(baseDate.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'phase-4',
      phase: 'Weeks 11-12',
      title: 'Validation & Handoff',
      description: 'Validate implementation, conduct final review, and transition to operations',
      status: 'NOT_STARTED',
      completionPct: 0,
      milestones: [
        { title: 'Compliance validation audit', completed: false },
        { title: 'Final stakeholder review', completed: false },
        { title: 'Documentation handoff', completed: false },
        { title: 'Ongoing support transition', completed: false },
      ],
      startDate: new Date(baseDate.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(baseDate.getTime() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
