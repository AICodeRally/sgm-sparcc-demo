'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, DownloadIcon } from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface PlanCoverage {
  planName: string;
  businessUnit?: string;
  coverageStats: {
    full: number;
    limited: number;
    no: number;
    percentage: number;
  };
  policyCoverage: Record<string, { coverage: string; details: string }>;
}

const POLICY_AREAS = [
  'Windfall/Large Deals',
  'Quota Management',
  'Territory Management',
  'Sales Crediting',
  'Clawback/Recovery',
  'SPIF Governance',
  'Termination/Final Pay',
  'New Hire/Onboarding',
  'Leave of Absence',
  'Payment Timing',
  'Compliance (409A, State Wage)',
  'Exceptions/Disputes',
  'Data/Systems/Controls',
  'Draws/Guarantees',
  'Mid-Period Changes',
  'International Requirements',
];

export default function PolicyCoverageMatrix() {
  const [plans, setPlans] = useState<PlanCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{
    plan: string;
    policy: string;
    coverage: string;
    details: string;
  } | null>(null);
  const [filterCoverage, setFilterCoverage] = useState<'ALL' | 'FULL' | 'LIMITED' | 'NO'>('ALL');

  useEffect(() => {
    // Load plan data
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

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'FULL':
        return 'bg-transparent hover:bg-[color:var(--color-success)]';
      case 'LIMITED':
        return 'bg-transparent hover:bg-[color:var(--color-warning)]';
      case 'NO':
        return 'bg-transparent hover:bg-[color:var(--color-error)]';
      default:
        return 'bg-[color:var(--color-border)] hover:bg-[color:var(--color-border)]';
    }
  };

  const getCoverageText = (coverage: string) => {
    switch (coverage) {
      case 'FULL':
        return 'F';
      case 'LIMITED':
        return 'L';
      case 'NO':
        return 'N';
      default:
        return '?';
    }
  };

  const handleCellClick = (plan: PlanCoverage, policyArea: string) => {
    const coverage = plan.policyCoverage[policyArea];
    if (coverage) {
      setSelectedCell({
        plan: plan.planName,
        policy: policyArea,
        coverage: coverage.coverage,
        details: coverage.details,
      });
    }
  };

  const getFilteredPlans = () => {
    if (filterCoverage === 'ALL') return plans;

    return plans.filter((plan) => {
      const hasCoverage = Object.values(plan.policyCoverage).some(
        (pc) => pc.coverage === filterCoverage
      );
      return hasCoverage;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-surface-alt)]">
        <p className="text-[color:var(--color-muted)]">Loading policy coverage matrix...</p>
      </div>
    );
  }

  const filteredPlans = getFilteredPlans();

  return (
    <>
      <SetPageTitle
        title="Henry Schein - Coverage Analysis"
        description="Policy coverage matrix across all compensation plans"
      />
      <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
        {/* Header */}
        <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm sticky top-0 z-10">
          <div className="max-w-full mx-auto px-6 py-4">
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
                  <p className="text-sm text-[color:var(--color-muted)]">
                    {filteredPlans.length} plans x {POLICY_AREAS.length} policy areas
                  </p>
                </div>
              </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-secondary)] transition-all flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-6">
        {/* Filters */}
        <div className="mb-6 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[color:var(--color-foreground)]">Filter by coverage:</span>
            <div className="flex gap-2">
              {(['ALL', 'FULL', 'LIMITED', 'NO'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterCoverage(filter)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    filterCoverage === filter
                      ? 'bg-[color:var(--color-primary)] text-white'
                      : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-border)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-transparent rounded"></div>
                <span className="text-[color:var(--color-muted)]">FULL (F)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-transparent rounded"></div>
                <span className="text-[color:var(--color-muted)]">LIMITED (L)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-transparent rounded"></div>
                <span className="text-[color:var(--color-muted)]">NO (N)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix */}
        <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[color:var(--color-surface-alt)] sticky top-[72px] z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider bg-[color:var(--color-surface-alt)] sticky left-0 z-20 min-w-[250px]">
                    Plan Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider bg-[color:var(--color-surface-alt)]">
                    Coverage %
                  </th>
                  {POLICY_AREAS.map((area) => (
                    <th
                      key={area}
                      className="px-2 py-3 text-center text-[10px] font-medium text-[color:var(--color-muted)] uppercase tracking-wider min-w-[50px]"
                      title={area}
                    >
                      <div className="transform -rotate-45 origin-center whitespace-nowrap">
                        {area.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[color:var(--color-surface)] divide-y divide-gray-200">
                {filteredPlans.map((plan, planIdx) => (
                  <tr
                    key={plan.planName}
                    className={planIdx % 2 === 0 ? 'bg-[color:var(--color-surface)]' : 'bg-[color:var(--color-surface-alt)]'}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)] sticky left-0 z-10">
                      {plan.planName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          plan.coverageStats.percentage >= 80
                            ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                            : plan.coverageStats.percentage >= 60
                            ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                            : 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                        }`}
                      >
                        {plan.coverageStats.percentage.toFixed(0)}%
                      </span>
                    </td>
                    {POLICY_AREAS.map((policyArea) => {
                      const coverage = plan.policyCoverage[policyArea];
                      const coverageValue = coverage?.coverage || 'NO';

                      return (
                        <td
                          key={policyArea}
                          className="px-2 py-3 text-center cursor-pointer"
                          onClick={() => handleCellClick(plan, policyArea)}
                        >
                          <div
                            className={`w-8 h-8 mx-auto rounded flex items-center justify-center text-white text-xs font-bold transition-all ${getCoverageColor(
                              coverageValue
                            )}`}
                            title={`${plan.planName} - ${policyArea}: ${coverageValue}`}
                          >
                            {getCoverageText(coverageValue)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        {selectedCell && (
          <div className="mt-6 bg-[color:var(--color-surface)] rounded-lg border-2 border-[color:var(--color-border)] shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[color:var(--color-foreground)]">{selectedCell.plan}</h3>
                <p className="text-sm text-[color:var(--color-muted)]">{selectedCell.policy}</p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-muted)] text-xl"
              >
                x
              </button>
            </div>
            <div className="mb-4">
              <span
                className={`px-3 py-1 text-sm font-bold rounded ${
                  selectedCell.coverage === 'FULL'
                    ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                    : selectedCell.coverage === 'LIMITED'
                    ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                    : 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                }`}
              >
                {selectedCell.coverage} COVERAGE
              </span>
            </div>
            <div className="bg-[color:var(--color-surface-alt)] rounded p-4">
              <p className="text-sm text-[color:var(--color-foreground)]">{selectedCell.details}</p>
            </div>
            {selectedCell.coverage !== 'FULL' && (
              <div className="mt-4 p-4 bg-[color:var(--color-surface-alt)] border border-[color:var(--color-info-border)] rounded">
                <p className="text-sm font-medium text-[color:var(--color-info)]">[DOC] Recommended Action:</p>
                <p className="text-sm text-[color:var(--color-info)] mt-2">
                  {selectedCell.coverage === 'NO'
                    ? `Add policy language for ${selectedCell.policy} to ${selectedCell.plan}. Check BHG DRAFT policies for templates.`
                    : `Enhance ${selectedCell.policy} policy in ${selectedCell.plan} to include detailed thresholds, workflows, and SLAs.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-[color:var(--color-success-bg)] border border-[color:var(--color-success-border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[color:var(--color-success)]">FULL Coverage Cells</p>
            <p className="text-3xl font-bold text-[color:var(--color-success)] mt-2">
              {plans.reduce(
                (sum, plan) =>
                  sum +
                  Object.values(plan.policyCoverage).filter((pc) => pc.coverage === 'FULL').length,
                0
              )}
            </p>
          </div>
          <div className="bg-[color:var(--color-warning-bg)] border border-[color:var(--color-warning-border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[color:var(--color-warning)]">LIMITED Coverage Cells</p>
            <p className="text-3xl font-bold text-[color:var(--color-warning)] mt-2">
              {plans.reduce(
                (sum, plan) =>
                  sum +
                  Object.values(plan.policyCoverage).filter((pc) => pc.coverage === 'LIMITED')
                    .length,
                0
              )}
            </p>
          </div>
          <div className="bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[color:var(--color-error)]">NO Coverage Cells</p>
            <p className="text-3xl font-bold text-[color:var(--color-error)] mt-2">
              {plans.reduce(
                (sum, plan) =>
                  sum +
                  Object.values(plan.policyCoverage).filter((pc) => pc.coverage === 'NO').length,
                0
              )}
            </p>
          </div>
          <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-info-border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[color:var(--color-info)]">Total Matrix Cells</p>
            <p className="text-3xl font-bold text-[color:var(--color-info)] mt-2">
              {plans.length * POLICY_AREAS.length}
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
