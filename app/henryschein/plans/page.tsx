'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  ClipboardIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface PlanCoverage {
  planName: string;
  businessUnit?: string;
  planType?: string;
  legalRisk?: string;
  financialRisk?: string;
  coverageStats: {
    full: number;
    limited: number;
    no: number;
    total: number;
    percentage: number;
  };
  policyCoverage: Record<string, { coverage: string; details: string }>;
}

export default function HenryScheinPlans() {
  const [plans, setPlans] = useState<PlanCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanCoverage | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'coverage'>('coverage');

  useEffect(() => {
    fetch('/api/henryschein/plans')
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans || []);
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSortedPlans = () => {
    const sorted = [...plans];
    if (sortBy === 'coverage') {
      sorted.sort((a, b) => a.coverageStats.percentage - b.coverageStats.percentage);
    } else {
      sorted.sort((a, b) => a.planName.localeCompare(b.planName));
    }
    return sorted;
  };

  const getCoverageColor = (pct: number) => {
    if (pct >= 80) return 'text-[color:var(--color-success)]';
    if (pct >= 60) return 'text-[color:var(--color-warning)]';
    return 'text-[color:var(--color-error)]';
  };

  const getCoverageBg = (pct: number) => {
    if (pct >= 80) return 'bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]';
    if (pct >= 60) return 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
    return 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-surface-alt)]">
        <p className="text-[color:var(--color-muted)]">Loading plans...</p>
      </div>
    );
  }

  const sortedPlans = getSortedPlans();

  return (
    <>
      <SetPageTitle
        title="Henry Schein - Plans Overview"
        description="27 compensation plans with governance scoring"
      />
      <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
        {/* Header */}
        <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/henryschein"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-[color:var(--color-border)]"></div>
                <div>
                  <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">Plan-by-Plan Analysis</h1>
                  <p className="text-sm text-[color:var(--color-muted)]">{plans.length} compensation plans analyzed</p>
                </div>
              </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[color:var(--color-muted)]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'coverage')}
                className="px-3 py-1 text-sm border border-[color:var(--color-border)] rounded-md"
              >
                <option value="coverage">Coverage (Low to High)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map((plan) => (
            <div
              key={plan.planName}
              className={`rounded-lg border-2 p-6 cursor-pointer hover:shadow-lg transition-all ${getCoverageBg(
                plan.coverageStats.percentage
              )}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-[color:var(--color-foreground)] flex-1 mr-2">{plan.planName}</h3>
                <span
                  className={`text-3xl font-bold ${getCoverageColor(plan.coverageStats.percentage)}`}
                >
                  {plan.coverageStats.percentage.toFixed(0)}%
                </span>
              </div>

              {plan.businessUnit && (
                <p className="text-sm text-[color:var(--color-muted)] mb-3">
                  <span className="font-medium">Business Unit:</span> {plan.businessUnit}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[color:var(--color-success)]">{plan.coverageStats.full}</p>
                  <p className="text-xs text-[color:var(--color-muted)]">FULL</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[color:var(--color-warning)]">{plan.coverageStats.limited}</p>
                  <p className="text-xs text-[color:var(--color-muted)]">LIMITED</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[color:var(--color-error)]">{plan.coverageStats.no}</p>
                  <p className="text-xs text-[color:var(--color-muted)]">NO</p>
                </div>
              </div>

              {(plan.legalRisk || plan.financialRisk) && (
                <div className="pt-3 border-t border-[color:var(--color-border)] space-y-1">
                  {plan.legalRisk && (
                    <p className="text-xs">
                      <span className="font-medium">Legal Risk:</span>{' '}
                      <span
                        className={
                          plan.legalRisk === 'HIGH'
                            ? 'text-[color:var(--color-error)] font-bold'
                            : plan.legalRisk === 'MEDIUM'
                            ? 'text-[color:var(--color-warning)] font-bold'
                            : 'text-[color:var(--color-success)] font-bold'
                        }
                      >
                        {plan.legalRisk}
                      </span>
                    </p>
                  )}
                  {plan.financialRisk && (
                    <p className="text-xs">
                      <span className="font-medium">Financial Risk:</span>{' '}
                      <span
                        className={
                          plan.financialRisk.includes('HIGH')
                            ? 'text-[color:var(--color-error)] font-bold'
                            : 'text-[color:var(--color-warning)] font-bold'
                        }
                      >
                        {plan.financialRisk}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/plans/document/HS-MED-FSC-2025"
                  className="px-3 py-2 bg-[color:var(--color-surface)] border-2 border-[color:var(--color-info-border)] text-[color:var(--color-primary)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-all text-sm font-semibold text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="inline-flex items-center gap-1 justify-center">
                    <ClipboardIcon className="h-4 w-4" />
                    Governance Analysis
                  </span>
                </Link>
                <Link
                  href="/plans/remediation/HS-MED-FSC-2025"
                  className="px-3 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all text-sm font-semibold text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="inline-flex items-center gap-1 justify-center">
                    <GearIcon className="h-4 w-4" />
                    Gap Analysis
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Detail Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[color:var(--color-surface)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">{selectedPlan.planName}</h2>
                    {selectedPlan.businessUnit && (
                      <p className="text-sm text-[color:var(--color-muted)] mt-1">{selectedPlan.businessUnit}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-[color:var(--color-muted)] hover:text-[color:var(--color-muted)] text-2xl"
                  >
                    x
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <p className="text-sm text-[color:var(--color-muted)]">Overall Coverage</p>
                    <p
                      className={`text-4xl font-bold ${getCoverageColor(
                        selectedPlan.coverageStats.percentage
                      )}`}
                    >
                      {selectedPlan.coverageStats.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-[color:var(--color-muted)]">Full</p>
                      <p className="text-2xl font-bold text-[color:var(--color-success)]">
                        {selectedPlan.coverageStats.full}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[color:var(--color-muted)]">Limited</p>
                      <p className="text-2xl font-bold text-[color:var(--color-warning)]">
                        {selectedPlan.coverageStats.limited}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[color:var(--color-muted)]">No</p>
                      <p className="text-2xl font-bold text-[color:var(--color-error)]">
                        {selectedPlan.coverageStats.no}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h3 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4">Policy Coverage Details</h3>
                <div className="space-y-3">
                  {Object.entries(selectedPlan.policyCoverage).map(([policy, data]) => (
                    <div
                      key={policy}
                      className={`p-4 rounded-lg border-2 ${
                        data.coverage === 'FULL'
                          ? 'bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]'
                          : data.coverage === 'LIMITED'
                          ? 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]'
                          : 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-[color:var(--color-foreground)]">{policy}</h4>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${
                            data.coverage === 'FULL'
                              ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                              : data.coverage === 'LIMITED'
                              ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              : 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                          }`}
                        >
                          {data.coverage}
                        </span>
                      </div>
                      <p className="text-sm text-[color:var(--color-foreground)]">{data.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-secondary)] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircledIcon className="w-6 h-6 text-[color:var(--color-success)]" />
              <h3 className="text-sm font-medium text-[color:var(--color-foreground)]">High Coverage Plans (&gt;80%)</h3>
            </div>
            <p className="text-3xl font-bold text-[color:var(--color-success)]">
              {plans.filter((p) => p.coverageStats.percentage >= 80).length}
            </p>
            <p className="text-sm text-[color:var(--color-muted)] mt-2">
              {((plans.filter((p) => p.coverageStats.percentage >= 80).length / plans.length) * 100).toFixed(0)}% of total
            </p>
          </div>

          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-[color:var(--color-warning)]" />
              <h3 className="text-sm font-medium text-[color:var(--color-foreground)]">Medium Coverage Plans (60-80%)</h3>
            </div>
            <p className="text-3xl font-bold text-[color:var(--color-warning)]">
              {
                plans.filter(
                  (p) => p.coverageStats.percentage >= 60 && p.coverageStats.percentage < 80
                ).length
              }
            </p>
            <p className="text-sm text-[color:var(--color-muted)] mt-2">
              {((plans.filter((p) => p.coverageStats.percentage >= 60 && p.coverageStats.percentage < 80).length / plans.length) * 100).toFixed(0)}% of total
            </p>
          </div>

          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CrossCircledIcon className="w-6 h-6 text-[color:var(--color-error)]" />
              <h3 className="text-sm font-medium text-[color:var(--color-foreground)]">Low Coverage Plans (&lt;60%)</h3>
            </div>
            <p className="text-3xl font-bold text-[color:var(--color-error)]">
              {plans.filter((p) => p.coverageStats.percentage < 60).length}
            </p>
            <p className="text-sm text-[color:var(--color-muted)] mt-2">
              {((plans.filter((p) => p.coverageStats.percentage < 60).length / plans.length) * 100).toFixed(0)}% of total - <span className="font-bold text-[color:var(--color-error)]">CRITICAL</span>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
