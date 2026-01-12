'use client';

import React, { useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeHeader } from '@/components/modes/ModeHeader';
import { FeatureTile } from '@/components/modes/FeatureTile';
import { Breadcrumb } from '@/components/Breadcrumb';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import { ThemeBadge } from '@/components/ThemeBadge';
import { getToneStyles } from '@/lib/config/themes';
import {
  AvatarIcon,
  ClockIcon,
  BarChartIcon,
  CheckCircledIcon,
  FileTextIcon,
  DashboardIcon,
} from '@radix-ui/react-icons';

export default function OverseeModePage() {
  const config = MODE_CONFIGS[OperationalMode.OVERSEE];
  const [metrics] = useState({
    committees: 2,
    upcomingMeetings: 3,
    decisionsThisMonth: 8,
    activeMembers: 12,
    complianceScore: 96,
  });
  const toneStyles = getToneStyles('infra');

  return (
    <>
      <SetPageTitle
        title="Oversee Mode"
        description="Executive oversight, governance, and compliance"
      />
      <div
        className="min-h-screen bg-gradient-to-br"
        style={{
          background: `linear-gradient(to bottom right, ${config.color.hex}15, ${config.color.hex}30)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ModeHeader mode={OperationalMode.OVERSEE} />

          {/* Key Metrics */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Governance & Control Center</h2>
            <ThemeBadge />
          </div>
          <div className="grid grid-cols-5 gap-6 mb-8">
            {[
              { label: 'Committees', value: metrics.committees },
              { label: 'Meetings', value: metrics.upcomingMeetings },
              { label: 'Decisions', value: metrics.decisionsThisMonth },
              { label: 'Members', value: metrics.activeMembers },
              { label: 'Compliance', value: `${metrics.complianceScore}%` },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[color:var(--color-surface)] rounded-xl border-2 p-6 text-center theme-card"
                style={{ border: toneStyles.border, boxShadow: toneStyles.shadow }}
              >
                <p className="text-4xl font-bold" style={{ color: config.color.hex }}>{item.value}</p>
                <p className="text-sm text-[color:var(--color-muted)] mt-2">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Primary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">Primary Features</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureTile
                href="/committees"
                label="Committee Management"
                description="SGCC and CRB with 7 members, meeting management, and decision tracking"
                icon={<AvatarIcon className="w-10 h-10" />}
                count={metrics.committees}
                primary
              />
              <FeatureTile
                href="/audit"
                label="Audit Timeline"
                description="Comprehensive event history, compliance tracking, and audit trails"
                icon={<ClockIcon className="w-10 h-10" />}
                primary
              />
              <FeatureTile
                href="/analytics"
                label="Governance Analytics"
                description="Executive dashboards, KPIs, governance health metrics and trends"
                icon={<BarChartIcon className="w-10 h-10" />}
                primary
              />
            </div>
          </div>

          {/* Secondary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">Oversight Tools</h2>
            <div className="grid grid-cols-4 gap-6">
              <FeatureTile
                href="/committees/decisions"
                label="Decisions Log"
                description="Committee decisions and resolutions"
                icon={<CheckCircledIcon className="w-8 h-8" />}
                count={metrics.decisionsThisMonth}
              />
              <FeatureTile
                href="/governance-matrix"
                label="Compliance Monitor"
                description="Policy coverage and compliance status"
                icon={<FileTextIcon className="w-8 h-8" />}
                count={`${metrics.complianceScore}%`}
              />
              <FeatureTile
                href="/henryschein"
                label="Client Dashboards"
                description="Henry Schein gap analysis (template)"
                icon={<DashboardIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/analytics?view=risk"
                label="Risk Assessment"
                description="Governance risk scoring and mitigation"
                icon={<BarChartIcon className="w-8 h-8" />}
              />
            </div>
          </div>

          {/* Committee Overview */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl border-2 p-6 mb-8" style={{ borderColor: `${config.color.hex}30` }}>
            <h3 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4">Active Committees</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[color:var(--color-surface)] rounded-lg border p-6" style={{ borderColor: `${config.color.hex}30` }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-[color:var(--color-foreground)]">
                    Sales Governance Compliance Committee (SGCC)
                  </h4>
                  <span className="px-3 py-1 bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm text-[color:var(--color-foreground)]">
                  <p><strong>Members:</strong> 7</p>
                  <p><strong>Next Meeting:</strong> In 5 days</p>
                  <p><strong>Decisions This Month:</strong> {metrics.decisionsThisMonth}</p>
                  <p><strong>Responsibilities:</strong> Policy approval, compliance oversight, exception review</p>
                </div>
              </div>

              <div className="bg-[color:var(--color-surface)] rounded-lg border p-6" style={{ borderColor: `${config.color.hex}30` }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-[color:var(--color-foreground)]">
                    Compensation Review Board (CRB)
                  </h4>
                  <span className="px-3 py-1 bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm text-[color:var(--color-foreground)]">
                  <p><strong>Members:</strong> 5</p>
                  <p><strong>Next Meeting:</strong> In 12 days</p>
                  <p><strong>Focus:</strong> Windfall deals</p>
                  <p><strong>Responsibilities:</strong> Exception approvals, special case reviews, policy recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
