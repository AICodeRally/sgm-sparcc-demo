'use client';

import Link from 'next/link';
import {
  FileTextIcon,
  CheckCircledIcon,
  AvatarIcon,
  TableIcon,
  ClipboardIcon,
  PlusIcon,
  ArchiveIcon,
  UpdateIcon,
  MagnifyingGlassIcon,
  Link2Icon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BarChartIcon,
  CalendarIcon,
  BellIcon,
  DownloadIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';

export default function SGMDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Hero Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
              Sales Governance Manager
            </h1>
            <p className="text-xl text-gray-700 mt-4">
              Enterprise-grade platform for managing compensation governance, approvals, and compliance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-5 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Documents</p>
              <FileTextIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-2">48</p>
            <p className="text-xs text-gray-500 mt-1">Governance documents</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Pending Approvals</p>
              <CheckCircledIcon className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Active Cases</p>
              <ExclamationTriangleIcon className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-3xl font-bold text-pink-600 mt-2">4</p>
            <p className="text-xs text-gray-500 mt-1">Disputes & exceptions</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Active Policies</p>
              <ArchiveIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600 mt-2">17</p>
            <p className="text-xs text-gray-500 mt-1">Effective now</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Committees</p>
              <AvatarIcon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600 mt-2">2</p>
            <p className="text-xs text-gray-500 mt-1">SGCC, CRB</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {/* Documents */}
          <Link href="/documents">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <FileTextIcon className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
              <p className="text-gray-600 mt-2">
                48 governance documents with versioning, effective dating, and lifecycle management
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                Browse Library <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Approvals */}
          <Link href="/approvals">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <CheckCircledIcon className="w-10 h-10 text-orange-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Approvals</h2>
              <p className="text-gray-600 mt-2">
                SGCC and CRB workflows with approval thresholds and SLA tracking
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                View Queue <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Cases */}
          <Link href="/cases">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <ExclamationTriangleIcon className="w-10 h-10 text-pink-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Cases</h2>
              <p className="text-gray-600 mt-2">
                Exceptions, disputes, territory changes, and special requests with resolution tracking
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                View Cases <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Committees */}
          <Link href="/committees">
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <AvatarIcon className="w-10 h-10 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Committees</h2>
              <p className="text-gray-600 mt-2">
                SGCC (7 members) and CRB for windfall deals and exception management
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                View Committees <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* Governance Matrix */}
          <Link href="/governance-matrix">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <TableIcon className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Governance Matrix</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Policy coverage, approval authorities, and compliance mapping
              </p>
            </div>
          </Link>

          {/* Case SLA Management */}
          <Link href="/cases/sla">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <ClockIcon className="w-8 h-8 text-orange-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Case SLA & Load</h2>
              <p className="text-gray-600 mt-2 text-sm">
                SLA tracking, compliance monitoring, and workload optimization
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/analytics">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <BarChartIcon className="w-8 h-8 text-purple-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Governance health metrics, trends, and KPIs
              </p>
            </div>
          </Link>

          {/* Audit Timeline */}
          <Link href="/audit">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <ClockIcon className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Audit Timeline</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Comprehensive event history and compliance tracking
              </p>
            </div>
          </Link>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-6 gap-6 mb-12">
          {/* Document Links */}
          <Link href="/links">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <Link2Icon className="w-8 h-8 text-purple-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Links</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Document relationships
              </p>
            </div>
          </Link>

          {/* Calendar */}
          <Link href="/calendar">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <CalendarIcon className="w-8 h-8 text-blue-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Calendar</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Event timeline
              </p>
            </div>
          </Link>

          {/* Notifications */}
          <Link href="/notifications">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <BellIcon className="w-8 h-8 text-orange-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Action items
              </p>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/reports">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <DownloadIcon className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Reports</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Export & analytics
              </p>
            </div>
          </Link>

          {/* Version Compare */}
          <Link href="/compare">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <ReaderIcon className="w-8 h-8 text-pink-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Compare</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Version history
              </p>
            </div>
          </Link>

          {/* Case Analytics */}
          <Link href="/cases/analytics">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer h-full group">
              <BarChartIcon className="w-8 h-8 text-indigo-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Case Analytics</h2>
              <p className="text-gray-600 mt-2 text-sm">
                AI predictions & trends
              </p>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Enterprise Features</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex gap-4 mb-6">
                <ArchiveIcon className="w-6 h-6 text-blue-600 flex-none mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Document Taxonomy</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Framework, Policy, Procedure, Template, Checklist, Guide - SPARCC governance structure
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <UpdateIcon className="w-6 h-6 text-blue-600 flex-none mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Approval Workflows</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    SGCC + CRB with tiered thresholds, SLA tracking, and escalation paths
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <TableIcon className="w-6 h-6 text-blue-600 flex-none mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Governance Matrix</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Policy coverage matrix with drill-through to document versions
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-4 mb-6">
                <AvatarIcon className="w-6 h-6 text-blue-600 flex-none mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">CRB Windfall Review</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    6 decision options for deals &gt;$1M: Full Pay, Cap, Amortization, Split, Bonus, Deny
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <MagnifyingGlassIcon className="w-6 h-6 text-blue-600 flex-none mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Full-Text Search</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Search across all document content, metadata, and audit events
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <Link2Icon className="w-6 h-6 text-blue-600 flex-none mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">Document Links</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Graph relationships: REFERENCES, IMPLEMENTS, GOVERNED_BY, EVIDENCE_FOR
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data Notice */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Demo Mode:</strong> Running with synthetic SPARCC governance data (48 documents, 2 committees, 7 framework docs, 17 policies, 10 procedures) for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
