'use client';

import React, { useState } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';

interface DecisionLog {
  id: string;
  decisionType: string;
  date: string;
  decisionMaker: string;
  situation: string;
  outcome: 'approved' | 'rejected' | 'deferred';
  amount?: number;
  impact?: string;
  relatedDocuments: string[];
}

export default function DecisionsPage() {
  const [decisions] = useState<DecisionLog[]>([
    {
      id: 'dec-001',
      decisionType: 'SPIF Approval',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      decisionMaker: 'SGCC',
      situation: 'Request for Q4 territory expansion SPIF',
      outcome: 'approved',
      amount: 45000,
      impact: 'Drive Q4 revenue growth in new markets',
      relatedDocuments: ['POL-004', 'PROC-001'],
    },
    {
      id: 'dec-002',
      decisionType: 'Windfall Deal',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      decisionMaker: 'CRB',
      situation: '$1.2M ARR deal for Enterprise customer',
      outcome: 'approved',
      amount: 1200000,
      impact: 'Approved special commission structure',
      relatedDocuments: ['POL-005'],
    },
    {
      id: 'dec-003',
      decisionType: 'Exception Request',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      decisionMaker: 'Regional Manager',
      situation: 'Request for quota exception due to territory rebalancing',
      outcome: 'approved',
      amount: 15000,
      impact: 'Adjustment to Q3 commission calculations',
      relatedDocuments: ['PROC-002'],
    },
    {
      id: 'dec-004',
      decisionType: 'Policy Change',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      decisionMaker: 'SGCC + Legal',
      situation: 'Sales Crediting Policy v2.0 adoption',
      outcome: 'approved',
      impact: 'Effective for new plan year',
      relatedDocuments: ['POL-001', 'FWK-001'],
    },
  ]);

  const getOutcomeColor = (outcome: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
      rejected: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]',
      deferred: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
    };
    return colors[outcome] || 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
  };

  return (
    <>
      <SetPageTitle
        title="Decision Log"
        description="Track governance decisions and committee resolutions"
      />
      <div className="h-screen sparcc-hero-bg flex flex-col">

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[color:var(--color-surface-alt)] border-b border-[color:var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Decision Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Situation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Decision Maker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {decisions.map(decision => (
                  <tr key={decision.id} className="hover:bg-[color:var(--color-surface-alt)]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-foreground)]">
                      {new Date(decision.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[color:var(--color-foreground)]">
                      {decision.decisionType}
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--color-muted)] max-w-xs truncate">
                      {decision.situation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-foreground)]">
                      {decision.decisionMaker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOutcomeColor(decision.outcome)}`}>
                        {decision.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-foreground)]">
                      {decision.amount ? `$${(decision.amount / 1000).toFixed(0)}K` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm font-medium">
            Export to PDF
          </button>
          <button className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm font-medium">
            Export to Excel
          </button>
        </div>
        </div>
      </div>
      </div>
    </>
  );
}
