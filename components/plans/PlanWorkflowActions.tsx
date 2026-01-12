'use client';

import { useState } from 'react';
import {
  PaperPlaneIcon,
  CheckCircledIcon,
  RocketIcon,
  CrossCircledIcon,
  ArchiveIcon,
  DownloadIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import type { Plan } from '@/lib/contracts/plan.contract';

interface PlanWorkflowActionsProps {
  plan: Plan;
  onActionComplete?: (updatedPlan: Plan) => void;
}

export default function PlanWorkflowActions({
  plan,
  onActionComplete,
}: PlanWorkflowActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLifecycleAction = async (action: string, additionalData?: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/plans/${plan.id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...additionalData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process action');
      }

      const data = await response.json();
      setSuccess(data.message);

      if (onActionComplete && data.plan) {
        onActionComplete(data.plan);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/plans/${plan.id}/generate-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'PDF',
          includeMetadata: true,
          generatedBy: 'current-user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate document');
      }

      const data = await response.json();
      setSuccess(`Document generated: ${data.documentId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (plan.status) {
      case 'DRAFT':
      case 'IN_PROGRESS':
        actions.push({
          label: 'Submit for Review',
          action: 'submit-for-review',
          icon: PaperPlaneIcon,
          data: { submittedBy: 'current-user' },
          className: 'bg-[color:var(--color-primary)] hover:bg-[color:var(--color-secondary)] text-white',
        });
        break;

      case 'UNDER_REVIEW':
        actions.push({
          label: 'Submit for Approval',
          action: 'submit-for-approval',
          icon: PaperPlaneIcon,
          data: { submittedBy: 'current-user' },
          className: 'bg-[color:var(--color-success)] hover:bg-[color:var(--color-success)] text-white',
        });
        actions.push({
          label: 'Reject',
          action: 'reject',
          icon: CrossCircledIcon,
          data: { rejectedBy: 'current-user', reason: 'Needs revision' },
          className: 'bg-[color:var(--color-error)] hover:bg-[color:var(--color-error)] text-white',
        });
        break;

      case 'PENDING_APPROVAL':
        actions.push({
          label: 'Approve',
          action: 'approve',
          icon: CheckCircledIcon,
          data: { approvedBy: 'current-user' },
          className: 'bg-[color:var(--color-success)] hover:bg-[color:var(--color-success)] text-white',
        });
        actions.push({
          label: 'Reject',
          action: 'reject',
          icon: CrossCircledIcon,
          data: { rejectedBy: 'current-user', reason: 'Not approved' },
          className: 'bg-[color:var(--color-error)] hover:bg-[color:var(--color-error)] text-white',
        });
        break;

      case 'APPROVED':
        actions.push({
          label: 'Publish',
          action: 'publish',
          icon: RocketIcon,
          data: {
            publishedBy: 'current-user',
            effectiveDate: new Date(),
          },
          className: 'bg-[color:var(--color-primary)] hover:bg-[color:var(--color-secondary)] text-white',
        });
        break;
    }

    // Archive action available for most statuses
    if (!['ARCHIVED', 'PUBLISHED'].includes(plan.status)) {
      actions.push({
        label: 'Archive',
        action: 'archive',
        icon: ArchiveIcon,
        data: { archivedBy: 'current-user' },
        className: 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)]',
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-3">
      {/* Success/Error Messages */}
      {error && (
        <div className="bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] text-[color:var(--color-error)] px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[color:var(--color-success-bg)] border border-[color:var(--color-success-border)] text-[color:var(--color-success)] px-4 py-2 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Workflow Actions */}
      {availableActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((actionItem) => {
            const Icon = actionItem.icon;
            return (
              <button
                key={actionItem.action}
                onClick={() => handleLifecycleAction(actionItem.action, actionItem.data)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${actionItem.className}`}
              >
                <Icon className="h-5 w-5" />
                {actionItem.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Generate Document Action */}
      {['APPROVED', 'PUBLISHED'].includes(plan.status) && (
        <div className="pt-2 border-t border-[color:var(--color-border)]">
          <button
            onClick={handleGenerateDocument}
            disabled={loading}
            className="px-4 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="h-5 w-5" />
            Generate Document
          </button>
        </div>
      )}
    </div>
  );
}
