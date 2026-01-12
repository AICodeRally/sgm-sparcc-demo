'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  CalendarIcon,
  DotFilledIcon,
  BarChartIcon,
  LayersIcon,
  DoubleArrowUpIcon,
  ArrowUpIcon,
  DashIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { CASE_ITEMS, CASE_STATS, CASE_TYPE_INFO, CaseItem } from '@/lib/data/synthetic/cases.data';
import { DemoBadge, DemoHighlight } from '@/components/demo/DemoBadge';
import { DemoToggle, DemoFilter, DemoWarningBanner } from '@/components/demo/DemoToggle';
import { ModeContextBadge } from '@/components/modes/ModeBadge';

export default function CasesPage() {
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoFilter, setDemoFilter] = useState<DemoFilter>('all');

  // Filter cases
  const filteredCases = CASE_ITEMS.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Demo filter
    if (demoFilter === 'demo-only' && !c.isDemo) return false;
    if (demoFilter === 'real-only' && c.isDemo) return false;
    return true;
  });

  // Calculate demo counts
  const demoCounts = {
    total: CASE_ITEMS.length,
    demo: CASE_ITEMS.filter(c => c.isDemo).length,
    real: CASE_ITEMS.filter(c => !c.isDemo).length,
  };

  // Sort by most recent first
  const sortedCases = [...filteredCases].sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Get status icon
  const getStatusIcon = (status: CaseItem['status']) => {
    switch (status) {
      case 'NEW':
        return DotFilledIcon;
      case 'UNDER_REVIEW':
        return ClockIcon;
      case 'PENDING_INFO':
        return ExclamationTriangleIcon;
      case 'ESCALATED':
        return DoubleArrowUpIcon;
      case 'RESOLVED':
        return CheckCircledIcon;
      case 'CLOSED':
        return CrossCircledIcon;
      default:
        return DotFilledIcon;
    }
  };

  // Get status color
  const getStatusColor = (status: CaseItem['status']) => {
    switch (status) {
      case 'NEW':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]';
      case 'UNDER_REVIEW':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]';
      case 'PENDING_INFO':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]';
      case 'ESCALATED':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]';
      case 'RESOLVED':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]';
      case 'CLOSED':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: CaseItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return DoubleArrowUpIcon;
      case 'HIGH':
        return ArrowUpIcon;
      case 'MEDIUM':
        return DashIcon;
      case 'LOW':
        return DashIcon;
      default:
        return DashIcon;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: CaseItem['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'text-[color:var(--color-error)]';
      case 'HIGH':
        return 'text-[color:var(--color-warning)]';
      case 'MEDIUM':
        return 'text-[color:var(--color-warning)]';
      case 'LOW':
        return 'text-[color:var(--color-muted)]';
      default:
        return 'text-[color:var(--color-muted)]';
    }
  };

  // Get case type icon
  const getCaseTypeIcon = (type: CaseItem['type']) => {
    switch (type) {
      case 'EXCEPTION':
        return ExclamationTriangleIcon;
      case 'DISPUTE':
        return BarChartIcon;
      case 'TERRITORY_CHANGE':
        return LayersIcon;
      case 'QUOTA_ADJUSTMENT':
        return BarChartIcon;
      case 'PLAN_MODIFICATION':
        return FileTextIcon;
      default:
        return FileTextIcon;
    }
  };

  // Format case type name
  const formatCaseType = (type: CaseItem['type']) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Left Navigation - Stats and Filters
  const leftNav = (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Quick Stats
        </h2>
        <div className="space-y-2">
          <div className="bg-[color:var(--color-accent-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-accent)] font-medium">Active</span>
              <span className="text-lg font-bold text-[color:var(--color-accent)]">
                {CASE_STATS.new + CASE_STATS.underReview + CASE_STATS.pendingInfo + CASE_STATS.escalated}
              </span>
            </div>
          </div>
          <div className="bg-[color:var(--color-success-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-success)] font-medium">Resolved</span>
              <span className="text-lg font-bold text-[color:var(--color-success)]">{CASE_STATS.resolved}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-muted)] font-medium">Closed</span>
              <span className="text-lg font-bold text-[color:var(--color-muted)]">{CASE_STATS.closed}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-primary)] font-medium">Avg Days</span>
              <span className="text-lg font-bold text-[color:var(--color-primary)]">{CASE_STATS.avgResolutionDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Status
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'all'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Cases
          </button>
          <button
            onClick={() => setFilterStatus('NEW')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'NEW'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <DotFilledIcon className="w-4 h-4" />
            New ({CASE_STATS.new})
          </button>
          <button
            onClick={() => setFilterStatus('UNDER_REVIEW')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'UNDER_REVIEW'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Under Review ({CASE_STATS.underReview})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_INFO')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'PENDING_INFO'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Pending Info ({CASE_STATS.pendingInfo})
          </button>
          <button
            onClick={() => setFilterStatus('ESCALATED')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'ESCALATED'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <DoubleArrowUpIcon className="w-4 h-4" />
            Escalated ({CASE_STATS.escalated})
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterStatus === 'RESOLVED'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <CheckCircledIcon className="w-4 h-4" />
            Resolved ({CASE_STATS.resolved})
          </button>
        </div>
      </div>

      {/* Case Type Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Case Type
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterType('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterType === 'all'
                ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Types
          </button>
          {Object.entries(CASE_TYPE_INFO).map(([key, info]) => {
            const Icon = getCaseTypeIcon(key as CaseItem['type']);
            const count = CASE_ITEMS.filter(c => c.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  filterType === key
                    ? 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] font-medium'
                    : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {info.name} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Center Content - Case List
  const centerContent = (
    <div className="h-full flex flex-col">
      {/* Demo Warning Banner */}
      {demoCounts.demo > 0 && (
        <div className="px-4 pt-4">
          <DemoWarningBanner
            demoCount={demoCounts.demo}
            onViewDemoLibrary={() => window.location.href = '/demo-library'}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ModeContextBadge size="sm" />
            <DemoToggle
              value={demoFilter}
              onChange={setDemoFilter}
              counts={demoCounts}
              mode="compact"
            />
          </div>
          <button className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" />
            New Case
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search cases by title or case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Case List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {sortedCases.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-12 h-12 text-[color:var(--color-muted)] mx-auto mb-3" />
              <p className="text-[color:var(--color-muted)]">No cases found</p>
            </div>
          ) : (
            sortedCases.map((caseItem) => {
              const StatusIcon = getStatusIcon(caseItem.status);
              const PriorityIcon = getPriorityIcon(caseItem.priority);
              const TypeIcon = getCaseTypeIcon(caseItem.type);

              return (
                <DemoHighlight key={caseItem.id} isDemo={caseItem.isDemo}>
                  <button
                    onClick={() => setSelectedCase(caseItem)}
                    className={`w-full text-left bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-md border transition-all hover:shadow-md ${
                      selectedCase?.id === caseItem.id
                        ? 'border-[color:var(--color-accent-border)] shadow-sm'
                        : 'border-[color:var(--color-border)]'
                    }`}
                  >
                    <div className="p-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TypeIcon className="w-5 h-5 text-[color:var(--color-accent)] flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[color:var(--color-foreground)] text-sm truncate">
                                {caseItem.title}
                              </h3>
                              <DemoBadge isDemo={caseItem.isDemo} demoMetadata={caseItem.demoMetadata} size="sm" />
                            </div>
                          <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                            {caseItem.caseNumber}
                          </p>
                        </div>
                      </div>
                      <PriorityIcon className={`w-4 h-4 flex-shrink-0 ml-2 ${getPriorityColor(caseItem.priority)}`} />
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                        {React.createElement(StatusIcon, { className: 'w-3 h-3' })}
                        {caseItem.status.replace(/_/g, ' ')}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] rounded text-xs">
                        {formatCaseType(caseItem.type)}
                      </span>
                      {caseItem.committee && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded text-xs font-medium">
                          {caseItem.committee}
                        </span>
                      )}
                      {caseItem.financialImpact && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)] rounded text-xs font-medium">
                          ${(caseItem.financialImpact / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-[color:var(--color-muted)]">
                      <div className="flex items-center gap-1">
                        <PersonIcon className="w-3 h-3" />
                        {caseItem.affectedRep || caseItem.submittedBy.split(' (')[0]}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {caseItem.businessDaysElapsed} days
                      </div>
                    </div>
                  </div>
                </button>
                </DemoHighlight>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // Right Detail Pane - Case Details
  const rightDetail = selectedCase ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-[color:var(--color-border)] p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {React.createElement(getCaseTypeIcon(selectedCase.type), {
              className: 'w-5 h-5 text-[color:var(--color-accent)] flex-shrink-0'
            })}
            <div>
              <h2 className="font-semibold text-[color:var(--color-foreground)] text-sm">
                {selectedCase.caseNumber}
              </h2>
              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                {formatCaseType(selectedCase.type)}
              </p>
            </div>
          </div>
          {React.createElement(getPriorityIcon(selectedCase.priority), {
            className: `w-5 h-5 ${getPriorityColor(selectedCase.priority)}`
          })}
        </div>

        <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2">
          {selectedCase.title}
        </h3>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
            {React.createElement(getStatusIcon(selectedCase.status), { className: 'w-3 h-3' })}
            {selectedCase.status.replace(/_/g, ' ')}
          </span>
          {selectedCase.committee && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded text-xs font-medium">
              {selectedCase.committee}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
            Description
          </h4>
          <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed">
            {selectedCase.description}
          </p>
        </div>

        {/* Key Information */}
        <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3 space-y-2">
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Submitted By</span>
            <span className="text-[color:var(--color-foreground)] font-medium text-right">
              {selectedCase.submittedBy}
            </span>
          </div>
          {selectedCase.affectedRep && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-[color:var(--color-muted)]">Affected Rep</span>
              <span className="text-[color:var(--color-foreground)] font-medium">
                {selectedCase.affectedRep}
              </span>
            </div>
          )}
          {selectedCase.assignedTo && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-[color:var(--color-muted)]">Assigned To</span>
              <span className="text-[color:var(--color-foreground)] font-medium text-right">
                {selectedCase.assignedTo}
              </span>
            </div>
          )}
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Submitted</span>
            <span className="text-[color:var(--color-foreground)] font-medium">
              {formatDate(selectedCase.submittedAt)}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Due Date</span>
            <span className="text-[color:var(--color-foreground)] font-medium">
              {formatDate(selectedCase.resolutionDueDate)}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Days Elapsed</span>
            <span className="text-[color:var(--color-foreground)] font-medium">
              {selectedCase.businessDaysElapsed} business days
            </span>
          </div>
          {selectedCase.financialImpact !== undefined && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-[color:var(--color-muted)]">Financial Impact</span>
              <span className="text-[color:var(--color-foreground)] font-medium">
                ${selectedCase.financialImpact.toLocaleString()}
              </span>
            </div>
          )}
          {selectedCase.relatedDealId && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-[color:var(--color-muted)]">Related Deal</span>
              <span className="text-[color:var(--color-info)] font-medium hover:underline cursor-pointer">
                {selectedCase.relatedDealId}
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
            Timeline
          </h4>
          <div className="space-y-3">
            {selectedCase.timeline.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-none">
                  <div className="w-2 h-2 bg-[color:var(--color-accent-bg)]0 rounded-full mt-1.5"></div>
                  {index < selectedCase.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-[color:var(--color-border)] ml-0.75 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                      {event.action}
                    </p>
                    <span className="text-xs text-[color:var(--color-muted)]">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-[color:var(--color-muted)] mb-1">{event.actor}</p>
                  {event.notes && (
                    <p className="text-xs text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)] rounded p-2 mt-2">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution (if exists) */}
        {selectedCase.resolution && (
          <div className="bg-[color:var(--color-success-bg)] border border-[color:var(--color-success-border)] rounded-md p-3">
            <h4 className="text-xs font-semibold text-[color:var(--color-success)] uppercase tracking-wider mb-2">
              Resolution
            </h4>
            <div className="space-y-2">
              <div className="flex items-start justify-between text-xs">
                <span className="text-[color:var(--color-success)] font-medium">Decision</span>
                <span className="text-[color:var(--color-success)] font-semibold">
                  {selectedCase.resolution.decision}
                </span>
              </div>
              <div className="flex items-start justify-between text-xs">
                <span className="text-[color:var(--color-success)]">Decided By</span>
                <span className="text-[color:var(--color-success)]">
                  {selectedCase.resolution.decidedBy}
                </span>
              </div>
              <div className="flex items-start justify-between text-xs">
                <span className="text-[color:var(--color-success)]">Date</span>
                <span className="text-[color:var(--color-success)]">
                  {formatDate(selectedCase.resolution.decidedAt)}
                </span>
              </div>
              <div className="text-xs text-[color:var(--color-success)] mt-3 leading-relaxed">
                <p className="font-medium mb-1">Rationale:</p>
                <p>{selectedCase.resolution.rationale}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attachments */}
        {selectedCase.attachments && selectedCase.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Attachments ({selectedCase.attachments.length})
            </h4>
            <div className="space-y-2">
              {selectedCase.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-[color:var(--color-surface-alt)] rounded hover:bg-[color:var(--color-surface-alt)] cursor-pointer transition-colors"
                >
                  <FileTextIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[color:var(--color-foreground)] truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      {attachment.type} • {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions (for active cases) */}
      {selectedCase.status !== 'RESOLVED' && selectedCase.status !== 'CLOSED' && (
        <div className="flex-none p-4 border-t border-[color:var(--color-border)] space-y-2">
          <button className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors">
            Update Case
          </button>
          <button className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors">
            Request Information
          </button>
          {selectedCase.status === 'UNDER_REVIEW' && (
            <button className="w-full px-4 py-2 bg-[color:var(--color-error)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-error)] transition-colors">
              Escalate to {selectedCase.committee || 'Committee'}
            </button>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Cases Management"
        description="Exceptions, disputes, territory changes, and special requests with resolution tracking"
      />
      <ThreePaneWorkspace
        leftNav={leftNav}
        centerContent={centerContent}
        rightDetail={rightDetail}
        showRightPane={!!selectedCase}
      />
    </>
  );
}
