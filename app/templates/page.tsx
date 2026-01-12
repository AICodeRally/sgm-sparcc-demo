'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileTextIcon,
  PlusIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  CopyIcon,
  EyeOpenIcon,
  Pencil2Icon,
  CheckCircledIcon,
  ClockIcon,
  ArchiveIcon
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import type { PlanTemplate } from '@/lib/contracts/plan-template.contract';

type TemplateStatus = 'ACTIVE' | 'DRAFT' | 'DEPRECATED' | 'ARCHIVED';
type PlanType = 'COMPENSATION_PLAN' | 'GOVERNANCE_PLAN' | 'POLICY_CREATION_PLAN';

interface TemplateFilters {
  search: string;
  planType: PlanType | 'ALL';
  status: TemplateStatus | 'ALL';
  source: 'ALL' | 'SYSTEM' | 'USER_CREATED';
}

const statusIcons: Record<TemplateStatus, typeof CheckCircledIcon> = {
  ACTIVE: CheckCircledIcon,
  DRAFT: ClockIcon,
  DEPRECATED: ArchiveIcon,
  ARCHIVED: ArchiveIcon,
};

const statusColors: Record<TemplateStatus, string> = {
  ACTIVE: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
  DRAFT: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
  DEPRECATED: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]',
  ARCHIVED: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)]',
};

const planTypeLabels: Record<PlanType, string> = {
  COMPENSATION_PLAN: 'Compensation Plan',
  GOVERNANCE_PLAN: 'Governance Plan',
  POLICY_CREATION_PLAN: 'Policy Plan',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    planType: 'ALL',
    status: 'ALL',
    source: 'ALL',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [filters]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.planType !== 'ALL') params.append('planType', filters.planType);
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.source !== 'ALL') params.append('source', filters.source);

      const response = await fetch(`/api/plan-templates?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      let filtered = data.templates || [];

      // Client-side search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter((t: PlanTemplate) =>
          t.name.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.code.toLowerCase().includes(search)
        );
      }

      setTemplates(filtered);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (templateId: string) => {
    try {
      const response = await fetch(`/api/plan-templates/${templateId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Copy of Template',
          createdBy: 'current-user', // TODO: Get from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to clone template');

      fetchTemplates(); // Refresh list
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const filteredTemplates = templates;
  const systemTemplates = filteredTemplates.filter(t => t.isSystemTemplate);
  const userTemplates = filteredTemplates.filter(t => !t.isSystemTemplate);

  return (
    <>
      <SetPageTitle
        title="Plan Templates"
        description="Reusable plan templates for governance and policy creation"
      />
      <div className="h-screen flex flex-col sparcc-hero-bg">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-6">
          <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)] text-[color:var(--color-primary)]'
                  : 'bg-[color:var(--color-surface)] border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              <MixerHorizontalIcon className="h-5 w-5" />
              Filters
            </button>
            <Link
              href="/templates/builder"
              className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              Build Template
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-2xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search templates by name, code, or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Plan Type
                </label>
                <select
                  value={filters.planType}
                  onChange={(e) => setFilters({ ...filters, planType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  <option value="ALL">All Types</option>
                  <option value="COMPENSATION_PLAN">Compensation Plans</option>
                  <option value="GOVERNANCE_PLAN">Governance Plans</option>
                  <option value="POLICY_CREATION_PLAN">Policy Plans</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DEPRECATED">Deprecated</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Source
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  <option value="ALL">All Sources</option>
                  <option value="SYSTEM">System Templates</option>
                  <option value="USER_CREATED">User Created</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[color:var(--color-muted)]">Loading templates...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* System Templates */}
            {systemTemplates.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
                  System Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {systemTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClone={handleClone}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* User Templates */}
            {userTemplates.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
                  Custom Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClone={handleClone}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileTextIcon className="h-16 w-16 text-[color:var(--color-muted)] mb-4" />
                <h3 className="text-lg font-medium text-[color:var(--color-foreground)] mb-2">
                  No templates found
                </h3>
                <p className="text-[color:var(--color-muted)] mb-4">
                  {filters.search || filters.planType !== 'ALL' || filters.status !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Create your first template to get started'}
                </p>
                {!filters.search && filters.planType === 'ALL' && filters.status === 'ALL' && (
                  <Link
                    href="/templates/new"
                    className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Create Template
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

function TemplateCard({
  template,
  onClone
}: {
  template: PlanTemplate;
  onClone: (id: string) => void;
}) {
  const StatusIcon = statusIcons[template.status as TemplateStatus];

  return (
    <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                {template.name}
              </h3>
              {template.isSystemTemplate && (
                <span className="px-2 py-0.5 bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)] text-xs font-medium rounded">
                  System
                </span>
              )}
            </div>
            <p className="text-sm text-[color:var(--color-muted)]">{template.code}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status as TemplateStatus]}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {template.status}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[color:var(--color-muted)] mb-4 line-clamp-2">
          {template.description || 'No description provided'}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)] mb-4">
          <div>
            <span className="font-medium">Type:</span>{' '}
            {planTypeLabels[template.planType as PlanType]}
          </div>
          <div>
            <span className="font-medium">Uses:</span> {template.usageCount || 0}
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] text-xs rounded">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-[color:var(--color-border)]">
          <Link
            href={`/templates/${template.id}`}
            className="flex-1 px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <EyeOpenIcon className="h-4 w-4" />
            View
          </Link>
          <Link
            href={`/templates/${template.id}`}
            className="flex-1 px-3 py-2 border border-[color:var(--color-border)] text-[color:var(--color-primary)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Pencil2Icon className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => onClone(template.id)}
            className="px-3 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors flex items-center justify-center"
            title="Clone Template"
          >
            <CopyIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
