'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface Gap {
  plan: string;
  policyArea: string;
  coverage: string;
  details: string;
  priority: string;
  bhgPolicy: string;
}

export default function HenryScheinGaps() {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'NO' | 'LIMITED'>('ALL');

  useEffect(() => {
    // Load plans and extract gaps
    fetch('/api/henryschein/plans')
      .then((res) => res.json())
      .then((data) => {
        const extractedGaps: Gap[] = [];

        (data.plans || []).forEach((plan: any) => {
          Object.entries(plan.policyCoverage || {}).forEach(([policyArea, policyData]: [string, any]) => {
            if (policyData.coverage === 'NO' || policyData.coverage === 'LIMITED') {
              extractedGaps.push({
                plan: plan.planName,
                policyArea,
                coverage: policyData.coverage,
                details: policyData.details,
                priority: getPriority(policyArea, policyData.coverage),
                bhgPolicy: getBHGPolicy(policyArea),
              });
            }
          });
        });

        setGaps(extractedGaps);
      })
      .catch((err) => {
        console.error('Failed to load gaps:', err);
        setGaps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getPriority = (policyArea: string, coverage: string) => {
    const criticalAreas = ['Windfall/Large Deals', 'Compliance (409A, State Wage)', 'Clawback/Recovery'];
    if (criticalAreas.includes(policyArea)) {
      return coverage === 'NO' ? 'CRITICAL' : 'HIGH';
    }
    return coverage === 'NO' ? 'HIGH' : 'MEDIUM';
  };

  const getBHGPolicy = (policyArea: string) => {
    const mapping: Record<string, string> = {
      'Windfall/Large Deals': 'Windfall/Large Deal Policy',
      'Compliance (409A, State Wage)': 'Section 409A + State Wage Law Policies',
      'Clawback/Recovery': 'Clawback & Recovery Policy',
      'Quota Management': 'Quota Management Policy',
      'SPIF Governance': 'SPIF Governance Policy',
    };
    return mapping[policyArea] || 'Not addressed by BHG policies';
  };

  const getFilteredGaps = () => {
    if (filterPriority === 'ALL') return gaps;
    return gaps.filter((gap) => gap.coverage === filterPriority);
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'CRITICAL') return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
    if (priority === 'HIGH') return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
    return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-surface-alt)]">
        <p className="text-[color:var(--color-muted)]">Loading gaps...</p>
      </div>
    );
  }

  const filteredGaps = getFilteredGaps();

  return (
    <>
      <SetPageTitle
        title="Henry Schein - Gap Analysis"
        description="Critical gaps, warnings, and recommendations"
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
                  <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-[color:var(--color-error)]" />
                    Critical Policy Gaps
                  </h1>
                  <p className="text-sm text-[color:var(--color-muted)]">{gaps.length} total gaps identified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="mb-6 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[color:var(--color-foreground)]">Filter by coverage level:</span>
            <div className="flex gap-2">
              {(['ALL', 'NO', 'LIMITED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterPriority(filter)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    filterPriority === filter
                      ? 'bg-[color:var(--color-error)] text-white'
                      : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-border)]'
                  }`}
                >
                  {filter} {filter !== 'ALL' && `(${gaps.filter((g) => g.coverage === filter).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-[color:var(--color-error-bg)] border-2 border-[color:var(--color-error-border)] rounded-lg p-6">
            <p className="text-sm font-medium text-[color:var(--color-error)]">NO Coverage Gaps</p>
            <p className="text-4xl font-bold text-[color:var(--color-error)] mt-2">
              {gaps.filter((g) => g.coverage === 'NO').length}
            </p>
            <p className="text-xs text-[color:var(--color-error)] mt-2">Requires immediate policy creation</p>
          </div>
          <div className="bg-[color:var(--color-warning-bg)] border-2 border-[color:var(--color-warning-border)] rounded-lg p-6">
            <p className="text-sm font-medium text-[color:var(--color-warning)]">LIMITED Coverage Gaps</p>
            <p className="text-4xl font-bold text-[color:var(--color-warning)] mt-2">
              {gaps.filter((g) => g.coverage === 'LIMITED').length}
            </p>
            <p className="text-xs text-[color:var(--color-warning)] mt-2">Needs enhancement with details/workflows</p>
          </div>
          <div className="bg-[color:var(--color-surface-alt)] border-2 border-[color:var(--color-info-border)] rounded-lg p-6">
            <p className="text-sm font-medium text-[color:var(--color-info)]">CRITICAL Priority Gaps</p>
            <p className="text-4xl font-bold text-[color:var(--color-info)] mt-2">
              {gaps.filter((g) => g.priority === 'CRITICAL').length}
            </p>
            <p className="text-xs text-[color:var(--color-primary)] mt-2">Must address in Q1 2026</p>
          </div>
        </div>

        {/* Gaps List */}
        <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[color:var(--color-surface-alt)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Policy Area
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    What's Missing
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    BHG Policy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[color:var(--color-surface)] divide-y divide-gray-200">
                {filteredGaps.map((gap, idx) => (
                  <tr key={idx} className="hover:bg-[color:var(--color-surface-alt)]">
                    <td className="px-6 py-4 text-sm font-medium text-[color:var(--color-foreground)]">
                      {gap.plan}
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--color-foreground)]">{gap.policyArea}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          gap.coverage === 'NO'
                            ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                            : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                        }`}
                      >
                        {gap.coverage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--color-foreground)] max-w-md">
                      {gap.details}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded border ${getPriorityColor(
                          gap.priority
                        )}`}
                      >
                        {gap.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--color-foreground)]">{gap.bhgPolicy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGaps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[color:var(--color-muted)]">No gaps match the selected filter</p>
            </div>
          )}
        </div>

        {/* Recommended Actions */}
        <div className="mt-6 bg-[color:var(--color-surface-alt)] border border-[color:var(--color-info-border)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-info)] mb-4">Recommended Actions</h3>
          <ul className="space-y-2 text-sm text-[color:var(--color-info)]">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>
                Prioritize plans with the most NO coverage gaps (Med Surg FSC Standard, Medical ISC Standard, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>
                Review and approve 6 BHG DRAFT policies in Q1 2026 to address the majority of gaps
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>
                Focus on CRITICAL priority areas first: Windfall, 409A, State Wage Law compliance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>
                Establish CRB (Compensation Review Board) to handle windfall deal approvals
              </span>
            </li>
          </ul>
        </div>
      </div>
      </div>
    </>
  );
}
