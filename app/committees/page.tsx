'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface DecisionThreshold {
  decisionType: string;
  amountMin?: number;
  amountMax?: number;
  authority: string;
  timelineDays: number;
}

interface Committee {
  id: string;
  name: string;
  acronym: string;
  type: string;
  description?: string;
  chair: CommitteeMember;
  viceChair?: CommitteeMember;
  members: CommitteeMember[];
  decisionThresholds: DecisionThreshold[];
  approvalAuthority: string[];
  meetingCadence: string;
  quorumRequirement: number;
  lastMeetingAt: string;
  nextMeetingAt: string;
  totalDecisions: number;
  totalMeetings: number;
}

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        // Get committee data from the registry diagnostics
        const response = await fetch('/api/sgm/diagnostics');
        const data = await response.json();

        // For now, use sample data since we don't have a dedicated committees API yet
        const sampleCommittees: Committee[] = [
          {
            id: 'comm-001',
            name: 'Sales Compensation Governance Committee',
            acronym: 'SGCC',
            type: 'PRIMARY',
            description: 'Primary committee for sales compensation governance',
            chair: {
              id: 'user-001',
              name: 'Jane Smith',
              email: 'jane.smith@company.com',
              role: 'VP Sales Compensation',
              joinedAt: '2024-01-01',
            },
            viceChair: {
              id: 'user-002',
              name: 'Bob Johnson',
              email: 'bob.johnson@company.com',
              role: 'CFO',
              joinedAt: '2024-01-01',
            },
            members: [
              { id: 'user-003', name: 'Sarah Williams', email: 'sarah.williams@company.com', role: 'CHRO', joinedAt: '2024-01-01' },
              { id: 'user-004', name: 'Michael Chen', email: 'michael.chen@company.com', role: 'General Counsel', joinedAt: '2024-01-01' },
              { id: 'user-005', name: 'David Rodriguez', email: 'david.rodriguez@company.com', role: 'Chief Sales Officer', joinedAt: '2024-01-01' },
              { id: 'user-006', name: 'Lisa Garcia', email: 'lisa.garcia@company.com', role: 'VP Sales Operations', joinedAt: '2024-01-01' },
              { id: 'user-007', name: 'Tom Anderson', email: 'tom.anderson@company.com', role: 'Regional Sales Lead (AMER)', joinedAt: '2024-06-01' },
            ],
            decisionThresholds: [
              { decisionType: 'SPIF_APPROVAL', amountMin: 0, amountMax: 50000, authority: 'SGCC', timelineDays: 5 },
              { decisionType: 'SPIF_APPROVAL', amountMin: 50000, amountMax: 250000, authority: 'SGCC+CFO', timelineDays: 10 },
              { decisionType: 'SPIF_APPROVAL', amountMin: 250000, authority: 'SGCC+CEO', timelineDays: 15 },
            ],
            approvalAuthority: ['POLICY_APPROVAL', 'SPIF_APPROVAL', 'EXCEPTION_APPROVAL', 'WINDFALL_REVIEW'],
            meetingCadence: 'Monthly',
            quorumRequirement: 5,
            lastMeetingAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextMeetingAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            totalDecisions: 45,
            totalMeetings: 12,
          },
          {
            id: 'comm-002',
            name: 'Compensation Review Board',
            acronym: 'CRB',
            type: 'REVIEW_BOARD',
            description: 'Board for reviewing large deals, SPIFs, and exceptions',
            chair: {
              id: 'user-001',
              name: 'Jane Smith',
              email: 'jane.smith@company.com',
              role: 'VP Sales Compensation',
              joinedAt: '2024-01-01',
            },
            members: [
              { id: 'user-008', name: 'Jennifer Lee', email: 'jennifer.lee@company.com', role: 'Director of Finance', joinedAt: '2024-01-01' },
              { id: 'user-006', name: 'Lisa Garcia', email: 'lisa.garcia@company.com', role: 'Manager, Sales Operations', joinedAt: '2024-01-01' },
            ],
            decisionThresholds: [
              { decisionType: 'WINDFALL_REVIEW', amountMin: 1000000, authority: 'CRB', timelineDays: 20 },
              { decisionType: 'SPIF_APPROVAL', amountMin: 50000, amountMax: 250000, authority: 'CRB', timelineDays: 15 },
              { decisionType: 'EXCEPTION_REQUEST', amountMin: 25000, authority: 'CRB', timelineDays: 15 },
            ],
            approvalAuthority: ['WINDFALL_REVIEW', 'LARGE_SPIF_APPROVAL', 'LARGE_EXCEPTION_APPROVAL', 'CLAWBACK_APPROVAL'],
            meetingCadence: 'Monthly',
            quorumRequirement: 2,
            lastMeetingAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            nextMeetingAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            totalDecisions: 23,
            totalMeetings: 12,
          },
        ];

        setCommittees(sampleCommittees);
        if (sampleCommittees.length > 0) {
          setSelectedCommittee(sampleCommittees[0]);
        }
      } catch (error) {
        console.error('Failed to fetch committees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading committees...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Governance Committees</h1>
          <p className="text-gray-600 mt-1">Manage committees and their members</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-6">
          {/* Committee List */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Committees ({committees.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {committees.map(committee => (
                  <button
                    key={committee.id}
                    onClick={() => setSelectedCommittee(committee)}
                    className={`w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors ${
                      selectedCommittee?.id === committee.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <p className="font-medium text-gray-900">{committee.acronym}</p>
                    <p className="text-xs text-gray-600 mt-1">{committee.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{committee.members.length + 2} members</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Committee Details */}
          <div className="col-span-2 space-y-6">
            {selectedCommittee ? (
              <>
                {/* Committee Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCommittee.acronym}</h2>
                      <p className="text-gray-600 mt-1">{selectedCommittee.name}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {selectedCommittee.type}
                    </span>
                  </div>

                  {selectedCommittee.description && (
                    <p className="text-gray-600 mb-6">{selectedCommittee.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Meeting Cadence</label>
                      <p className="mt-1 text-gray-900">{selectedCommittee.meetingCadence}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Quorum</label>
                      <p className="mt-1 text-gray-900">{selectedCommittee.quorumRequirement} of {selectedCommittee.members.length + (selectedCommittee.viceChair ? 2 : 1)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Last Meeting</label>
                      <p className="mt-1 text-gray-900">{new Date(selectedCommittee.lastMeetingAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Next Meeting</label>
                      <p className="mt-1 text-gray-900">{new Date(selectedCommittee.nextMeetingAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {/* Chair */}
                    <div className="px-8 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{selectedCommittee.chair.name}</p>
                          <p className="text-sm text-gray-600">{selectedCommittee.chair.role}</p>
                          <p className="text-xs text-gray-500">{selectedCommittee.chair.email}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Chair</span>
                      </div>
                    </div>

                    {/* Vice Chair */}
                    {selectedCommittee.viceChair && (
                      <div className="px-8 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{selectedCommittee.viceChair.name}</p>
                            <p className="text-sm text-gray-600">{selectedCommittee.viceChair.role}</p>
                            <p className="text-xs text-gray-500">{selectedCommittee.viceChair.email}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Vice Chair</span>
                        </div>
                      </div>
                    )}

                    {/* Other Members */}
                    {selectedCommittee.members.map(member => (
                      <div key={member.id} className="px-8 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision Thresholds */}
                {selectedCommittee.decisionThresholds.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Decision Authorities</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision Type</th>
                            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Range</th>
                            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authority</th>
                            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedCommittee.decisionThresholds.map((threshold, index) => (
                            <tr key={index}>
                              <td className="px-8 py-4 text-sm text-gray-900">{threshold.decisionType}</td>
                              <td className="px-8 py-4 text-sm text-gray-600">
                                {threshold.amountMin ? `$${(threshold.amountMin / 1000).toFixed(0)}K` : 'Any'} - {threshold.amountMax ? `$${(threshold.amountMax / 1000).toFixed(0)}K` : 'Unlimited'}
                              </td>
                              <td className="px-8 py-4 text-sm text-gray-900">{threshold.authority}</td>
                              <td className="px-8 py-4 text-sm text-gray-600">{threshold.timelineDays} days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Select a committee to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
