'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircledIcon } from '@radix-ui/react-icons';

interface ApprovalStep {
  stepOrder: number;
  stepName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  approverName?: string;
  approverDecision?: string;
  comments?: string;
  decidedAt?: string;
}

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const approvalId = params.id as string;

  // Mock data
  const approval = {
    id: approvalId,
    documentId: 'doc-1',
    documentTitle: 'Sales Crediting Policy v2.0',
    documentCode: 'POL-001',
    requestedBy: 'Jane Smith',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    steps: [
      {
        stepOrder: 1,
        stepName: 'Stakeholder Review',
        role: 'Sales Leadership',
        status: 'approved',
        approverName: 'David Rodriguez',
        approverDecision: 'approved',
        comments: 'Policy looks good. Ready for legal review.',
        decidedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        stepOrder: 2,
        stepName: 'Legal Review',
        role: 'General Counsel',
        status: 'pending',
        approverName: 'Michael Chen',
        approverDecision: undefined,
      },
      {
        stepOrder: 3,
        stepName: 'SGCC Approval',
        role: 'Committee',
        status: 'pending',
      },
    ] as ApprovalStep[],
  };

  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In real implementation, this would submit to API
      console.log('Submitting decision:', { decision, comments });
      // Redirect after submission
      setTimeout(() => {
        router.push('/approvals');
      }, 1000);
    } catch (error) {
      console.error('Error submitting decision:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/approvals" className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)] text-sm mb-4 inline-block">
            ← Back to Queue
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">{approval.documentTitle}</h1>
          <p className="text-[color:var(--color-muted)] mt-1">{approval.documentCode}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Workflow Stepper */}
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
              <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-8">Approval Workflow</h2>

              <div className="space-y-6">
                {approval.steps.map((step, index) => {
                  const isCompleted = step.status === 'approved' || step.status === 'rejected';
                  const isCurrent = index === approval.steps.findIndex(s => s.status === 'pending');

                  return (
                    <div key={step.stepOrder}>
                      <div className="flex gap-6">
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                              isCompleted
                                ? step.status === 'approved'
                                  ? 'bg-[color:var(--color-success)]'
                                  : 'bg-[color:var(--color-error)]'
                                : isCurrent
                                ? 'bg-[color:var(--color-primary)]'
                                : 'bg-[color:var(--color-border)]'
                            }`}
                          >
                            {isCompleted && step.status === 'approved' ? (
                              <CheckCircledIcon className="w-5 h-5" />
                            ) : (
                              step.stepOrder
                            )}
                          </div>
                          {index < approval.steps.length - 1 && (
                            <div
                              className={`w-1 h-16 ${
                                isCompleted || isCurrent || index < approval.steps.findIndex(s => s.status === 'pending')
                                  ? 'bg-[color:var(--color-success)]'
                                  : 'bg-[color:var(--color-border)]'
                              }`}
                            />
                          )}
                        </div>

                        {/* Step details */}
                        <div className="flex-1 pb-6">
                          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">{step.stepName}</h3>
                          <p className="text-sm text-[color:var(--color-muted)] mt-1">Role: {step.role}</p>

                          {isCompleted && (
                            <div className="mt-4 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                              <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                                {step.approverName}{' '}
                                <span
                                  className={`font-bold ${
                                    step.status === 'approved' ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'
                                  }`}
                                >
                                  {step.status === 'approved' ? 'approved' : 'rejected'}
                                </span>
                              </p>
                              {step.comments && (
                                <p className="text-sm text-[color:var(--color-muted)] mt-2 italic">"{step.comments}"</p>
                              )}
                              {step.decidedAt && (
                                <p className="text-xs text-[color:var(--color-muted)] mt-2">
                                  {new Date(step.decidedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {isCurrent && (
                            <div className="mt-4 p-4 bg-[color:var(--color-surface-alt)] border border-[color:var(--color-info-border)] rounded-lg">
                              <p className="text-sm font-medium text-[color:var(--color-info)]">Awaiting your decision</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Document Preview</h2>
              <div className="p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                <p className="text-sm text-[color:var(--color-muted)]">
                  <Link href={`/documents/doc-1`} className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)]">
                    View full document →
                  </Link>
                </p>
              </div>
            </div>

            {/* Decision Form */}
            <form onSubmit={handleSubmit} className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-6">Your Decision</h2>

              <div className="space-y-6">
                {/* Decision Selection */}
                <div>
                  <label className="text-sm font-medium text-[color:var(--color-foreground)] block mb-3">Decision</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-surface-alt)] cursor-pointer">
                      <input
                        type="radio"
                        name="decision"
                        value="approved"
                        checked={decision === 'approved'}
                        onChange={() => setDecision('approved')}
                        className="w-4 h-4 text-[color:var(--color-info)]"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-[color:var(--color-foreground)]">Approve</p>
                        <p className="text-sm text-[color:var(--color-muted)]">I approve this document and it can move to the next step</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-error-bg)] cursor-pointer">
                      <input
                        type="radio"
                        name="decision"
                        value="rejected"
                        checked={decision === 'rejected'}
                        onChange={() => setDecision('rejected')}
                        className="w-4 h-4 text-[color:var(--color-error)]"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-[color:var(--color-foreground)]">Reject</p>
                        <p className="text-sm text-[color:var(--color-muted)]">I request changes before approval</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                    Comments {decision === 'rejected' && <span className="text-[color:var(--color-error)]">*</span>}
                  </label>
                  <textarea
                    id="comments"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Add any comments or feedback..."
                    rows={4}
                    className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t border-[color:var(--color-border)]">
                  <button
                    type="submit"
                    disabled={!decision || (decision === 'rejected' && !comments.trim()) || submitting}
                    className="flex-1 px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] disabled:bg-[color:var(--color-border)] font-medium"
                  >
                    {submitting ? 'Submitting...' : 'Submit Decision'}
                  </button>
                  <Link href="/approvals" className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] font-medium">
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar - Request Info */}
          <div className="space-y-6">
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Request Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Requested By</label>
                  <p className="mt-1 text-[color:var(--color-foreground)]">{approval.requestedBy}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Date Requested</label>
                  <p className="mt-1 text-[color:var(--color-foreground)]">{approval.requestedAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Status</label>
                  <p className="mt-1">
                    <span className="px-2 py-1 bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] rounded text-xs font-medium">
                      {approval.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Progress</h3>
              <div className="space-y-2">
                <p className="text-sm text-[color:var(--color-muted)]">
                  Step {approval.steps.findIndex(s => s.status === 'pending') + 1} of {approval.steps.length}
                </p>
                <div className="w-full bg-[color:var(--color-border)] rounded-full h-2">
                  <div
                    className="bg-[color:var(--color-primary)] h-2 rounded-full transition-all"
                    style={{
                      width: `${((approval.steps.findIndex(s => s.status === 'pending') + 1) / approval.steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
