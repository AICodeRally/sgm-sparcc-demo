'use client';

import React, { useState } from 'react';

interface PolicyCoverage {
  policyArea: string;
  policyName: string;
  coverage: 'FULL' | 'LIMITED' | 'NO';
  notes?: string;
}

interface Plan {
  planCode: string;
  planName: string;
  policies: PolicyCoverage[];
}

interface CoverageMatrixProps {
  plans: Plan[];
  policyAreas: string[];
}

/**
 * Coverage Matrix Component
 * Interactive matrix showing policy coverage across plans
 */
export function CoverageMatrix({ plans, policyAreas }: CoverageMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{ planCode: string; policyArea: string } | null>(null);

  const handleExport = () => {
    window.print();
  };

  // Get coverage for a specific plan and policy area
  const getCoverage = (planCode: string, policyArea: string): PolicyCoverage | undefined => {
    const plan = plans.find((p) => p.planCode === planCode);
    return plan?.policies.find((policy) => policy.policyArea === policyArea);
  };

  // Get color for coverage level
  const getCoverageColor = (coverage?: 'FULL' | 'LIMITED' | 'NO') => {
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

  // Get coverage label
  const getCoverageLabel = (coverage?: 'FULL' | 'LIMITED' | 'NO') => {
    switch (coverage) {
      case 'FULL':
        return 'Full';
      case 'LIMITED':
        return 'Limited';
      case 'NO':
        return 'None';
      default:
        return 'N/A';
    }
  };

  const selectedCoverage = selectedCell
    ? getCoverage(selectedCell.planCode, selectedCell.policyArea)
    : null;

  // Calculate coverage stats
  const coverageStats = {
    full: plans.reduce((acc, plan) => acc + plan.policies.filter(p => p.coverage === 'FULL').length, 0),
    limited: plans.reduce((acc, plan) => acc + plan.policies.filter(p => p.coverage === 'LIMITED').length, 0),
    no: plans.reduce((acc, plan) => acc + plan.policies.filter(p => p.coverage === 'NO').length, 0),
  };

  return (
    <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-accent-border)] p-6 print:border-0 print:p-0">
      {/* Print Header - only visible when printing */}
      <div className="hidden print:block print-header mb-6 text-center">
        <h1 className="text-2xl font-bold">Policy Coverage Matrix</h1>
        <p className="text-sm text-gray-600">
          Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex justify-center gap-8 mt-4 text-sm">
          <span className="text-green-600 font-medium">Full: {coverageStats.full}</span>
          <span className="text-amber-600 font-medium">Limited: {coverageStats.limited}</span>
          <span className="text-red-600 font-medium">None: {coverageStats.no}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-2">Policy Coverage Matrix</h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              Click any cell to view coverage details
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors no-print"
          >
            Export to PDF
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-transparent rounded" />
            <span className="text-[color:var(--color-muted)]">Full Coverage</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-transparent rounded" />
            <span className="text-[color:var(--color-muted)]">Limited Coverage</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-transparent rounded" />
            <span className="text-[color:var(--color-muted)]">No Coverage</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[color:var(--color-border)] rounded" />
            <span className="text-[color:var(--color-muted)]">Not Applicable</span>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[color:var(--color-accent-bg)] text-left p-3 text-xs font-semibold text-[color:var(--color-foreground)] uppercase tracking-wide border-b-2 border-[color:var(--color-accent-border)]">
                Policy Area
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.planCode}
                  className="bg-[color:var(--color-accent-bg)] p-3 text-xs font-semibold text-[color:var(--color-foreground)] border-b-2 border-[color:var(--color-accent-border)] min-w-[100px]"
                >
                  <div className="text-center">
                    <div className="font-bold">{plan.planCode}</div>
                    <div className="text-[color:var(--color-muted)] font-normal truncate max-w-[100px]">
                      {plan.planName}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policyAreas.map((policyArea, rowIndex) => (
              <tr key={policyArea} className={rowIndex % 2 === 0 ? 'bg-[color:var(--color-surface-alt)]' : 'bg-[color:var(--color-surface)]'}>
                <td className="sticky left-0 z-10 bg-inherit p-3 text-sm font-medium text-[color:var(--color-foreground)] border-r-2 border-[color:var(--color-border)]">
                  {policyArea}
                </td>
                {plans.map((plan) => {
                  const coverage = getCoverage(plan.planCode, policyArea);
                  const isSelected =
                    selectedCell?.planCode === plan.planCode &&
                    selectedCell?.policyArea === policyArea;

                  return (
                    <td key={`${plan.planCode}-${policyArea}`} className="p-1">
                      <button
                        onClick={() =>
                          setSelectedCell({ planCode: plan.planCode, policyArea })
                        }
                        className={`w-full h-12 rounded transition-all cursor-pointer ${getCoverageColor(
                          coverage?.coverage
                        )} ${isSelected ? 'ring-4 ring-[color:var(--color-accent)]' : ''}`}
                        title={`${plan.planCode} - ${policyArea}: ${getCoverageLabel(coverage?.coverage)}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && selectedCoverage && (
        <div className="mt-6 p-4 bg-[color:var(--color-accent-bg)] border-2 border-[color:var(--color-accent-border)] rounded-lg">
          <h3 className="font-bold text-[color:var(--color-foreground)] mb-2">
            {selectedCell.planCode} - {selectedCell.policyArea}
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <strong>Policy:</strong> {selectedCoverage.policyName}
            </p>
            <p>
              <strong>Coverage Level:</strong>{' '}
              <span
                className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                  selectedCoverage.coverage === 'FULL'
                    ? 'bg-[color:var(--color-success)]'
                    : selectedCoverage.coverage === 'LIMITED'
                    ? 'bg-[color:var(--color-warning)]'
                    : 'bg-[color:var(--color-error)]'
                }`}
              >
                {getCoverageLabel(selectedCoverage.coverage)}
              </span>
            </p>
            {selectedCoverage.notes && (
              <p className="text-[color:var(--color-foreground)]">
                <strong>Notes:</strong> {selectedCoverage.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
