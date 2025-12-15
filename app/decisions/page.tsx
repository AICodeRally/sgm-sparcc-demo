'use client';

import React, { useState } from 'react';

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
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      deferred: 'bg-yellow-100 text-yellow-800',
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Decision Log</h1>
          <p className="text-gray-600 mt-1">Record of all major governance decisions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Situation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision Maker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {decisions.map(decision => (
                  <tr key={decision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(decision.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {decision.decisionType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {decision.situation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decision.decisionMaker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOutcomeColor(decision.outcome)}`}>
                        {decision.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Export to PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}
