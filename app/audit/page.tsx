'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  PersonIcon,
  FileTextIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  LayersIcon,
  BarChartIcon,
  AvatarIcon,
  LockClosedIcon,
  CalendarIcon,
  DotFilledIcon,
  DoubleArrowUpIcon,
  ArrowUpIcon,
  DashIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { AUDIT_EVENTS, AUDIT_STATS, EVENT_TYPE_INFO, AuditEvent } from '@/lib/data/synthetic/audit.data';

export default function AuditPage() {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter events
  const filteredEvents = AUDIT_EVENTS.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterImpact !== 'all' && e.impactLevel !== filterImpact) return false;

    // Time range filter
    if (filterTimeRange !== 'all') {
      const eventDate = new Date(e.timestamp);
      const now = new Date();
      if (filterTimeRange === '24h') {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        if (eventDate < yesterday) return false;
      } else if (filterTimeRange === '7d') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (eventDate < lastWeek) return false;
      } else if (filterTimeRange === '30d') {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (eventDate < lastMonth) return false;
      }
    }

    if (searchQuery &&
        !e.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.actor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Events are already in reverse chronological order (most recent first)
  const sortedEvents = filteredEvents;

  // Get category icon
  const getCategoryIcon = (category: AuditEvent['category']) => {
    switch (category) {
      case 'DOCUMENT':
        return FileTextIcon;
      case 'APPROVAL':
        return CheckCircledIcon;
      case 'CASE':
        return ExclamationTriangleIcon;
      case 'COMMITTEE':
        return AvatarIcon;
      case 'POLICY':
        return LayersIcon;
      case 'ACCESS':
        return LockClosedIcon;
      default:
        return DotFilledIcon;
    }
  };

  // Get category color
  const getCategoryColor = (category: AuditEvent['category']) => {
    switch (category) {
      case 'DOCUMENT':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]';
      case 'APPROVAL':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]';
      case 'CASE':
        return 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)]';
      case 'COMMITTEE':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)]';
      case 'POLICY':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]';
      case 'ACCESS':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
    }
  };

  // Get impact icon
  const getImpactIcon = (impact: AuditEvent['impactLevel']) => {
    switch (impact) {
      case 'CRITICAL':
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

  // Get impact color
  const getImpactColor = (impact: AuditEvent['impactLevel']) => {
    switch (impact) {
      case 'CRITICAL':
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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 30) return formatDate(dateString);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
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
          <div className="bg-[color:var(--color-success-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-success)] font-medium">Total Events</span>
              <span className="text-lg font-bold text-[color:var(--color-success)]">{AUDIT_STATS.totalEvents}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-primary)] font-medium">Last 24h</span>
              <span className="text-lg font-bold text-[color:var(--color-primary)]">{AUDIT_STATS.last24Hours}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-primary)] font-medium">Last 7d</span>
              <span className="text-lg font-bold text-[color:var(--color-primary)]">{AUDIT_STATS.last7Days}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Time Range
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterTimeRange('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterTimeRange === 'all'
                ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            All Time
          </button>
          <button
            onClick={() => setFilterTimeRange('24h')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterTimeRange === '24h'
                ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Last 24 Hours ({AUDIT_STATS.last24Hours})
          </button>
          <button
            onClick={() => setFilterTimeRange('7d')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterTimeRange === '7d'
                ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Last 7 Days ({AUDIT_STATS.last7Days})
          </button>
          <button
            onClick={() => setFilterTimeRange('30d')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterTimeRange === '30d'
                ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Category
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCategory === 'all'
                ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Categories
          </button>
          {Object.entries(AUDIT_STATS.byCategory).map(([key, count]) => {
            const Icon = getCategoryIcon(key as AuditEvent['category']);
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  filterCategory === key
                    ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                    : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {key.charAt(0) + key.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Impact Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Impact Level
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterImpact('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterImpact === 'all'
                ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <BarChartIcon className="w-4 h-4" />
            All Levels
          </button>
          {Object.entries(AUDIT_STATS.byImpact).map(([key, count]) => {
            const Icon = getImpactIcon(key as AuditEvent['impactLevel']);
            return (
              <button
                key={key}
                onClick={() => setFilterImpact(key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  filterImpact === key
                    ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] font-medium'
                    : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${getImpactColor(key as AuditEvent['impactLevel'])}`} />
                {key.charAt(0) + key.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Center Content - Event Timeline
  const centerContent = (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] p-6">
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 bg-[color:var(--color-success)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-success)] transition-colors flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Export Log
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search events by action, description, or actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-success-border)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Event Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-[color:var(--color-muted)] mx-auto mb-3" />
            <p className="text-[color:var(--color-muted)]">No events found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedEvents.map((event, index) => {
              const CategoryIcon = getCategoryIcon(event.category);
              const ImpactIcon = getImpactIcon(event.impactLevel);

              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`w-full text-left transition-all ${
                    selectedEvent?.id === event.id ? '' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedEvent?.id === event.id ? 'bg-transparent' : 'bg-[color:var(--color-border)]'
                      }`}></div>
                      {index < sortedEvents.length - 1 && (
                        <div className="w-0.5 h-full bg-[color:var(--color-border)] mt-2"></div>
                      )}
                    </div>

                    {/* Event Card */}
                    <div className={`flex-1 pb-6 bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-md border transition-all hover:shadow-md ${
                      selectedEvent?.id === event.id
                        ? 'border-[color:var(--color-success-border)] shadow-sm'
                        : 'border-[color:var(--color-border)]'
                    }`}>
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <CategoryIcon className="w-5 h-5 text-[color:var(--color-success)] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-[color:var(--color-foreground)] text-sm">
                                {event.action}
                              </h3>
                              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                                {formatRelativeTime(event.timestamp)}
                              </p>
                            </div>
                          </div>
                          <ImpactIcon className={`w-4 h-4 flex-shrink-0 ml-2 ${getImpactColor(event.impactLevel)}`} />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-[color:var(--color-foreground)] mb-3">
                          {event.description}
                        </p>

                        {/* Badges and Info */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(event.category)}`}>
                            {React.createElement(CategoryIcon, { className: 'w-3 h-3' })}
                            {event.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] rounded text-xs">
                            <PersonIcon className="w-3 h-3" />
                            {event.actor}
                          </span>
                          {event.committee && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded text-xs font-medium">
                              {event.committee}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Right Detail Pane - Event Details
  const rightDetail = selectedEvent ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-[color:var(--color-border)] p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {React.createElement(getCategoryIcon(selectedEvent.category), {
              className: 'w-5 h-5 text-[color:var(--color-success)] flex-shrink-0'
            })}
            <div>
              <h2 className="font-semibold text-[color:var(--color-foreground)] text-sm">
                {selectedEvent.eventType.replace(/_/g, ' ')}
              </h2>
              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                {selectedEvent.category}
              </p>
            </div>
          </div>
          {React.createElement(getImpactIcon(selectedEvent.impactLevel), {
            className: `w-5 h-5 ${getImpactColor(selectedEvent.impactLevel)}`
          })}
        </div>

        <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2">
          {selectedEvent.action}
        </h3>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(selectedEvent.category)}`}>
            {React.createElement(getCategoryIcon(selectedEvent.category), { className: 'w-3 h-3' })}
            {selectedEvent.category}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            selectedEvent.impactLevel === 'CRITICAL' ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]' :
            selectedEvent.impactLevel === 'HIGH' ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]' :
            selectedEvent.impactLevel === 'MEDIUM' ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]' :
            'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
          }`}>
            {selectedEvent.impactLevel}
          </span>
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
            {selectedEvent.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3 space-y-2">
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Timestamp</span>
            <span className="text-[color:var(--color-foreground)] font-medium text-right">
              {formatDate(selectedEvent.timestamp)}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Actor</span>
            <span className="text-[color:var(--color-foreground)] font-medium text-right">
              {selectedEvent.actor}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Role</span>
            <span className="text-[color:var(--color-foreground)] font-medium text-right">
              {selectedEvent.actorRole}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Target Type</span>
            <span className="text-[color:var(--color-foreground)] font-medium">
              {selectedEvent.targetType}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Target</span>
            <span className="text-[color:var(--color-info)] font-medium hover:underline cursor-pointer text-right">
              {selectedEvent.targetName}
            </span>
          </div>
          {selectedEvent.committee && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-[color:var(--color-muted)]">Committee</span>
              <span className="text-[color:var(--color-primary)] font-medium">
                {selectedEvent.committee}
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Additional Details
            </h4>
            <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3 space-y-2">
              {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between text-xs">
                  <span className="text-[color:var(--color-primary)] font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-[color:var(--color-info)] text-right max-w-[60%]">
                    {typeof value === 'number' && key.toLowerCase().includes('amount')
                      ? `$${value.toLocaleString()}`
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event ID */}
        <div className="pt-4 border-t border-[color:var(--color-border)]">
          <p className="text-xs text-[color:var(--color-muted)]">
            Event ID: <span className="font-mono text-[color:var(--color-foreground)]">{selectedEvent.id}</span>
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Audit Timeline"
        description="Comprehensive event history and compliance tracking"
      />
      <ThreePaneWorkspace
        leftNav={leftNav}
        centerContent={centerContent}
        rightDetail={rightDetail}
        showRightPane={!!selectedEvent}
      />
    </>
  );
}
