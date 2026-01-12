'use client';

import React, { useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeHeader } from '@/components/modes/ModeHeader';
import { FeatureTile } from '@/components/modes/FeatureTile';
import { Breadcrumb } from '@/components/Breadcrumb';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  BarChartIcon,
  PlusIcon,
  UpdateIcon,
  ArrowUpIcon,
} from '@radix-ui/react-icons';

export default function DisputeModePage() {
  const config = MODE_CONFIGS[OperationalMode.DISPUTE];
  const [metrics] = useState({
    activeCases: 4,
    highPriority: 1,
    approachingSLA: 2,
    avgResolution: 3.5,
  });

  return (
    <>
      <SetPageTitle
        title="Dispute Mode"
        description="Resolve exceptions, disputes, and escalations"
      />
      <div
        className="min-h-screen bg-gradient-to-br"
        style={{
          background: `linear-gradient(to bottom right, ${config.color.hex}15, ${config.color.hex}30)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ModeHeader mode={OperationalMode.DISPUTE} />

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-[color:var(--color-surface)] rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.activeCases}</p>
              <p className="text-sm text-[color:var(--color-muted)] mt-2">Active Cases</p>
            </div>
            <div className="bg-[color:var(--color-surface)] rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.highPriority}</p>
              <p className="text-sm text-[color:var(--color-muted)] mt-2">High Priority</p>
            </div>
            <div className="bg-[color:var(--color-surface)] rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.approachingSLA}</p>
              <p className="text-sm text-[color:var(--color-muted)] mt-2">Approaching SLA</p>
            </div>
            <div className="bg-[color:var(--color-surface)] rounded-xl border-2 p-6 text-center" style={{ borderColor: `${config.color.hex}30` }}>
              <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{metrics.avgResolution}</p>
              <p className="text-sm text-[color:var(--color-muted)] mt-2">Avg Days to Resolve</p>
            </div>
          </div>

          {/* Primary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">Primary Features</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureTile
                href="/cases"
                label="Cases Management"
                description="Exceptions, disputes, territory changes, and special requests"
                icon={<ExclamationTriangleIcon className="w-10 h-10" />}
                count={metrics.activeCases}
                primary
              />
              <FeatureTile
                href="/cases/sla"
                label="Case SLA & Load"
                description="SLA tracking, compliance monitoring, and workload optimization"
                icon={<ClockIcon className="w-10 h-10" />}
                count={metrics.approachingSLA}
                primary
              />
              <FeatureTile
                href="/cases/analytics"
                label="Case Analytics"
                description="AI predictions, trends, bottleneck detection, and capacity planning"
                icon={<BarChartIcon className="w-10 h-10" />}
                primary
              />
            </div>
          </div>

          {/* Secondary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureTile
                href="/cases/new"
                label="Submit Case"
                description="Create new dispute or exception request"
                icon={<PlusIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/cases?status=pending"
                label="My Cases"
                description="View your submitted cases"
                icon={<ExclamationTriangleIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/cases?priority=high"
                label="Escalations"
                description="High priority cases requiring attention"
                icon={<ArrowUpIcon className="w-8 h-8" />}
                count={metrics.highPriority}
              />
            </div>
          </div>

          {/* Field User Info */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl border-2 p-6 mb-8" style={{ borderColor: `${config.color.hex}30` }}>
            <h3 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4">For Field Sales & Managers</h3>
            <p className="text-[color:var(--color-foreground)] mb-4">
              Submit formal disputes and exception requests through the case management system.
              Track your submissions, provide additional documentation, and receive real-time updates on resolution status.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[color:var(--color-surface)] rounded-lg border p-4" style={{ borderColor: `${config.color.hex}30` }}>
                <p className="text-sm font-semibold text-[color:var(--color-foreground)] mb-2">Common Dispute Types</p>
                <ul className="text-xs text-[color:var(--color-muted)] space-y-1">
                  <li>• Commission calculation disputes</li>
                  <li>• Territory change requests</li>
                  <li>• Windfall deal approvals</li>
                  <li>• Plan interpretation questions</li>
                </ul>
              </div>
              <div className="bg-[color:var(--color-surface)] rounded-lg border p-4" style={{ borderColor: `${config.color.hex}30` }}>
                <p className="text-sm font-semibold text-[color:var(--color-foreground)] mb-2">Resolution SLA</p>
                <ul className="text-xs text-[color:var(--color-muted)] space-y-1">
                  <li>• Standard: 5 business days</li>
                  <li>• Urgent: 2 business days</li>
                  <li>• Critical: Same day</li>
                  <li>• Average actual: {metrics.avgResolution} days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
