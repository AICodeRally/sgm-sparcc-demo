'use client';

import React, { useState } from 'react';

interface ComplianceIssue {
  id: string;
  type: 'retention' | 'review' | 'legal' | 'approval' | 'expiration';
  severity: 'critical' | 'warning' | 'info';
  document: string;
  documentCode: string;
  issue: string;
  dueDate: string;
  action: string;
}

export default function CompliancePage() {
  const [issues] = useState<ComplianceIssue[]>([
    {
      id: 'comp-001',
      type: 'review',
      severity: 'critical',
      document: 'Sales Crediting Policy',
      documentCode: 'POL-001',
      issue: 'Document review overdue by 5 days',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Schedule review meeting',
    },
    {
      id: 'comp-002',
      type: 'approval',
      severity: 'warning',
      document: 'SPIF Governance Policy v2.0',
      documentCode: 'POL-004',
      issue: 'Pending approval for 3 days',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Submit for legal review',
    },
    {
      id: 'comp-003',
      type: 'legal',
      severity: 'warning',
      document: 'Clawback Recovery Policy',
      documentCode: 'POL-006',
      issue: 'Awaiting legal review for 10 days',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Follow up with General Counsel',
    },
    {
      id: 'comp-004',
      type: 'expiration',
      severity: 'info',
      document: 'Commission Reconciliation Procedures',
      documentCode: 'PROC-001',
      issue: 'Document expires in 30 days',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Plan renewal',
    },
    {
      id: 'comp-005',
      type: 'retention',
      severity: 'info',
      document: 'Dispute Resolution Procedures v1.0',
      documentCode: 'PROC-002',
      issue: 'Archival document approaching retention limit (2 years)',
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Review for permanent archival',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      retention: '📦',
      review: '👀',
      legal: '⚖️',
      approval: '✓',
      expiration: '⏰',
    };
    return icons[type] || '📋';
  };

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage governance compliance issues</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Total Issues</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{issues.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <p className="text-sm text-red-600 font-medium">Critical</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{criticalCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-yellow-200 p-6">
            <p className="text-sm text-yellow-600 font-medium">Warnings</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{warningCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-green-200 p-6">
            <p className="text-sm text-green-600 font-medium">Compliant</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{6 - issues.length}</p>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Compliance Issues</h2>

          {issues.length === 0 ? (
            <div className="bg-white rounded-lg border border-green-200 p-12 text-center">
              <p className="text-green-600 text-lg font-medium">✓ All compliant</p>
              <p className="text-gray-600 mt-2">No compliance issues detected</p>
            </div>
          ) : (
            issues.map(issue => (
              <div key={issue.id} className={`rounded-lg border p-6 ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-3xl">{getTypeIcon(issue.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{issue.document}</h3>
                      <p className="text-sm mt-1 opacity-90">{issue.issue}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-medium opacity-75">
                          Due: {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium opacity-75">{issue.documentCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-xs font-medium opacity-75 mb-2">Recommended Action:</p>
                    <button className="px-4 py-2 bg-white rounded hover:opacity-90 text-sm font-medium">
                      {issue.action}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compliance Report */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance Report</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Document Review Status</p>
                <p className="text-sm text-gray-600">Quarterly reviews required for all active documents</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">83%</p>
                <p className="text-xs text-gray-500">5 of 6 current</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Approval Compliance</p>
                <p className="text-sm text-gray-600">All documents must be formally approved before active</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-gray-500">6 of 6 compliant</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Legal Review Status</p>
                <p className="text-sm text-gray-600">Policy documents require legal review</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">67%</p>
                <p className="text-xs text-gray-500">4 of 6 reviewed</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Regulatory Compliance</p>
                <p className="text-sm text-gray-600">CA Labor Code, Section 409A, SOX compliance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-gray-500">All policies compliant</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Email Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
