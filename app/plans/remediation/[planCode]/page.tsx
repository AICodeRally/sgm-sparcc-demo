'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  Cross2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  GOVERNANCE_FRAMEWORK_POLICIES,
  getPlanCoverage,
  getPlanCoverageSummary,
  type PolicyCoverageStatus,
} from '@/lib/data/governance-framework.data';

interface Props {
  params: Promise<{ planCode: string }>;
}

export default function PlanRemediationPage({ params }: Props) {
  const { planCode } = use(params);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | PolicyCoverageStatus>('ALL');

  const coverage = getPlanCoverage(planCode);
  const summary = getPlanCoverageSummary(planCode);

  const toggleSection = (policyId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: PolicyCoverageStatus) => {
    switch (status) {
      case 'COVERED':
        return {
          bg: 'bg-[color:var(--color-success-bg)]',
          border: 'border-[color:var(--color-success-border)]',
          text: 'text-[color:var(--color-success)]',
          icon: 'text-[color:var(--color-success)]',
          badge: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
        };
      case 'NEEDS_WORK':
        return {
          bg: 'bg-[color:var(--color-warning-bg)]',
          border: 'border-[color:var(--color-warning-border)]',
          text: 'text-[color:var(--color-warning)]',
          icon: 'text-[color:var(--color-warning)]',
          badge: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
        };
      case 'MISSING':
        return {
          bg: 'bg-[color:var(--color-error-bg)]',
          border: 'border-[color:var(--color-error-border)]',
          text: 'text-[color:var(--color-error)]',
          icon: 'text-[color:var(--color-error)]',
          badge: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]',
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-transparent text-white';
      case 'HIGH':
        return 'bg-[color:var(--color-warning)] text-white';
      case 'MEDIUM':
        return 'bg-[color:var(--color-surface-alt)]0 text-white';
      default:
        return 'bg-[color:var(--color-surface-alt)]0 text-white';
    }
  };

  const filteredCoverage =
    selectedStatus === 'ALL'
      ? coverage
      : coverage.filter((c) => c.status === selectedStatus);

  return (
    <>
      <SetPageTitle
        title="Plan Remediation"
        description="Governance Gap Analysis & Draft Language"
      />

      <div className="min-h-screen sparcc-hero-bg">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/henryschein/plans"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Plans
                </Link>
                <div className="h-6 w-px bg-[color:var(--color-accent-border)]"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                    Plan Remediation Workspace
                  </h1>
                  <p className="text-sm text-[color:var(--color-muted)]">{planCode} - Gap Analysis & Draft Language</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[color:var(--color-muted)]">STATUS:</span>
                <span className="px-3 py-1 rounded-full bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] text-sm font-semibold border border-[color:var(--color-warning-border)]">
                  DRAFT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Summary */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)] shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4">Governance Coverage Summary</h2>

            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-[color:var(--color-success-bg)] rounded-lg border border-[color:var(--color-success-border)] p-4">
                <div className="text-3xl font-bold text-[color:var(--color-success)]">{summary.covered}</div>
                <div className="text-sm text-[color:var(--color-success)] font-medium">Covered</div>
              </div>
              <div className="bg-[color:var(--color-warning-bg)] rounded-lg border border-[color:var(--color-warning-border)] p-4">
                <div className="text-3xl font-bold text-[color:var(--color-warning)]">{summary.needsWork}</div>
                <div className="text-sm text-[color:var(--color-warning)] font-medium">Needs Work</div>
              </div>
              <div className="bg-[color:var(--color-error-bg)] rounded-lg border border-[color:var(--color-error-border)] p-4">
                <div className="text-3xl font-bold text-[color:var(--color-error)]">{summary.missing}</div>
                <div className="text-sm text-[color:var(--color-error)] font-medium">Missing</div>
              </div>
              <div className="bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)] p-4">
                <div className="text-3xl font-bold text-[color:var(--color-primary)]">{summary.total}</div>
                <div className="text-sm text-[color:var(--color-primary)] font-medium">Total Policies</div>
              </div>
              <div className="bg-[color:var(--color-info-bg)] rounded-lg border border-[color:var(--color-info-border)] p-4">
                <div className="text-3xl font-bold text-[color:var(--color-primary)]">{summary.completenessScore}%</div>
                <div className="text-sm text-[color:var(--color-info)] font-medium">Completeness</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[color:var(--color-foreground)]">Filter:</span>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'ALL'
                    ? 'bg-[color:var(--color-primary)] text-white'
                    : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                All ({coverage.length})
              </button>
              <button
                onClick={() => setSelectedStatus('COVERED')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'COVERED'
                    ? 'bg-[color:var(--color-success)] text-white'
                    : 'bg-[color:var(--color-surface)] border border-[color:var(--color-success-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-success-bg)]'
                }`}
              >
                Covered ({summary.covered})
              </button>
              <button
                onClick={() => setSelectedStatus('NEEDS_WORK')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'NEEDS_WORK'
                    ? 'bg-[color:var(--color-warning)] text-white'
                    : 'bg-[color:var(--color-surface)] border border-[color:var(--color-warning-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-warning-bg)]'
                }`}
              >
                Needs Work ({summary.needsWork})
              </button>
              <button
                onClick={() => setSelectedStatus('MISSING')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'MISSING'
                    ? 'bg-[color:var(--color-error)] text-white'
                    : 'bg-[color:var(--color-surface)] border border-[color:var(--color-error-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-error-bg)]'
                }`}
              >
                Missing ({summary.missing})
              </button>
            </div>
          </div>

          {/* Policy Coverage List */}
          <div className="space-y-3">
            {GOVERNANCE_FRAMEWORK_POLICIES.map((policy) => {
              const policyCoverage = coverage.find((c) => c.policyId === policy.id);
              if (!policyCoverage) return null;

              if (selectedStatus !== 'ALL' && policyCoverage.status !== selectedStatus) {
                return null;
              }

              const isExpanded = expandedSections.has(policy.id);
              const colors = getStatusColor(policyCoverage.status);

              return (
                <div
                  key={policy.id}
                  className={`bg-[color:var(--color-surface)] rounded-lg border-2 ${colors.border} shadow-md overflow-hidden transition-all`}
                >
                  {/* Policy Header */}
                  <button
                    onClick={() => toggleSection(policy.id)}
                    className={`w-full px-6 py-4 flex items-center justify-between hover:bg-[color:var(--color-surface-alt)] transition-colors ${
                      isExpanded ? colors.bg : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? (
                        <ChevronDownIcon className={`w-5 h-5 ${colors.icon}`} />
                      ) : (
                        <ChevronRightIcon className={`w-5 h-5 ${colors.icon}`} />
                      )}

                      {policyCoverage.status === 'COVERED' ? (
                        <CheckCircledIcon className={`w-6 h-6 ${colors.icon}`} />
                      ) : policyCoverage.status === 'NEEDS_WORK' ? (
                        <ExclamationTriangleIcon className={`w-6 h-6 ${colors.icon}`} />
                      ) : (
                        <Cross2Icon className={`w-6 h-6 ${colors.icon}`} />
                      )}

                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-lg ${colors.text}`}>{policy.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(policy.priority)}`}>
                            {policy.priority}
                          </span>
                        </div>
                        <p className="text-sm text-[color:var(--color-muted)]">{policy.description}</p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                      {policyCoverage.status.replace('_', ' ')}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className={`px-6 py-4 border-t ${colors.border} ${colors.bg}`}>
                      {/* Existing Language (if present) */}
                      {policyCoverage.existingLanguage && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-[color:var(--color-foreground)] mb-2 inline-flex items-center gap-2">
                            <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-success)]" />
                            <span>Existing Language in Plan:</span>
                          </h4>
                          <div className="bg-[color:var(--color-surface)] rounded border border-[color:var(--color-border)] p-3">
                            <p className="text-sm text-[color:var(--color-foreground)]">{policyCoverage.existingLanguage}</p>
                          </div>
                        </div>
                      )}

                      {/* Draft Additive Language (if NEEDS_WORK) */}
                      {policyCoverage.draftAdditiveLanguage && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-[color:var(--color-warning)] mb-2 inline-flex items-center gap-2">
                            <PlusCircledIcon className="w-4 h-4" />
                            <span>Draft Additive Language:</span>
                          </h4>
                          <div className="bg-[color:var(--color-warning-bg)] rounded border-2 border-[color:var(--color-warning-border)] p-4">
                            <pre className="text-sm text-[color:var(--color-foreground)] whitespace-pre-wrap font-sans">
                              {policyCoverage.draftAdditiveLanguage}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Draft Missing Language (if MISSING) */}
                      {policyCoverage.draftMissingLanguage && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-[color:var(--color-error)] mb-2 inline-flex items-center gap-2">
                            <Cross2Icon className="w-4 h-4" />
                            <span>Draft Missing Section (to be added):</span>
                          </h4>
                          <div className="bg-[color:var(--color-error-bg)] rounded border-2 border-[color:var(--color-error-border)] p-4">
                            <pre className="text-sm text-[color:var(--color-foreground)] whitespace-pre-wrap font-sans">
                              {policyCoverage.draftMissingLanguage}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {policyCoverage.notes && (
                        <div className="bg-[color:var(--color-surface-alt)] rounded border border-[color:var(--color-info-border)] p-3">
                          <p className="text-xs text-[color:var(--color-info)]">
                            <strong>Note:</strong> {policyCoverage.notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        <button className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors text-sm font-medium">
                          Accept Draft
                        </button>
                        <button className="px-4 py-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-primary)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors text-sm font-medium">
                          Edit Language
                        </button>
                        <button className="px-4 py-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors text-sm font-medium">
                          Skip for Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
