'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  PersonIcon,
  FileTextIcon,
  DotFilledIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
  ChatBubbleIcon,
  CalendarIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { APPROVAL_ITEMS, APPROVAL_STATS, CRB_WINDFALL_DECISIONS, type ApprovalItem } from '@/lib/data/synthetic/governance-approvals.data';
import { DemoBadge, DemoHighlight } from '@/components/demo/DemoBadge';
import { DemoToggle, DemoFilter, DemoWarningBanner } from '@/components/demo/DemoToggle';
import { ModeContextBadge } from '@/components/modes/ModeBadge';

export default function ApprovalsPage() {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCommittee, setFilterCommittee] = useState<string>('all');
  const [demoFilter, setDemoFilter] = useState<DemoFilter>('all');

  // Filter approvals
  const filteredApprovals = APPROVAL_ITEMS.filter(approval => {
    if (filterStatus !== 'all' && approval.status !== filterStatus) return false;
    if (filterCommittee !== 'all' && approval.committee !== filterCommittee) return false;
    // Demo filter
    if (demoFilter === 'demo-only' && !approval.isDemo) return false;
    if (demoFilter === 'real-only' && approval.isDemo) return false;
    return true;
  });

  // Calculate demo counts
  const demoCounts = {
    total: APPROVAL_ITEMS.length,
    demo: APPROVAL_ITEMS.filter(a => a.isDemo).length,
    real: APPROVAL_ITEMS.filter(a => !a.isDemo).length,
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: 'bg-[color:var(--color-surface-alt)]', text: 'text-[color:var(--color-foreground)]', icon: ClockIcon },
      IN_REVIEW: { bg: 'bg-[color:var(--color-info-bg)]', text: 'text-[color:var(--color-primary)]', icon: UpdateIcon },
      APPROVED: { bg: 'bg-[color:var(--color-success-bg)]', text: 'text-[color:var(--color-success)]', icon: CheckCircledIcon },
      REJECTED: { bg: 'bg-[color:var(--color-error-bg)]', text: 'text-[color:var(--color-error)]', icon: CrossCircledIcon },
      NEEDS_INFO: { bg: 'bg-[color:var(--color-warning-bg)]', text: 'text-[color:var(--color-warning)]', icon: ChatBubbleIcon },
    };
    return styles[status] || styles.PENDING;
  };

  // SLA status styling
  const getSLABadge = (slaStatus: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      ON_TIME: { bg: 'bg-[color:var(--color-success-bg)]', text: 'text-[color:var(--color-success)]', border: 'border-[color:var(--color-success-border)]' },
      AT_RISK: { bg: 'bg-[color:var(--color-warning-bg)]', text: 'text-[color:var(--color-warning)]', border: 'border-[color:var(--color-warning-border)]' },
      OVERDUE: { bg: 'bg-[color:var(--color-error-bg)]', text: 'text-[color:var(--color-error)]', border: 'border-[color:var(--color-error-border)]' },
    };
    return styles[slaStatus] || styles.ON_TIME;
  };

  // Priority badge
  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      LOW: { bg: 'bg-[color:var(--color-surface-alt)]', text: 'text-[color:var(--color-muted)]' },
      MEDIUM: { bg: 'bg-[color:var(--color-info-bg)]', text: 'text-[color:var(--color-primary)]' },
      HIGH: { bg: 'bg-[color:var(--color-warning-bg)]', text: 'text-[color:var(--color-warning)]' },
      URGENT: { bg: 'bg-[color:var(--color-error-bg)]', text: 'text-[color:var(--color-error)]' },
    };
    return styles[priority] || styles.MEDIUM;
  };

  // Left Nav - Filters
  const leftNav = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider px-3 mb-3">
          Quick Stats
        </h2>
        <div className="space-y-2 px-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-muted)]">Pending</span>
            <span className="font-semibold text-[color:var(--color-foreground)]">{APPROVAL_STATS.pending}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-muted)]">In Review</span>
            <span className="font-semibold text-[color:var(--color-info)]">{APPROVAL_STATS.inReview}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-muted)]">At Risk</span>
            <span className="font-semibold text-[color:var(--color-warning)]">{APPROVAL_STATS.atRisk}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider px-3 mb-3">
          Status
        </h2>
        <div className="space-y-1">
          {['all', 'PENDING', 'IN_REVIEW', 'NEEDS_INFO', 'APPROVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] font-medium'
                  : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider px-3 mb-3">
          Committee
        </h2>
        <div className="space-y-1">
          {['all', 'SGCC', 'CRB'].map(committee => (
            <button
              key={committee}
              onClick={() => setFilterCommittee(committee)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                filterCommittee === committee
                  ? 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] font-medium'
                  : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              {committee === 'all' ? 'All Committees' : committee}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Center Content - Approval list
  const centerContent = (
    <div className="flex flex-col h-full">
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
      <div className="flex-none bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)]">
            <ModeContextBadge size="sm" />
            <span>{filteredApprovals.length} item{filteredApprovals.length !== 1 ? 's' : ''}</span>
            {filterStatus !== 'all' && <span>• Status: {filterStatus.replace(/_/g, ' ')}</span>}
            {filterCommittee !== 'all' && <span>• Committee: {filterCommittee}</span>}
            {demoFilter !== 'all' && (
              <span className="text-[color:var(--color-warning)] font-medium">
                • Showing {demoFilter === 'demo-only' ? 'Demo Only' : 'Real Data Only'}
              </span>
            )}
          </div>
          <DemoToggle
            value={demoFilter}
            onChange={setDemoFilter}
            counts={demoCounts}
            mode="compact"
          />
        </div>
      </div>

      {/* Approval list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {filteredApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <CheckCircledIcon className="w-12 h-12 text-[color:var(--color-muted)] mb-3" />
            <p className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">No approvals found</p>
            <p className="text-sm text-[color:var(--color-muted)]">Try adjusting your filters</p>
          </div>
        ) : (
          filteredApprovals.map(approval => {
            const statusStyle = getStatusBadge(approval.status);
            const slaStyle = getSLABadge(approval.slaStatus);
            const priorityStyle = getPriorityBadge(approval.priority);

            return (
              <DemoHighlight key={approval.id} isDemo={approval.isDemo}>
                <button
                  onClick={() => setSelectedApproval(approval)}
                  className={`w-full text-left px-4 py-4 hover:bg-[color:var(--color-surface-alt)] transition-colors ${
                    selectedApproval?.id === approval.id ? 'bg-[color:var(--color-warning-bg)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] truncate">
                              {approval.title}
                            </h3>
                            <DemoBadge isDemo={approval.isDemo} demoMetadata={approval.demoMetadata} size="sm" />
                          </div>
                        <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                          {approval.type} • {approval.committee}
                          {approval.documentCode && ` • ${approval.documentCode}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                          {approval.priority}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {React.createElement(statusStyle.icon, { className: 'w-3 h-3' })}
                          {approval.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[color:var(--color-muted)] line-clamp-2 mb-2">
                      {approval.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[color:var(--color-muted)]">
                      <div className="flex items-center gap-1">
                        <PersonIcon className="w-3 h-3" />
                        {approval.requestedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(approval.requestedAt).toLocaleDateString()}
                      </div>
                      {approval.amount && (
                        <div className="flex items-center gap-1 font-medium text-[color:var(--color-foreground)]">
                          ${(approval.amount / 1000).toFixed(0)}K
                        </div>
                      )}
                    </div>

                    {/* Progress & SLA */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-[color:var(--color-muted)] mb-1">
                          <span>Step {approval.currentStep + 1} of {approval.totalSteps}</span>
                          <span>{approval.approvers.filter(a => a.status === 'APPROVED').length}/{approval.approvers.length} approved</span>
                        </div>
                        <div className="w-full bg-[color:var(--color-border)] rounded-full h-1.5">
                          <div
                            className="bg-[color:var(--color-warning)] h-1.5 rounded-full transition-all"
                            style={{ width: `${((approval.currentStep + 1) / approval.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${slaStyle.bg} ${slaStyle.text} ${slaStyle.border}`}>
                        <ClockIcon className="w-3 h-3" />
                        {approval.businessDaysRemaining}d
                      </div>
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
  );

  // Right Detail Pane - Approval details
  const rightDetail = selectedApproval ? (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-[color:var(--color-border)]">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">Approval Details</h3>
          {selectedApproval.slaStatus === 'AT_RISK' && (
            <ExclamationTriangleIcon className="w-5 h-5 text-[color:var(--color-warning)]" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedApproval.status).bg} ${getStatusBadge(selectedApproval.status).text}`}>
            {selectedApproval.status.replace(/_/g, ' ')}
          </span>
          <span className="px-2 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded text-xs font-medium">
            {selectedApproval.committee}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Requestor */}
        <div>
          <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
            Requested By
          </p>
          <div className="flex items-center gap-2">
            <PersonIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
            <p className="text-sm text-[color:var(--color-foreground)]">{selectedApproval.requestedBy}</p>
          </div>
          <p className="text-xs text-[color:var(--color-muted)] mt-1">
            {new Date(selectedApproval.requestedAt).toLocaleString()}
          </p>
        </div>

        {/* Amount */}
        {selectedApproval.amount && (
          <div>
            <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Amount
            </p>
            <p className="text-lg font-bold text-[color:var(--color-foreground)]">
              ${selectedApproval.amount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Deal Info */}
        {selectedApproval.dealId && (
          <div>
            <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Deal Information
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[color:var(--color-muted)]">Deal ID:</span>
                <span className="text-[color:var(--color-foreground)] font-medium">{selectedApproval.dealId}</span>
              </div>
              {selectedApproval.repName && (
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-muted)]">Rep:</span>
                  <span className="text-[color:var(--color-foreground)] font-medium">{selectedApproval.repName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document */}
        {selectedApproval.documentCode && (
          <div>
            <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Document
            </p>
            <Link
              href={`/documents/${selectedApproval.documentCode}`}
              className="flex items-center gap-2 text-sm text-[color:var(--color-info)] hover:text-[color:var(--color-primary)]"
            >
              <FileTextIcon className="w-4 h-4" />
              {selectedApproval.documentCode}
            </Link>
          </div>
        )}

        {/* SLA */}
        <div>
          <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
            SLA Status
          </p>
          <div className={`p-3 rounded-lg border ${getSLABadge(selectedApproval.slaStatus).bg} ${getSLABadge(selectedApproval.slaStatus).border}`}>
            <p className={`text-sm font-medium ${getSLABadge(selectedApproval.slaStatus).text}`}>
              {selectedApproval.slaStatus.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              {selectedApproval.businessDaysRemaining} business days remaining
            </p>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">
              Due: {new Date(selectedApproval.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Approvers */}
        <div>
          <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
            Approvers ({selectedApproval.approvers.filter(a => a.status === 'APPROVED').length}/{selectedApproval.approvers.length})
          </p>
          <div className="space-y-2">
            {selectedApproval.approvers.map(approver => (
              <div
                key={approver.id}
                className="p-3 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[color:var(--color-foreground)]">{approver.name}</p>
                    <p className="text-xs text-[color:var(--color-muted)]">{approver.role}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    approver.status === 'APPROVED' ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]' :
                    approver.status === 'REJECTED' ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]' :
                    'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                  }`}>
                    {approver.status === 'APPROVED' && <CheckCircledIcon className="w-3 h-3" />}
                    {approver.status === 'REJECTED' && <CrossCircledIcon className="w-3 h-3" />}
                    {approver.status === 'PENDING' && <ClockIcon className="w-3 h-3" />}
                    {approver.status}
                  </span>
                </div>
                {approver.decidedAt && (
                  <p className="text-xs text-[color:var(--color-muted)] mt-1">
                    {new Date(approver.decidedAt).toLocaleString()}
                  </p>
                )}
                {approver.comments && (
                  <p className="text-xs text-[color:var(--color-foreground)] mt-2 p-2 bg-[color:var(--color-surface-alt)] rounded">
                    {approver.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CRB Decision Options */}
        {selectedApproval.type === 'WINDFALL' && selectedApproval.status === 'PENDING' && (
          <div>
            <p className="text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              CRB Decision Options
            </p>
            <div className="space-y-2">
              {CRB_WINDFALL_DECISIONS.map((option, idx) => (
                <div key={option.id} className="p-2 bg-[color:var(--color-surface-alt)] rounded text-xs">
                  <p className="font-medium text-[color:var(--color-foreground)]">{idx + 1}. {option.name}</p>
                  <p className="text-[color:var(--color-muted)] mt-0.5">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {selectedApproval.status === 'PENDING' && (
        <div className="flex-none p-4 border-t border-[color:var(--color-border)] space-y-2">
          <button className="w-full px-4 py-2 bg-[color:var(--color-success)] text-white rounded-md hover:bg-[color:var(--color-success)] font-medium text-sm">
            Approve
          </button>
          <button className="w-full px-4 py-2 bg-[color:var(--color-error)] text-white rounded-md hover:bg-[color:var(--color-error)] font-medium text-sm">
            Reject
          </button>
          <button className="w-full px-4 py-2 bg-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-md hover:bg-[color:var(--color-border)] font-medium text-sm">
            Request More Info
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Approvals Queue"
        description="SGCC and CRB workflows with approval thresholds and SLA tracking"
      />
      <div className="h-full">
        <ThreePaneWorkspace
          leftNav={leftNav}
          centerContent={centerContent}
          rightDetail={rightDetail}
          showRightPane={!!selectedApproval}
        />
      </div>
    </>
  );
}
