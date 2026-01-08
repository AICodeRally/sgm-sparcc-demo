'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  FileTextIcon,
  TableIcon,
  ClipboardIcon,
  PlusIcon,
  UpdateIcon,
  MagnifyingGlassIcon,
  Link2Icon,
  ArrowRightIcon,
  ClockIcon,
  BarChartIcon,
  CalendarIcon,
  BellIcon,
  DownloadIcon,
  ReaderIcon,
  BookmarkIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ArchiveIcon,
  AvatarIcon,
} from '@radix-ui/react-icons';
import RotatingMetricTile from '@/components/dashboard/RotatingMetricTile';
import { METRIC_GROUPS } from '@/lib/data/metric-registry';

interface HenryScheinData {
  totalPlans: number;
  averageCoverage: number;
  criticalGaps: number;
  riskExposure: number;
  riskMitigation: number;
}

export default function SGMDashboard() {
  const router = useRouter();
  const [henryScheinData, setHenryScheinData] = useState<HenryScheinData | null>(null);
  const [metricData, setMetricData] = useState<Record<string, number | string>>({});

  useEffect(() => {
    // Fetch Henry Schein data dynamically
    fetch('/api/henryschein/gap-analysis')
      .then((res) => res.json())
      .then((data) => setHenryScheinData(data))
      .catch((err) => console.error('Failed to load Henry Schein data:', err));

    // Fetch live metrics
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch documents
      const docsRes = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
      const docsData = await docsRes.json();
      const documents = docsData.documents || [];

      // Fetch policies
      const policiesRes = await fetch('/api/sgm/policies?tenantId=demo-tenant-001');
      const policiesData = await policiesRes.json();
      const policies = policiesData.policies || [];

      // Calculate all metrics
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const metrics: Record<string, number | string> = {
        // Document metrics
        totalDocuments: documents.length,
        pendingReview: documents.filter((d: any) => d.status === 'UNDER_REVIEW').length,
        expiringSoon: documents.filter((d: any) => {
          if (!d.expirationDate) return false;
          const expDate = new Date(d.expirationDate);
          return expDate > now && expDate < thirtyDaysFromNow;
        }).length,
        recentUpdates: documents.filter((d: any) => {
          const updated = new Date(d.lastUpdated);
          return updated > sevenDaysAgo;
        }).length,
        needsLegalReview: documents.filter((d: any) => d.legalReviewStatus === 'PENDING').length,

        // Approval metrics
        pendingApprovals: 3, // From synthetic data
        overdueApprovals: 1, // Critical - overdue items
        slaCompliance: 94, // 94% on-time
        avgApprovalTime: 2.3, // 2.3 days average
        completedThisMonth: 12,

        // Case metrics
        activeCases: 4,
        highPriorityCases: 1, // Critical
        approachingSLA: 2, // Warning - approaching deadline
        avgResolution: 3.5, // 3.5 days
        exceptionRequests: 2,

        // Policy metrics
        activePolicies: policies.filter((p: any) => p.status === 'ACTIVE').length,
        needsReview: policies.filter((p: any) => {
          if (!p.nextReview) return false;
          return new Date(p.nextReview) < now;
        }).length,
        complianceScore: 96, // 96% compliance
        updatedThisQuarter: 5,
        auditFindings: 0, // No open findings

        // Governance metrics
        committees: 2,
        upcomingMeetings: 3,
        decisionsThisMonth: 8,
        activeMembers: 12,
        activityScore: 87, // 87% engagement
      };

      setMetricData(metrics);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(2)}M`;
  };

  return (
    <>
      <SetPageTitle
        title="Sales Governance Management"
        description="Enterprise-grade platform for managing compensation governance, approvals, and compliance"
      />
      <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Henry Schein Beta Client Banner */}
        {henryScheinData && (
          <Link href="/henryschein">
            <div className="mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-4 border-blue-400 group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-white text-blue-600 text-sm font-bold rounded-full">
                      BETA CLIENT
                    </span>
                    <span className="text-white text-sm font-medium">
                      Gap Analysis Ready
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    Henry Schein, Inc.
                  </h2>
                  <p className="text-blue-100 text-lg">
                    {henryScheinData.totalPlans} Plans Analyzed | {henryScheinData.averageCoverage}% Avg Coverage | {henryScheinData.criticalGaps} Gaps Identified | {formatCurrency(henryScheinData.riskExposure)} Risk Exposure
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-white font-medium group-hover:gap-4 transition-all">
                    <span className="text-lg">View Gap Analysis Dashboard</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-blue-100 text-sm mb-2">3-Year ROI</p>
                    <p className="text-5xl font-bold text-white">1,867%</p>
                    <p className="text-blue-100 text-xs mt-2">{formatCurrency(henryScheinData.riskMitigation)} benefit</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-5 gap-6 mb-6">
          {METRIC_GROUPS.map((group) => (
            <RotatingMetricTile key={group.id} group={group} metricData={metricData} />
          ))}
        </div>

        {/* Main Navigation */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Documents */}
          <Link href="/documents">
            <div className="bg-white rounded-xl border border-purple-200 p-8 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <FileTextIcon className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
              <p className="text-gray-600 mt-2">
                {metricData.totalDocuments || 0} governance documents with versioning, effective dating, and lifecycle management
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                Browse Library <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Approvals */}
          <Link href="/approvals">
            <div className="bg-white rounded-xl border border-purple-200 p-8 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
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

          {/* Committees */}
          <Link href="/committees">
            <div className="bg-white rounded-xl border border-purple-200 p-8 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
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

          {/* Cases */}
          <Link href="/cases">
            <div className="bg-white rounded-xl border border-purple-200 p-8 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
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

          {/* Case SLA & Load */}
          <Link href="/cases/sla">
            <div className="bg-white rounded-xl border border-purple-200 p-8 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <ClockIcon className="w-10 h-10 text-orange-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Case SLA & Load</h2>
              <p className="text-gray-600 mt-2">
                SLA tracking, compliance monitoring, and workload optimization
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                View SLA Dashboard <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Case Analytics */}
          <Link href="/cases/analytics">
            <div className="bg-white rounded-xl border border-purple-200 p-8 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <BarChartIcon className="w-10 h-10 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Case Analytics</h2>
              <p className="text-gray-600 mt-2">
                AI predictions, trends, bottleneck detection, and capacity planning
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                View Analytics <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Governance Matrix */}
          <Link href="/governance-matrix">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <TableIcon className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Governance Matrix</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Policy coverage, approval authorities, and compliance mapping
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/analytics">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <BarChartIcon className="w-8 h-8 text-purple-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Governance health metrics, trends, and KPIs
              </p>
            </div>
          </Link>

          {/* Audit Timeline */}
          <Link href="/audit">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <ClockIcon className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Audit Timeline</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Comprehensive event history and compliance tracking
              </p>
            </div>
          </Link>
        </div>

        {/* Compensation Planning - NEW FEATURED SECTION */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Compensation Planning
            </h2>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 text-xs font-bold rounded-full border-2 border-purple-300">
              NEW FEATURES
            </span>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {/* Plan Templates */}
            <div
              className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer h-full group"
              onClick={() => router.push('/templates')}
            >
              <FileTextIcon className="w-10 h-10 text-purple-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900">Plan Templates</h2>
              <p className="text-gray-700 mt-2 text-sm font-medium">
                56 sections • Build custom templates
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/templates/builder"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlusIcon className="w-3 h-3" />
                  Build Template
                </Link>
                <span className="inline-flex items-center px-2 py-1 bg-white text-purple-700 text-xs font-semibold rounded border border-purple-300">
                  3 Templates
                </span>
              </div>
            </div>

            {/* Create Plan */}
            <Link href="/plans/new">
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer h-full group">
                <PlusIcon className="w-10 h-10 text-fuchsia-600 mb-3" />
                <h2 className="text-xl font-bold text-gray-900">Create Plan</h2>
                <p className="text-gray-700 mt-2 text-sm font-medium">
                  4-step wizard • From templates
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1.5 bg-fuchsia-600 text-white text-xs font-semibold rounded">
                    Start Wizard →
                  </span>
                </div>
              </div>
            </Link>

            {/* Gap Analysis */}
            <Link href="/henryschein/plans">
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer h-full group">
                <span className="text-4xl mb-3 block">📊</span>
                <h2 className="text-xl font-bold text-gray-900">Gap Analysis</h2>
                <p className="text-gray-700 mt-2 text-sm font-medium">
                  Policy coverage • Risk scoring
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2 py-1 bg-white text-yellow-700 text-xs font-semibold rounded border border-yellow-300">
                    27 Plans Analyzed
                  </span>
                </div>
              </div>
            </Link>

            {/* Plan Review */}
            <Link href="/plans/document/HS-MED-FSC-2025">
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer h-full group">
                <span className="text-4xl mb-3 block">🔧</span>
                <h2 className="text-xl font-bold text-gray-900">Plan Review</h2>
                <p className="text-gray-700 mt-2 text-sm font-medium">
                  Governance analysis • Draft language
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2 py-1 bg-white text-red-700 text-xs font-semibold rounded border border-red-300">
                    6 Missing Policies
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Governance & Utilities */}
        <div className="grid grid-cols-6 gap-6 mb-6">

          {/* Governance Framework */}
          <Link href="/framework">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <BookmarkIcon className="w-8 h-8 text-teal-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Framework</h2>
              <p className="text-gray-600 mt-2 text-sm">
                25 policies in 6 pillars
              </p>
            </div>
          </Link>

          {/* Document Links */}
          <Link href="/links">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <Link2Icon className="w-8 h-8 text-purple-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Links</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Document relationships
              </p>
            </div>
          </Link>

          {/* Document Library */}
          <Link href="/documents/library">
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer h-full group">
              <ArchiveIcon className="w-8 h-8 text-purple-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Document Library</h2>
              <p className="text-gray-700 mt-2 text-sm font-medium">
                Full provenance • Version history
              </p>
            </div>
          </Link>

          {/* Policy Library */}
          <Link href="/policies">
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border-2 border-purple-300 p-6 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer h-full group">
              <ReaderIcon className="w-8 h-8 text-purple-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Policy Library</h2>
              <p className="text-gray-700 mt-2 text-sm font-medium">
                26 policies • Governance templates
              </p>
            </div>
          </Link>

          {/* Calendar */}
          <Link href="/calendar">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <CalendarIcon className="w-8 h-8 text-blue-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Calendar</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Event timeline
              </p>
            </div>
          </Link>

          {/* Notifications */}
          <Link href="/notifications">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <BellIcon className="w-8 h-8 text-orange-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Action items
              </p>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/reports">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <DownloadIcon className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Reports</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Export & analytics
              </p>
            </div>
          </Link>

          {/* Version Compare */}
          <Link href="/compare">
            <div className="bg-white rounded-xl border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full group">
              <ReaderIcon className="w-8 h-8 text-pink-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Compare</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Version history
              </p>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-xl border border-purple-200 p-12">
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
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">
            <strong>Demo Mode:</strong> Running with synthetic SPARCC governance data (48 documents, 2 committees, 7 framework docs, 17 policies, 10 procedures) for demonstration.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
