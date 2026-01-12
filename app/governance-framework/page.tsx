'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReaderIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import type { GovernanceFramework } from '@/lib/contracts/governance-framework.contract';

export default function GovernanceFrameworkPage() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<GovernanceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchFrameworks();
  }, [categoryFilter, statusFilter]);

  const fetchFrameworks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tenantId: 'demo-tenant-001',
      });

      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/governance-framework?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch frameworks');

      const data = await response.json();
      setFrameworks(data.frameworks || []);
    } catch (error) {
      console.error('Error fetching frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFrameworks = frameworks.filter((framework) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      framework.title.toLowerCase().includes(query) ||
      framework.code.toLowerCase().includes(query) ||
      framework.content.toLowerCase().includes(query)
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return <ReaderIcon className="h-5 w-5" />;
      case 'STANDARDS':
        return <CheckCircledIcon className="h-5 w-5" />;
      case 'COMPLIANCE':
        return <LockClosedIcon className="h-5 w-5" />;
      case 'REGULATORY':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <FileTextIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'METHODOLOGY':
        return 'text-[color:var(--color-info)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-info-border)]';
      case 'STANDARDS':
        return 'text-[color:var(--color-success)] bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)]';
      case 'COMPLIANCE':
        return 'text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)]';
      case 'REGULATORY':
        return 'text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)]';
      case 'BEST_PRACTICES':
        return 'text-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
      default:
        return 'text-[color:var(--color-muted)] bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]';
    }
  };

  return (
    <div className="h-screen flex flex-col sparcc-hero-bg">
      {/* Header */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent mb-2">
            Governance Framework Library
          </h1>
          <p className="text-[color:var(--color-muted)]">
            SPM governance guardrails for compensation planning and policy creation
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="METHODOLOGY">Methodology</option>
              <option value="STANDARDS">Standards</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="BEST_PRACTICES">Best Practices</option>
              <option value="REGULATORY">Regulatory</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="SUPERSEDED">Superseded</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Framework Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[color:var(--color-muted)]">Loading frameworks...</div>
            </div>
          ) : filteredFrameworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[color:var(--color-muted)]">
              <FileTextIcon className="h-16 w-16 mb-4 text-[color:var(--color-muted)]" />
              <p>No governance frameworks found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFrameworks.map((framework) => (
                <div
                  key={framework.id}
                  onClick={() => router.push(`/governance-framework/${framework.id}`)}
                  className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border-2 border-[color:var(--color-border)] p-6 hover:border-[color:var(--color-primary)] hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg border-2 ${getCategoryColor(framework.category)}`}>
                      {getCategoryIcon(framework.category)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {framework.isMandatory && (
                        <span className="px-2 py-1 text-xs font-semibold bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] rounded border border-[color:var(--color-error-border)]">
                          MANDATORY
                        </span>
                      )}
                      {framework.isGlobal && (
                        <span className="px-2 py-1 text-xs font-semibold bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] rounded border border-[color:var(--color-info-border)]">
                          GLOBAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="text-sm font-mono text-[color:var(--color-primary)] mb-2">
                    {framework.code}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2 line-clamp-2">
                    {framework.title}
                  </h3>

                  {/* Category */}
                  <div className="text-sm text-[color:var(--color-muted)] mb-3">
                    {framework.category.replace('_', ' ')}
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-[color:var(--color-muted)] line-clamp-3 mb-4">
                    {framework.content.substring(0, 150)}...
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[color:var(--color-border)]">
                    <span className="text-xs text-[color:var(--color-muted)]">
                      Version {framework.version}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      framework.status === 'ACTIVE'
                        ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]'
                        : framework.status === 'DRAFT'
                        ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                        : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                    }`}>
                      {framework.status}
                    </span>
                  </div>

                  {/* Applicable To */}
                  {framework.applicableTo && framework.applicableTo.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[color:var(--color-border)]">
                      <div className="text-xs text-[color:var(--color-muted)] mb-1">Applicable to:</div>
                      <div className="flex flex-wrap gap-1">
                        {framework.applicableTo.map((planType: string) => (
                          <span
                            key={planType}
                            className="text-xs px-2 py-0.5 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded"
                          >
                            {planType.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
