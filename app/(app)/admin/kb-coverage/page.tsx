'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface PageInfo {
  route: string;
  pagePath: string;
  kbPath: string;
  hasKb: boolean;
  kbLastUpdated?: string;
}

interface CoverageReport {
  total: number;
  covered: number;
  missing: number;
  coveragePercent: number;
  pages: PageInfo[];
  timestamp: string;
}

export default function KBCoveragePage() {
  const [report, setReport] = useState<CoverageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'covered'>('all');

  const fetchCoverage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/kb-coverage');
      if (!response.ok) throw new Error('Failed to fetch coverage');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverage();
  }, []);

  const filteredPages = report?.pages.filter(page => {
    if (filter === 'missing') return !page.hasKb;
    if (filter === 'covered') return page.hasKb;
    return true;
  }) || [];

  const getCoverageColor = (percent: number) => {
    if (percent >= 100) return 'text-[color:var(--color-success)]';
    if (percent >= 80) return 'text-[color:var(--color-warning)]';
    return 'text-[color:var(--color-error)]';
  };

  return (
    <>
      <SetPageTitle
        title="KB Coverage"
        description="Monitor knowledge base documentation coverage"
      />
      <div className="h-screen flex flex-col sparcc-hero-bg">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                Knowledge Base Coverage
              </h2>
              <p className="text-sm text-[color:var(--color-muted)]">
                Ensure every page has documentation
              </p>
            </div>
            <button
              onClick={fetchCoverage}
              disabled={loading}
              className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ReloadIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {report && (
          <div className="px-8 py-4 bg-[color:var(--color-surface)]">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">Total Pages</p>
                <p className="text-3xl font-bold text-[color:var(--color-foreground)]">{report.total}</p>
              </div>
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">With KB Docs</p>
                <p className="text-3xl font-bold text-[color:var(--color-success)]">{report.covered}</p>
              </div>
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">Missing Docs</p>
                <p className={`text-3xl font-bold ${report.missing > 0 ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-success)]'}`}>
                  {report.missing}
                </p>
              </div>
              <div className="bg-[color:var(--surface-glass)] rounded-lg border border-[color:var(--color-border)] p-4">
                <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wide">Coverage</p>
                <p className={`text-3xl font-bold ${getCoverageColor(report.coveragePercent)}`}>
                  {report.coveragePercent}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-8 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
          <div className="flex gap-2">
            {(['all', 'missing', 'covered'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-[color:var(--color-primary)] text-white'
                    : 'bg-[color:var(--color-surface)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                {f === 'all' ? 'All Pages' : f === 'missing' ? 'Missing KB' : 'Has KB'}
                {report && (
                  <span className="ml-2 opacity-75">
                    ({f === 'all' ? report.total : f === 'missing' ? report.missing : report.covered})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading && !report ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ReloadIcon className="h-8 w-8 animate-spin text-[color:var(--color-muted)]" />
              <p className="mt-4 text-[color:var(--color-muted)]">Loading coverage report...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ExclamationTriangleIcon className="h-12 w-12 text-[color:var(--color-error)]" />
              <p className="mt-4 text-[color:var(--color-error)]">{error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <div
                  key={page.route}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    page.hasKb
                      ? 'bg-[color:var(--color-surface)] border-[color:var(--color-border)]'
                      : 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {page.hasKb ? (
                      <CheckCircledIcon className="h-5 w-5 text-[color:var(--color-success)]" />
                    ) : (
                      <CrossCircledIcon className="h-5 w-5 text-[color:var(--color-error)]" />
                    )}
                    <div>
                      {page.route.includes('[') ? (
                        <span className="font-medium text-[color:var(--color-foreground)]">
                          {page.route}
                        </span>
                      ) : (
                        <Link
                          href={page.route}
                          className="font-medium text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] hover:underline"
                        >
                          {page.route}
                        </Link>
                      )}
                      <p className="text-xs text-[color:var(--color-muted)]">
                        {page.pagePath}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {page.hasKb && page.kbLastUpdated && (
                      <span className="text-xs text-[color:var(--color-muted)]">
                        Updated: {page.kbLastUpdated}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs">
                      <FileTextIcon className="h-3 w-3" />
                      <span className={page.hasKb ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'}>
                        {page.hasKb ? 'KB Doc' : 'No KB'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {report && (
          <div className="px-8 py-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
            <p className="text-xs text-[color:var(--color-muted)]">
              Last checked: {new Date(report.timestamp).toLocaleString()} •
              Run <code className="bg-[color:var(--color-surface)] px-1 rounded">node scripts/check-kb-coverage.js --fix</code> to auto-generate missing docs
            </p>
          </div>
        )}
      </div>
    </>
  );
}
