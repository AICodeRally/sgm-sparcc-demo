'use client';

import React, { useEffect, useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ModeHeader } from '@/components/modes/ModeHeader';
import { FeatureTile } from '@/components/modes/FeatureTile';
import { Breadcrumb } from '@/components/Breadcrumb';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import { ThemeBadge } from '@/components/ThemeBadge';
import { getToneStyles } from '@/lib/config/themes';
import {
  ReaderIcon,
  FileTextIcon,
  BookmarkIcon,
  TableIcon,
  Link2Icon,
  ArchiveIcon,
  BarChartIcon,
} from '@radix-ui/react-icons';

export default function DesignModePage() {
  const config = MODE_CONFIGS[OperationalMode.DESIGN];
  const [metrics, setMetrics] = useState({
    policies: 26,
    templates: 56,
    frameworks: 6,
    planCount: 27,
  });
  const toneStyles = getToneStyles('primary');

  return (
    <>
      <SetPageTitle
        title="Design Mode"
        description="Build compensation frameworks, policies, and templates"
      />
      <div
        className="min-h-screen bg-gradient-to-br"
        style={{
          background: `linear-gradient(to bottom right, ${config.color.hex}15, ${config.color.hex}30)`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ModeHeader mode={OperationalMode.DESIGN} />

          {/* Key Metrics */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Design Control Center</h2>
            <ThemeBadge />
          </div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Policies', value: metrics.policies },
              { label: 'Template Sections', value: metrics.templates },
              { label: 'Frameworks', value: metrics.frameworks },
              { label: 'Plans Analyzed', value: metrics.planCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border-2 p-6 text-center theme-card"
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
                href="/policies"
                label="Policy Library"
                description="26 governance policies with templates and best practices"
                icon={<ReaderIcon className="w-10 h-10" />}
                count={metrics.policies}
                primary
              />
              <FeatureTile
                href="/templates"
                label="Plan Templates"
                description="Build custom compensation plan templates with 56 sections"
                icon={<FileTextIcon className="w-10 h-10" />}
                count={metrics.templates}
                primary
              />
              <FeatureTile
                href="/governance-framework"
                label="Frameworks"
                description="6 governance pillars with 25 policies and compliance mapping"
                icon={<BookmarkIcon className="w-10 h-10" />}
                count={metrics.frameworks}
                primary
              />
            </div>
          </div>

          {/* Secondary Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">Analysis & Tools</h2>
            <div className="grid grid-cols-4 gap-6">
              <FeatureTile
                href="/governance-matrix"
                label="Governance Matrix"
                description="Policy coverage and approval authorities"
                icon={<TableIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/henryschein/plans"
                label="Gap Analysis"
                description="Policy coverage and risk scoring"
                icon={<BarChartIcon className="w-8 h-8" />}
                count={metrics.planCount}
              />
              <FeatureTile
                href="/framework/primer"
                label="Framework Primer"
                description="Learn the governance framework"
                icon={<BookmarkIcon className="w-8 h-8" />}
              />
              <FeatureTile
                href="/links"
                label="Document Links"
                description="Policy and document relationships"
                icon={<Link2Icon className="w-8 h-8" />}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
