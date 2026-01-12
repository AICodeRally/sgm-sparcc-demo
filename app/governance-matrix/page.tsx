'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  TableIcon,
  FileTextIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  LayersIcon,
  AvatarIcon,
  CalendarIcon,
  DotFilledIcon,
  DoubleArrowUpIcon,
  ArrowUpIcon,
  DashIcon,
  Link2Icon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import {
  GOVERNANCE_MATRIX,
  MATRIX_STATS,
  POLICY_AREAS,
  AUTHORITY_INFO,
  MatrixEntry,
} from '@/lib/data/synthetic/governance-matrix.data';
import { ThemeBadge } from '@/components/ThemeBadge';
import { getToneStyles } from '@/lib/config/themes';

export default function GovernanceMatrixPage() {
  const [selectedEntry, setSelectedEntry] = useState<MatrixEntry | null>(null);
  const [filterPolicyArea, setFilterPolicyArea] = useState<string>('all');
  const [filterAuthority, setFilterAuthority] = useState<string>('all');
  const [filterCoverage, setFilterCoverage] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toneStyles = getToneStyles('infra');

  // Filter matrix entries
  const filteredEntries = GOVERNANCE_MATRIX.filter(e => {
    if (filterPolicyArea !== 'all' && e.policyArea !== filterPolicyArea) return false;
    if (filterAuthority !== 'all' && e.approvalAuthority !== filterAuthority) return false;
    if (filterCoverage !== 'all' && e.coverage !== filterCoverage) return false;
    if (filterRisk !== 'all' && e.riskLevel !== filterRisk) return false;
    if (searchQuery &&
        !e.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.documentCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.policyArea.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get coverage icon
  const getCoverageIcon = (coverage: MatrixEntry['coverage']) => {
    switch (coverage) {
      case 'FULL':
        return CheckCircledIcon;
      case 'PARTIAL':
        return ExclamationTriangleIcon;
      case 'GAP':
        return CrossCircledIcon;
      default:
        return DotFilledIcon;
    }
  };

  // Get coverage color
  const getCoverageColor = (coverage: MatrixEntry['coverage']) => {
    switch (coverage) {
      case 'FULL':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]';
      case 'PARTIAL':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]';
      case 'GAP':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
    }
  };

  // Get risk icon
  const getRiskIcon = (risk: MatrixEntry['riskLevel']) => {
    switch (risk) {
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

  // Get risk color
  const getRiskColor = (risk: MatrixEntry['riskLevel']) => {
    switch (risk) {
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

  // Get authority color
  const getAuthorityColor = (authority: MatrixEntry['approvalAuthority']) => {
    switch (authority) {
      case 'SGCC':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)]';
      case 'CRB':
        return 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)]';
      case 'VP_COMP':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]';
      case 'MANAGER':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
      case 'AUTO':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
    }
  };

  // Format authority name
  const formatAuthority = (authority: MatrixEntry['approvalAuthority']) => {
    return authority.replace(/_/g, ' ');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Left Navigation - Stats and Filters
  const leftNav = (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Coverage Stats
        </h2>
        <div className="space-y-2">
          <div className="bg-[color:var(--color-info-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-info)] font-medium">Total Policies</span>
              <span className="text-lg font-bold text-[color:var(--color-info)]">{MATRIX_STATS.totalPolicies}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-success-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-success)] font-medium">Full Coverage</span>
              <span className="text-lg font-bold text-[color:var(--color-success)]">{MATRIX_STATS.fullCoverage}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-warning-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-warning)] font-medium">Partial</span>
              <span className="text-lg font-bold text-[color:var(--color-warning)]">{MATRIX_STATS.partialCoverage}</span>
            </div>
          </div>
          <div className="bg-[color:var(--color-error-bg)] rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-error)] font-medium">Gaps</span>
              <span className="text-lg font-bold text-[color:var(--color-error)]">{MATRIX_STATS.gaps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Coverage
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterCoverage('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'all'
                ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Coverage
          </button>
          <button
            onClick={() => setFilterCoverage('FULL')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'FULL'
                ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <CheckCircledIcon className="w-4 h-4 text-[color:var(--color-success)]" />
            Full ({MATRIX_STATS.fullCoverage})
          </button>
          <button
            onClick={() => setFilterCoverage('PARTIAL')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'PARTIAL'
                ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 text-[color:var(--color-warning)]" />
            Partial ({MATRIX_STATS.partialCoverage})
          </button>
          <button
            onClick={() => setFilterCoverage('GAP')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterCoverage === 'GAP'
                ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <CrossCircledIcon className="w-4 h-4 text-[color:var(--color-error)]" />
            Gaps ({MATRIX_STATS.gaps})
          </button>
        </div>
      </div>

      {/* Authority Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Authority
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilterAuthority('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterAuthority === 'all'
                ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <AvatarIcon className="w-4 h-4" />
            All Authorities
          </button>
          {Object.entries(MATRIX_STATS.byAuthority).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilterAuthority(key)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                filterAuthority === key
                  ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                  : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              <AvatarIcon className="w-4 h-4" />
              {formatAuthority(key as MatrixEntry['approvalAuthority'])} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Policy Area Filter */}
      <div>
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Policy Area
        </h2>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          <button
            onClick={() => setFilterPolicyArea('all')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              filterPolicyArea === 'all'
                ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            All Areas
          </button>
          {POLICY_AREAS.map(area => {
            const count = MATRIX_STATS.byPolicyArea[area] || 0;
            return (
              <button
                key={area}
                onClick={() => setFilterPolicyArea(area)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  filterPolicyArea === area
                    ? 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] font-medium'
                    : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                }`}
              >
                {area} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Center Content - Matrix Table
  const centerContent = (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] p-6">
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2">
            <TableIcon className="w-4 h-4" />
            Export Matrix
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search by policy title, code, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-[color:var(--color-surface)] rounded-md border border-[color:var(--color-border)] overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[color:var(--color-surface-alt)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  Area
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  Authority
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                  SLA
                </th>
              </tr>
            </thead>
            <tbody className="bg-[color:var(--color-surface)] divide-y divide-gray-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[color:var(--color-muted)]">
                    No policies found
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const CoverageIcon = getCoverageIcon(entry.coverage);
                  const RiskIcon = getRiskIcon(entry.riskLevel);

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-[color:var(--color-surface-alt)] cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id ? 'bg-[color:var(--color-info-bg)]' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="w-4 h-4 text-[color:var(--color-info)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[color:var(--color-foreground)] truncate">
                              {entry.documentTitle}
                            </p>
                            <p className="text-xs text-[color:var(--color-muted)]">{entry.documentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[color:var(--color-foreground)]">{entry.policyArea}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCoverageColor(entry.coverage)}`}>
                          {React.createElement(CoverageIcon, { className: 'w-3 h-3' })}
                          {entry.coverage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getAuthorityColor(entry.approvalAuthority)}`}>
                          {formatAuthority(entry.approvalAuthority)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {React.createElement(RiskIcon, {
                          className: `w-5 h-5 mx-auto ${getRiskColor(entry.riskLevel)}`
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[color:var(--color-foreground)]">{entry.sla || 'N/A'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Right Detail Pane - Entry Details
  const rightDetail = selectedEntry ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-[color:var(--color-border)] p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-[color:var(--color-info)] flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-[color:var(--color-foreground)] text-sm">
                {selectedEntry.documentCode}
              </h2>
              <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                {selectedEntry.policyArea}
              </p>
            </div>
          </div>
          {React.createElement(getRiskIcon(selectedEntry.riskLevel), {
            className: `w-5 h-5 ${getRiskColor(selectedEntry.riskLevel)}`
          })}
        </div>

        <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2">
          {selectedEntry.documentTitle}
        </h3>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCoverageColor(selectedEntry.coverage)}`}>
            {React.createElement(getCoverageIcon(selectedEntry.coverage), { className: 'w-3 h-3' })}
            {selectedEntry.coverage} Coverage
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getAuthorityColor(selectedEntry.approvalAuthority)}`}>
            {formatAuthority(selectedEntry.approvalAuthority)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Policy Details */}
        <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3 space-y-2">
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Owner</span>
            <span className="text-[color:var(--color-foreground)] font-medium text-right">
              {selectedEntry.owner}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Approval Threshold</span>
            <span className="text-[color:var(--color-foreground)] font-medium text-right max-w-[60%]">
              {selectedEntry.approvalThreshold || 'N/A'}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">SLA</span>
            <span className="text-[color:var(--color-foreground)] font-medium">
              {selectedEntry.sla || 'N/A'}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-[color:var(--color-muted)]">Risk Level</span>
            <span className={`font-medium ${getRiskColor(selectedEntry.riskLevel)}`}>
              {selectedEntry.riskLevel}
            </span>
          </div>
        </div>

        {/* Compensation Artifacts */}
        <div>
          <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
            Compensation Artifacts
          </h4>
          <div className="space-y-1">
            {selectedEntry.compArtifacts.map((artifact, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-[color:var(--color-surface-alt)] rounded text-sm"
              >
                <DotFilledIcon className="w-3 h-3 text-[color:var(--color-info)]" />
                <span className="text-[color:var(--color-info)]">{artifact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Dates */}
        <div>
          <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
            Review Schedule
          </h4>
          <div className="bg-[color:var(--color-surface-alt)] rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[color:var(--color-muted)] flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Last Reviewed
              </span>
              <span className="text-[color:var(--color-foreground)] font-medium">
                {formatDate(selectedEntry.lastReviewed)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[color:var(--color-muted)] flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Next Review
              </span>
              <span className="text-[color:var(--color-foreground)] font-medium">
                {formatDate(selectedEntry.nextReview)}
              </span>
            </div>
          </div>
        </div>

        {/* Related Documents */}
        {selectedEntry.relatedDocuments && selectedEntry.relatedDocuments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Related Documents ({selectedEntry.relatedDocuments.length})
            </h4>
            <div className="space-y-1">
              {selectedEntry.relatedDocuments.map((docCode, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-[color:var(--color-surface-alt)] rounded hover:bg-[color:var(--color-surface-alt)] cursor-pointer transition-colors"
                >
                  <Link2Icon className="w-3 h-3 text-[color:var(--color-muted)]" />
                  <span className="text-sm text-[color:var(--color-info)] hover:underline">{docCode}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-none p-4 border-t border-[color:var(--color-border)] space-y-2">
        <button className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors">
          View Policy Document
        </button>
        <button className="w-full px-4 py-2 bg-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-md text-sm font-medium hover:bg-[color:var(--color-border)] transition-colors">
          View Coverage Details
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Governance Matrix"
        description="Policy coverage, approval authorities, and compliance mapping"
      />
      <ThreePaneWorkspace
        leftNav={
          <div className="space-y-4">
            <div
              className="bg-[color:var(--color-surface)] rounded-lg border p-4 theme-card"
              style={{ border: toneStyles.border, boxShadow: toneStyles.shadow }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)]">
                    <TableIcon className="w-5 h-5 text-[color:var(--color-foreground)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Coverage Overview</h2>
                    <p className="text-sm text-[color:var(--color-muted)]">Search and filter governance coverage</p>
                  </div>
                </div>
                <ThemeBadge />
              </div>
              {leftNav.props.children[1]}
            </div>
          </div>
        }
        centerContent={
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div
              className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] p-6 theme-card"
              style={{ border: toneStyles.border, boxShadow: toneStyles.shadow }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Filters</h2>
                  <p className="text-sm text-[color:var(--color-muted)]">Slice by policy area, authority, coverage, and risk</p>
                </div>
                <button className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-medium hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2">
                  <TableIcon className="w-4 h-4" />
                  Export Matrix
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)]" />
                <input
                  type="text"
                  placeholder="Search by policy title, code, or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Matrix Table */}
            {centerContent.props.children[1]}
          </div>
        }
        rightDetail={rightDetail}
        showRightPane={!!selectedEntry}
      />
    </>
  );
}
