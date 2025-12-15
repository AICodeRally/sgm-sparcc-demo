'use client';

import Link from 'next/link';

export default function SGMDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900">Sales Governance Manager</h1>
            <p className="text-xl text-gray-600 mt-4">
              Centralized platform for managing compensation governance documents, approvals, and compliance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Documents</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">10+</p>
            <p className="text-xs text-gray-500 mt-1">All governance documents</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Pending Approvals</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Active Policies</p>
            <p className="text-3xl font-bold text-green-600 mt-2">6</p>
            <p className="text-xs text-gray-500 mt-1">Effective now</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Committees</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">2</p>
            <p className="text-xs text-gray-500 mt-1">SGCC, CRB</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {/* Documents */}
          <Link href="/documents">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full">
              <div className="text-4xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
              <p className="text-gray-600 mt-2">Manage governance documents with versioning and lifecycle tracking</p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                Browse Documents <span>→</span>
              </div>
            </div>
          </Link>

          {/* Approvals */}
          <Link href="/approvals">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-gray-900">Approvals</h2>
              <p className="text-gray-600 mt-2">Review and approve pending documents with multi-level workflow routing</p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                View Queue <span>→</span>
              </div>
            </div>
          </Link>

          {/* Committees */}
          <Link href="/committees">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900">Committees</h2>
              <p className="text-gray-600 mt-2">Manage governance committees, members, and decision authorities</p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                View Committees <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {/* Governance Matrix */}
          <Link href="/governance-matrix">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-bold text-gray-900">Governance Matrix</h2>
              <p className="text-gray-600 mt-2 text-sm">Policy coverage, approval authorities, and compliance mapping</p>
            </div>
          </Link>

          {/* Decisions */}
          <Link href="/decisions">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-gray-900">Decision Log</h2>
              <p className="text-gray-600 mt-2 text-sm">Record of all major governance decisions and outcomes</p>
            </div>
          </Link>

          {/* New Document */}
          <Link href="/documents/new">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
              <div className="text-4xl mb-4">➕</div>
              <h2 className="text-xl font-bold text-gray-900">Create Document</h2>
              <p className="text-gray-600 mt-2 text-sm">Add a new governance document to the system</p>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex gap-4 mb-4">
                <span className="text-2xl">📁</span>
                <div>
                  <h3 className="font-bold text-gray-900">Document Management</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage .md, .docx, .pdf, and other formats with versioning</p>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <span className="text-2xl">🔄</span>
                <div>
                  <h3 className="font-bold text-gray-900">Approval Workflows</h3>
                  <p className="text-sm text-gray-600 mt-1">Multi-step routing with SLA tracking and escalation</p>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-bold text-gray-900">Governance Matrix</h3>
                  <p className="text-sm text-gray-600 mt-1">Policy coverage, authority levels, and compliance mapping</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 mb-4">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-bold text-gray-900">Committee Management</h3>
                  <p className="text-sm text-gray-600 mt-1">SGCC, CRB, and other decision-making bodies</p>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="font-bold text-gray-900">Search & Discovery</h3>
                  <p className="text-sm text-gray-600 mt-1">Full-text search across all documents and metadata</p>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-bold text-gray-900">Integrations</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect to SFDC, Xactly, Workday, and other systems</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data Notice */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Demo Data:</strong> This system includes 10 JAMF governance documents (policies, procedures, frameworks) and 2 governance committees (SGCC and CRB) for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
