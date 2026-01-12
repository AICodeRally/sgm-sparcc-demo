'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  ClockIcon,
  UploadIcon,
  LockClosedIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import SectionNavigator from './SectionNavigator';
import RichEditor from './RichEditor';
import AgentSuggestionPanel from './AgentSuggestionPanel';
import PlanStatusBadge from './PlanStatusBadge';
import PlanWorkflowActions from './PlanWorkflowActions';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Plan } from '@/lib/contracts/plan.contract';
import type { PlanSection } from '@/lib/contracts/plan-section.contract';
import type { AgentSuggestion } from '@/lib/ai/agents/orchestrator';
import type { ApplicableFramework } from '@/lib/contracts/governance-framework.contract';

interface PlanEditorProps {
  planId: string;
}

export default function PlanEditor({ planId }: PlanEditorProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sections, setSections] = useState<PlanSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [applicableFrameworks, setApplicableFrameworks] = useState<ApplicableFramework[]>([]);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/plans/${planId}`);
      if (!response.ok) throw new Error('Failed to fetch plan');

      const data = await response.json();
      setPlan(data.plan);
      setSections(data.plan.sections || []);

      // Select first section by default
      if (data.plan.sections && data.plan.sections.length > 0) {
        setSelectedSectionId(data.plan.sections[0].id);
      }

      // Fetch applicable governance frameworks
      fetchApplicableFrameworks(data.plan.planType, data.plan.tenantId);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicableFrameworks = async (planType: string, tenantId: string) => {
    try {
      const response = await fetch(
        `/api/governance-framework/applicable?planType=${planType}&tenantId=${tenantId}`
      );
      if (!response.ok) throw new Error('Failed to fetch frameworks');

      const data = await response.json();
      setApplicableFrameworks(data.frameworks || []);
    } catch (error) {
      console.error('Error fetching applicable frameworks:', error);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  const handleContentChange = useCallback(async (sectionId: string, content: string) => {
    // Update local state immediately
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, content } : s)
    );

    // Auto-save after 3 seconds
    setSaving(true);
    try {
      const response = await fetch(`/api/plans/${planId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to save section');

      const data = await response.json();

      // Update completion stats
      if (plan) {
        setPlan({
          ...plan,
          completionPercentage: data.completion?.completionPercentage || plan.completionPercentage,
          sectionsCompleted: data.completion?.sectionsCompleted || plan.sectionsCompleted,
        });
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  }, [planId, plan]);

  const handleMarkComplete = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/plans/${planId}/sections/${sectionId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark section complete');

      const data = await response.json();

      // Update sections
      setSections(prev =>
        prev.map(s => s.id === sectionId ? data.section : s)
      );

      // Update completion stats
      if (plan) {
        setPlan({
          ...plan,
          completionPercentage: data.completion?.completionPercentage || plan.completionPercentage,
          sectionsCompleted: data.completion?.sectionsCompleted || plan.sectionsCompleted,
        });
      }
    } catch (error) {
      console.error('Error marking section complete:', error);
    }
  };

  const handleApplySuggestion = (suggestion: AgentSuggestion) => {
    if (!selectedSection || !suggestion.suggestedContent) return;

    // Append suggested content to current content
    const currentContent = selectedSection.content || '';
    const newContent = currentContent
      ? `${currentContent}\n\n${suggestion.suggestedContent}`
      : suggestion.suggestedContent;

    handleContentChange(selectedSection.id, newContent);
  };

  const handleWorkflowActionComplete = (updatedPlan: Plan) => {
    setPlan(updatedPlan);
    setShowWorkflowModal(false);
    // Refresh plan data
    fetchPlan();
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center sparcc-hero-bg">
        <LoadingSpinner size="lg" text="Loading plan..." />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-screen flex flex-col items-center justify-center sparcc-hero-bg">
        <ExclamationTriangleIcon className="h-16 w-16 text-[color:var(--color-error)] mb-4" />
        <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">Plan Not Found</h2>
        <p className="text-[color:var(--color-muted)] mb-6">The plan you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/plans"
          className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all"
        >
          Back to Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col sparcc-hero-bg">
      {/* Header */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/plans"
              className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                {plan.title}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-[color:var(--color-muted)]">{plan.planCode}</p>
                <PlanStatusBadge status={plan.status} size="sm" />
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-[color:var(--color-border)] rounded-full h-2">
                    <div
                      className="bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] h-2 rounded-full transition-all"
                      style={{ width: `${plan.completionPercentage || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-[color:var(--color-muted)]">
                    {plan.completionPercentage || 0}%
                  </span>
                </div>
                <span className="text-sm text-[color:var(--color-muted)]">
                  {plan.sectionsCompleted || 0} / {plan.sectionsTotal || 0} sections
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
                <ClockIcon className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
            {!saving && lastSaved && (
              <div className="text-sm text-[color:var(--color-muted)]">
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => setShowWorkflowModal(true)}
              aria-label="Open workflow actions dialog"
              className="px-4 py-2 border border-[color:var(--color-info-border)] text-[color:var(--color-primary)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors flex items-center gap-2"
            >
              <UploadIcon className="h-5 w-5" aria-hidden="true" />
              Workflow Actions
            </button>
            <button
              onClick={() => setShowStandardsModal(true)}
              aria-label={`View applicable governance standards (${applicableFrameworks.filter(f => f.mandatoryCompliance).length} mandatory)`}
              className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-primary)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors flex items-center gap-2"
            >
              <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
              View Applicable Standards
              {applicableFrameworks.filter(f => f.mandatoryCompliance).length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] rounded-full font-semibold" aria-label="Mandatory frameworks count">
                  {applicableFrameworks.filter(f => f.mandatoryCompliance).length} Mandatory
                </span>
              )}
            </button>
            <button
              aria-label="Preview plan document"
              className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors"
            >
              Preview
            </button>
            <button
              aria-label="Submit plan for review"
              className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
            >
              <UploadIcon className="h-5 w-5" aria-hidden="true" />
              Submit for Review
            </button>
          </div>
        </div>
      </div>

      {/* Three-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Section Navigator */}
        <div className="w-80 border-r border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
          <SectionNavigator
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSectionSelect={handleSectionSelect}
            planCompletion={plan.completionPercentage || 0}
          />
        </div>

        {/* Center Pane: Content Editor */}
        <div className="flex-1 overflow-y-auto bg-[color:var(--surface-glass)]">
          {selectedSection ? (
            <RichEditor
              section={selectedSection}
              onContentChange={(content) => handleContentChange(selectedSection.id, content)}
              onMarkComplete={() => handleMarkComplete(selectedSection.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[color:var(--color-muted)]">
                <p>Select a section to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: AI Suggestions */}
        <div className="w-96 border-l border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
          {plan && (
            <AgentSuggestionPanel
              plan={plan}
              section={selectedSection || null}
              content={selectedSection?.content || ''}
              onApplySuggestion={handleApplySuggestion}
            />
          )}
        </div>
      </div>

      {/* Applicable Standards Modal */}
      {showStandardsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[color:var(--color-border)] flex items-center justify-between bg-[color:var(--color-surface-alt)]">
              <div className="flex items-center gap-3">
                <LockClosedIcon className="h-6 w-6 text-[color:var(--color-primary)]" />
                <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">
                  Applicable Governance Standards
                </h2>
              </div>
              <button
                onClick={() => setShowStandardsModal(false)}
                className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
              >
                <Cross2Icon className="h-5 w-5 text-[color:var(--color-muted)]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {applicableFrameworks.length === 0 ? (
                <div className="text-center py-12 text-[color:var(--color-muted)]">
                  <LockClosedIcon className="h-16 w-16 text-[color:var(--color-muted)] mx-auto mb-4" />
                  <p>No governance frameworks applicable to this plan type</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded-lg p-4">
                    <p className="text-sm text-[color:var(--color-foreground)]">
                      <strong>{applicableFrameworks.length}</strong> governance framework(s) apply to this plan:{' '}
                      <strong className="text-[color:var(--color-error)]">
                        {applicableFrameworks.filter(f => f.mandatoryCompliance).length} mandatory
                      </strong>
                      {' '}and{' '}
                      <strong className="text-[color:var(--color-warning)]">
                        {applicableFrameworks.filter(f => !f.mandatoryCompliance).length} recommended
                      </strong>
                    </p>
                  </div>

                  {/* Framework Cards */}
                  {applicableFrameworks.map((framework) => (
                    <div
                      key={framework.frameworkCode}
                      className={`border-2 rounded-lg p-5 ${
                        framework.mandatoryCompliance
                          ? 'border-[color:var(--color-error-border)] bg-[color:var(--color-error-bg)]'
                          : 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-bg)]'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-[color:var(--color-primary)]">
                              {framework.frameworkCode}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                framework.mandatoryCompliance
                                  ? 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]'
                                  : 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]'
                              }`}
                            >
                              {framework.mandatoryCompliance ? 'MANDATORY' : 'RECOMMENDED'}
                            </span>
                          </div>
                          <h3 className="font-bold text-[color:var(--color-foreground)]">{framework.title}</h3>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-3">
                        <span className="text-sm text-[color:var(--color-muted)]">
                          Category: <strong>{framework.category.replace('_', ' ')}</strong>
                        </span>
                      </div>

                      {/* Content Preview */}
                      <div className="bg-[color:var(--surface-glass)] rounded p-3 mb-3">
                        <p className="text-sm text-[color:var(--color-foreground)] line-clamp-4">
                          {framework.content}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a
                          href={`/governance-framework`}
                          target="_blank"
                          className="text-sm text-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] font-medium"
                        >
                          View Full Framework →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] flex justify-end">
              <button
                onClick={() => setShowStandardsModal(false)}
                className="px-6 py-2 bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Actions Modal */}
      {showWorkflowModal && plan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[color:var(--color-border)] flex items-center justify-between bg-[color:var(--color-surface-alt)]">
              <div className="flex items-center gap-3">
                <UploadIcon className="h-6 w-6 text-[color:var(--color-info)]" />
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">
                    Plan Workflow
                  </h2>
                  <p className="text-sm text-[color:var(--color-muted)] mt-0.5">
                    Current Status: {plan.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
              >
                <Cross2Icon className="h-5 w-5 text-[color:var(--color-muted)]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">Plan Information</h3>
                <div className="bg-[color:var(--color-surface-alt)] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[color:var(--color-muted)]">Plan Code:</span>
                    <span className="text-sm font-medium text-[color:var(--color-foreground)]">{plan.planCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[color:var(--color-muted)]">Status:</span>
                    <PlanStatusBadge status={plan.status} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[color:var(--color-muted)]">Completion:</span>
                    <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                      {plan.completionPercentage}% ({plan.sectionsCompleted}/{plan.sectionsTotal} sections)
                    </span>
                  </div>
                  {plan.approvalWorkflowId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[color:var(--color-muted)]">Workflow ID:</span>
                      <span className="text-sm font-medium text-[color:var(--color-foreground)]">{plan.approvalWorkflowId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3">Available Actions</h3>
                <PlanWorkflowActions
                  plan={plan}
                  onActionComplete={handleWorkflowActionComplete}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] flex justify-end">
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-6 py-2 bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
