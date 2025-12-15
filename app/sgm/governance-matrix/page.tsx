'use client';

import React, { useState } from 'react';

export default function GovernanceMatrixPage() {
  const [activeTab, setActiveTab] = useState<'coverage' | 'authority' | 'compliance'>('coverage');

  // Policy Coverage Matrix
  const compPlanTypes = ['New Logo', 'Named Account', 'Upmarket', 'Overlay', 'Territory'];
  const policies = [
    { code: 'POL-001', name: 'Sales Crediting Policy' },
    { code: 'POL-002', name: 'Quota & Territory Policy' },
    { code: 'POL-003', name: 'Payment Timing Policy' },
    { code: 'POL-004', name: 'SPIF Governance Policy' },
    { code: 'POL-005', name: 'Windfall & Large Deal Policy' },
    { code: 'POL-006', name: 'Clawback Recovery Policy' },
  ];

  const coverage: Record<string, string[]> = {
    'New Logo': ['POL-001', 'POL-002', 'POL-003', 'POL-004'],
    'Named Account': ['POL-001', 'POL-002', 'POL-003'],
    'Upmarket': ['POL-001', 'POL-002', 'POL-003', 'POL-005'],
    'Overlay': ['POL-001', 'POL-004'],
    'Territory': ['POL-002', 'POL-003'],
  };

  // Authority Matrix
  const decisionTypes = ['SPIF <$50K', 'SPIF $50K-$250K', 'SPIF >$250K', 'Exception <$5K', 'Exception >$25K', 'Windfall >$1M'];
  const authorities: Record<string, string> = {
    'SPIF <$50K': 'SGCC',
    'SPIF $50K-$250K': 'SGCC + CFO',
    'SPIF >$250K': 'SGCC + CEO',
    'Exception <$5K': 'Manager',
    'Exception >$25K': 'CRB',
    'Windfall >$1M': 'CRB',
  };

  // Compliance Matrix
  const complianceReqs = [
    { code: 'CA_LABOR', name: 'California Labor Code' },
    { code: 'SECTION_409A', name: 'Section 409A' },
    { code: 'SOX', name: 'Sarbanes-Oxley' },
    { code: 'GDPR', name: 'GDPR' },
  ];

  const compliance: Record<string, Record<string, 'compliant' | 'review' | 'gap'>> = {
    'POL-001': { CA_LABOR: 'compliant', SECTION_409A: 'compliant', SOX: 'compliant', GDPR: 'review' },
    'POL-002': { CA_LABOR: 'compliant', SECTION_409A: 'compliant', SOX: 'compliant', GDPR: 'compliant' },
    'POL-003': { CA_LABOR: 'compliant', SECTION_409A: 'review', SOX: 'compliant', GDPR: 'compliant' },
    'POL-004': { CA_LABOR: 'compliant', SECTION_409A: 'compliant', SOX: 'review', GDPR: 'gap' },
    'POL-005': { CA_LABOR: 'compliant', SECTION_409A: 'compliant', SOX: 'compliant', GDPR: 'review' },
    'POL-006': { CA_LABOR: 'compliant', SECTION_409A: 'compliant', SOX: 'compliant', GDPR: 'compliant' },
  };

  const getCoverageColor = (policyCode: string, compPlanType: string) => {
    return coverage[compPlanType]?.includes(policyCode)
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getCoverageText = (policyCode: string, compPlanType: string) => {
    return coverage[compPlanType]?.includes(policyCode) ? '✓ Covered' : '✗ Gap';
  };

  const getComplianceColor = (status: string) => {
    if (status === 'compliant') return 'bg-green-100 text-green-800';
    if (status === 'review') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Governance Matrix</h1>
          <p className="text-gray-600 mt-1">Policy coverage, approval authorities, and compliance mapping</p>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('coverage')}
              className={`px-4 py-3 font-medium border-b-2 -mb-px ${
                activeTab === 'coverage'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Coverage Matrix
            </button>
            <button
              onClick={() => setActiveTab('authority')}
              className={`px-4 py-3 font-medium border-b-2 -mb-px ${
                activeTab === 'authority'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Authority Matrix
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-4 py-3 font-medium border-b-2 -mb-px ${
                activeTab === 'compliance'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Compliance Matrix
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Coverage Matrix */}
        {activeTab === 'coverage' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                    {compPlanTypes.map(type => (
                      <th key={type} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {policies.map(policy => (
                    <tr key={policy.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div>
                          <p className="font-semibold">{policy.name}</p>
                          <p className="text-xs text-gray-500">{policy.code}</p>
                        </div>
                      </td>
                      {compPlanTypes.map(type => (
                        <td key={`${policy.code}-${type}`} className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCoverageColor(policy.code, type)}`}>
                            {getCoverageText(policy.code, type)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Authority Matrix */}
        {activeTab === 'authority' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authority Required</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {decisionTypes.map(type => (
                    <tr key={type} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{type}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {authorities[type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {type.includes('SPIF')
                          ? type.includes('$50K')
                            ? '5-10 days'
                            : '15 days'
                          : '10-15 days'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compliance Matrix */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                    {complianceReqs.map(req => (
                      <th key={req.code} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {req.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {policies.map(policy => (
                    <tr key={policy.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div>
                          <p className="font-semibold">{policy.name}</p>
                          <p className="text-xs text-gray-500">{policy.code}</p>
                        </div>
                      </td>
                      {complianceReqs.map(req => (
                        <td key={`${policy.code}-${req.code}`} className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(
                              compliance[policy.code]?.[req.code] || 'gap'
                            )}`}
                          >
                            {compliance[policy.code]?.[req.code]?.charAt(0).toUpperCase() +
                              compliance[policy.code]?.[req.code]?.slice(1) || 'Gap'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
