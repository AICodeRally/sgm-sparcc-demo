'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  FileTextIcon,
  CalendarIcon,
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  Pencil1Icon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface Plan {
  id: string;
  planCode: string;
  title: string;
  description?: string;
  planType: string;
  version: string;
  status: string;
  owner: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  effectiveDate?: string;
  expirationDate?: string;
  completionPercentage: number;
  sectionsCompleted: number;
  sectionsTotal: number;
  metadata?: Record<string, any>;
}

interface PlanSection {
  id: string;
  sectionKey: string;
  title: string;
  description?: string;
  orderIndex: number;
  level: number;
  isRequired: boolean;
  content: string;
  completionStatus: string;
  completionPercentage: number;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]',
  IN_PROGRESS: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]',
  UNDER_REVIEW: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
  PENDING_APPROVAL: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
  APPROVED: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]',
  PUBLISHED: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-accent)] border-[color:var(--color-border)]',
  ARCHIVED: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)] border-[color:var(--color-border)]',
};

const completionStatusColors: Record<string, string> = {
  NOT_STARTED: 'text-[color:var(--color-muted)]',
  IN_PROGRESS: 'text-[color:var(--color-info)]',
  COMPLETED: 'text-[color:var(--color-success)]',
  UNDER_REVIEW: 'text-[color:var(--color-warning)]',
  APPROVED: 'text-[color:var(--color-accent)]',
};

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [sections, setSections] = useState<PlanSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const fetchPlanDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const planResponse = await fetch(`/api/plans/${planId}`);
      if (!planResponse.ok) {
        throw new Error('Plan not found');
      }
      const planData = await planResponse.json();
      setPlan(planData.plan);

      const sectionsResponse = await fetch(`/api/plans/${planId}/sections`);
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData.sections || []);
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="h-screen sparcc-hero-bg flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="w-12 h-12 animate-spin text-[color:var(--color-primary)] mx-auto mb-4" />
          <p className="text-[color:var(--color-muted)]">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="h-screen sparcc-hero-bg flex items-center justify-center">
        <div className="text-center">
          <Cross2Icon className="w-12 h-12 text-[color:var(--color-error)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-2">Plan Not Found</h2>
          <p className="text-[color:var(--color-muted)] mb-6">{error || 'The requested plan could not be found.'}</p>
          <Link
            href="/plans"
            className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SetPageTitle title={plan.title} description={'Plan ' + plan.planCode} />

      <div className="h-screen sparcc-hero-bg flex flex-col overflow-hidden">
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/plans"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Plans
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {/* Edit Plan button - Coming soon
                <Link
                  href={`/plans/${planId}/edit`}
                  className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2"
                >
                  <Pencil1Icon className="w-4 h-4" />
                  Edit Plan
                </Link>
                */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm border border-[color:var(--color-border)] p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                      {plan.title}
                    </h1>
                    <span className={'px-3 py-1 rounded-full text-xs font-semibold border ' + (statusColors[plan.status] || statusColors.DRAFT)}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--color-muted)] mb-4">
                    Plan Code: <span className="font-mono font-medium text-[color:var(--color-foreground)]">{plan.planCode}</span>
                    {' • '}
                    Version: <span className="font-medium text-[color:var(--color-foreground)]">{plan.version}</span>
                  </p>
                  {plan.description && (
                    <p className="text-[color:var(--color-foreground)] leading-relaxed">{plan.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 pt-4 border-t border-[color:var(--color-border)]">
                <div>
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-1">
                    <PersonIcon className="w-4 h-4" />
                    Owner
                  </div>
                  <p className="font-medium text-[color:var(--color-foreground)]">{plan.owner}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    Effective Date
                  </div>
                  <p className="font-medium text-[color:var(--color-foreground)]">{formatDate(plan.effectiveDate)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    Expiration Date
                  </div>
                  <p className="font-medium text-[color:var(--color-foreground)]">{formatDate(plan.expirationDate)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-1">
                    <CheckCircledIcon className="w-4 h-4" />
                    Completion
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[color:var(--color-border)] rounded-full h-2">
                      <div
                        className="bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] h-2 rounded-full transition-all"
                        style={{ width: plan.completionPercentage + '%' }}
                      />
                    </div>
                    <span className="font-medium text-[color:var(--color-foreground)] text-sm">{plan.completionPercentage}%</span>
                  </div>
                  <p className="text-xs text-[color:var(--color-muted)] mt-1">
                    {plan.sectionsCompleted} of {plan.sectionsTotal} sections
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm border border-[color:var(--color-border)] p-6">
              <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                Plan Sections
              </h2>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-[color:var(--color-muted)]">
                  <FileTextIcon className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-muted)]" />
                  <p>No sections found in this plan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-[color:var(--color-border)] rounded-lg p-4 hover:border-[color:var(--color-border)] transition-colors"
                      style={{ marginLeft: (section.level * 20) + 'px' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-[color:var(--color-foreground)]">{section.title}</h3>
                            {section.isRequired && (
                              <span className="px-2 py-0.5 bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] text-xs font-medium rounded">
                                Required
                              </span>
                            )}
                            <span className={'flex items-center gap-1 text-xs font-medium ' + (completionStatusColors[section.completionStatus] || 'text-[color:var(--color-muted)]')}>
                              <CheckCircledIcon className="w-3 h-3" />
                              {section.completionStatus.replace('_', ' ')}
                            </span>
                          </div>
                          {section.description && (
                            <p className="text-sm text-[color:var(--color-muted)] mb-2">{section.description}</p>
                          )}
                          {section.content && section.content.trim() && (
                            <div className="mt-2 p-3 bg-[color:var(--color-surface-alt)] rounded border border-[color:var(--color-border)]">
                              <p className="text-sm text-[color:var(--color-foreground)] whitespace-pre-wrap">{section.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
