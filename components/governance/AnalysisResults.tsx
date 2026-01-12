'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, AlertCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import type { AnalysisResult, GapEntry, RiskTrigger } from './DocumentUploader';
import { GapCardAI } from './GapCardAI';

interface AnalysisResultsProps {
  result: AnalysisResult;
  fileName: string;
  documentId: string;
  planText?: string;
  organizationContext?: {
    name: string;
    state: string;
    industry?: string;
  };
  onApplyPatch?: (gap: GapEntry) => void;
  onViewPatches?: () => void;
  onViewChecklist?: () => void;
}

export function AnalysisResults({
  result,
  fileName,
  documentId,
  planText,
  organizationContext,
  onApplyPatch,
  onViewPatches,
  onViewChecklist,
}: AnalysisResultsProps) {
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const toggleGap = (requirementId: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(requirementId)) {
        next.delete(requirementId);
      } else {
        next.add(requirementId);
      }
      return next;
    });
  };

  const getCoverageGrade = (score: number) => {
    if (score >= 0.8) return { grade: 'A', color: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]' };
    if (score >= 0.4) return { grade: 'B', color: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]' };
    return { grade: 'C', color: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]' };
  };

  const getLiabilityColor = (score: number) => {
    if (score >= 4) return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
    if (score >= 3) return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
    if (score >= 2) return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
    return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      CRITICAL: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]',
      HIGH: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
      MEDIUM: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
      LOW: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]',
    };
    return badges[severity as keyof typeof badges] || badges.LOW;
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      CRITICAL: <AlertCircle className="w-4 h-4 text-[color:var(--color-error)]" />,
      HIGH: <AlertTriangle className="w-4 h-4 text-[color:var(--color-warning)]" />,
      MEDIUM: <Info className="w-4 h-4 text-[color:var(--color-warning)]" />,
      LOW: <Info className="w-4 h-4 text-[color:var(--color-info)]" />,
    };
    return icons[severity as keyof typeof icons] || icons.LOW;
  };

  const filteredGaps = selectedSeverity === 'all'
    ? result.gaps
    : result.gaps.filter((g) => g.severity === selectedSeverity);

  const gapsBySeverity = {
    CRITICAL: result.gaps.filter((g) => g.severity === 'CRITICAL').length,
    HIGH: result.gaps.filter((g) => g.severity === 'HIGH').length,
    MEDIUM: result.gaps.filter((g) => g.severity === 'MEDIUM').length,
    LOW: result.gaps.filter((g) => g.severity === 'LOW').length,
  };

  const coverageGrade = getCoverageGrade(result.coverage_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
              Gap Analysis Results
            </h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              {fileName} • Analyzed {new Date(result.analyzed_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            {onViewPatches && (
              <button
                onClick={onViewPatches}
                className="flex items-center gap-2 px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-secondary)] transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                View Patches
              </button>
            )}
            {onViewChecklist && (
              <button
                onClick={onViewChecklist}
                className="flex items-center gap-2 px-4 py-2 bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-surface-alt)] transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Checklist
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Coverage Grade"
            value={coverageGrade.grade}
            subtitle={`${(result.coverage_score * 100).toFixed(1)}%`}
            className={coverageGrade.color}
          />
          <MetricCard
            label="Liability Score"
            value={result.liability_score.toFixed(1)}
            subtitle="out of 5.0"
            className={getLiabilityColor(result.liability_score)}
          />
          <MetricCard
            label="Total Gaps"
            value={result.total_gaps.toString()}
            subtitle={`of ${result.total_requirements} requirements`}
            className="bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]"
          />
          <MetricCard
            label="Risk Triggers"
            value={result.risk_triggers.length.toString()}
            subtitle="patterns detected"
            className="bg-[color:var(--color-surface-alt)] text-[color:var(--color-accent)] border-[color:var(--color-border)]"
          />
        </div>
      </div>

      {/* Risk Triggers */}
      {result.risk_triggers.length > 0 && (
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
            Risk Triggers Detected
          </h3>
          <div className="space-y-3">
            {result.risk_triggers.map((trigger) => (
              <RiskTriggerCard key={trigger.id} trigger={trigger} />
            ))}
          </div>
        </div>
      )}

      {/* Gap Filters */}
      <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Policy Gaps ({filteredGaps.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'all'
                  ? 'bg-[color:var(--color-foreground)] text-[color:var(--color-surface)]'
                  : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-border)]'
              }`}
            >
              All ({result.gaps.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-[color:var(--color-error)] text-white'
                  : 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] hover:bg-[color:var(--color-error-bg)]'
              }`}
            >
              Critical ({gapsBySeverity.CRITICAL})
            </button>
            <button
              onClick={() => setSelectedSeverity('HIGH')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'HIGH'
                  ? 'bg-[color:var(--color-warning)] text-white'
                  : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] hover:bg-[color:var(--color-warning-bg)]'
              }`}
            >
              High ({gapsBySeverity.HIGH})
            </button>
            <button
              onClick={() => setSelectedSeverity('MEDIUM')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'MEDIUM'
                  ? 'bg-[color:var(--color-warning)] text-white'
                  : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] hover:bg-[color:var(--color-warning-bg)]'
              }`}
            >
              Medium ({gapsBySeverity.MEDIUM})
            </button>
            <button
              onClick={() => setSelectedSeverity('LOW')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedSeverity === 'LOW'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-info-bg)]'
              }`}
            >
              Low ({gapsBySeverity.LOW})
            </button>
          </div>
        </div>

        {/* Gap List */}
        <div className="space-y-2">
          {filteredGaps.map((gap) => (
            <GapCardAI
              key={gap.requirement_id}
              gap={gap}
              documentId={documentId}
              planText={planText}
              organizationContext={organizationContext}
              isExpanded={expandedGaps.has(gap.requirement_id)}
              onToggle={() => toggleGap(gap.requirement_id)}
            />
          ))}
        </div>

        {filteredGaps.length === 0 && (
          <div className="text-center py-8 text-[color:var(--color-muted)]">
            No {selectedSeverity.toLowerCase()} severity gaps found
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle: string;
  className: string;
}

function MetricCard({ label, value, subtitle, className }: MetricCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <p className="text-xs font-medium mb-1 opacity-75">{label}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{subtitle}</p>
    </div>
  );
}

interface RiskTriggerCardProps {
  trigger: RiskTrigger;
}

function RiskTriggerCard({ trigger }: RiskTriggerCardProps) {
  const getImpactColor = (impact: number) => {
    if (impact >= 3) return 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
    if (impact >= 2) return 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
    return 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
  };

  return (
    <div className={`border rounded-md p-4 ${getImpactColor(trigger.impact)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-[color:var(--color-foreground)]">{trigger.name}</h4>
          <p className="text-sm text-[color:var(--color-foreground)] mt-1">{trigger.description}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-[color:var(--color-surface)] rounded-md ml-4">
          Impact: +{trigger.impact}
        </span>
      </div>
      {trigger.matched_patterns.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-[color:var(--color-foreground)] mb-1">
            Matched Patterns:
          </p>
          <div className="flex flex-wrap gap-1">
            {trigger.matched_patterns.map((pattern, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-[color:var(--color-surface)] rounded-md text-[color:var(--color-foreground)]"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
