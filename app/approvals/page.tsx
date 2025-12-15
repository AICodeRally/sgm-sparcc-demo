'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApprovalRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  documentCode: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  currentStep: number;
  totalSteps: number;
  slaDueAt: string;
  slaBreached: boolean;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    // Fetch approvals - for now use mock data
    const mockApprovals: ApprovalRequest[] = [
      {
        id: 'appreq-001',
        documentId: 'doc-1',
        documentTitle: 'Sales Crediting Policy v2.0',
        documentCode: 'POL-001',
        requestedBy: 'Jane Smith',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        currentStep: 1,
        totalSteps: 3,
        slaDueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        slaBreached: false,
      },
      {
        id: 'appreq-002',
        documentId: 'doc-2',
        documentTitle: 'SPIF Governance Policy',
        documentCode: 'POL-004',
        requestedBy: 'Bob Johnson',
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        currentStep: 2,
        totalSteps: 3,
        slaDueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        slaBreached: false,
      },
      {
        id: 'appreq-003',
        documentId: 'doc-3',
        documentTitle: 'Clawback Recovery Policy',
        documentCode: 'POL-006',
        requestedBy: 'Sarah Williams',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        currentStep: 1,
        totalSteps: 2,
        slaDueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        slaBreached: true,
      },
    ];

    setApprovals(mockApprovals);
    setLoading(false);
  }, []);

  const getSLAStatus = (slaBreached: boolean, slaDueAt: string) => {
    if (slaBreached) {
      return { color: 'text-red-600', label: 'OVERDUE', bg: 'bg-red-50' };
    }
    const hoursLeft = (new Date(slaDueAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft < 24) {
      return { color: 'text-orange-600', label: 'DUE SOON', bg: 'bg-orange-50' };
    }
    return { color: 'text-green-600', label: 'ON TRACK', bg: 'bg-green-50' };
  };

  const filtered = filter === 'pending' ? approvals.filter(a => a.status === 'pending') : approvals;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading approvals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
          <p className="text-gray-600 mt-1">Documents awaiting your approval</p>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({approvals.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({approvals.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No approvals in queue</p>
            <p className="text-gray-400 text-sm mt-2">All documents are approved or archived</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(approval => {
              const slaStatus = getSLAStatus(approval.slaBreached, approval.slaDueAt);
              return (
                <Link key={approval.id} href={`/sgm/approvals/${approval.id}`}>
                  <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer ${slaStatus.bg}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{approval.documentTitle}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {approval.documentCode}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Requested by {approval.requestedBy} on{' '}
                          {new Date(approval.requestedAt).toLocaleDateString()}
                        </p>

                        {/* Workflow Progress */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 max-w-xs">
                            <div className="flex items-center gap-2">
                              {Array.from({ length: approval.totalSteps }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 flex-1 rounded ${
                                    i < approval.currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            Step {approval.currentStep} of {approval.totalSteps}
                          </span>
                        </div>

                        {/* SLA and Status */}
                        <div className="flex gap-4">
                          <div>
                            <span className={`text-sm font-medium ${slaStatus.color}`}>
                              {slaStatus.label}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(approval.slaDueAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              {approval.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
                        Review →
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
