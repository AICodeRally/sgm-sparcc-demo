'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cross2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import type { PlanTemplate } from '@/lib/contracts/plan-template.contract';
import type { CreatePlanFromTemplate } from '@/lib/contracts/plan.contract';

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const STEPS: WizardStep[] = [
  {
    id: 'template',
    title: 'Choose Template',
    description: 'Select a plan template to get started',
  },
  {
    id: 'basics',
    title: 'Plan Basics',
    description: 'Enter basic information about your plan',
  },
  {
    id: 'sections',
    title: 'Complete Sections',
    description: 'Fill in the required sections',
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your plan before creating',
  },
];

interface PlanCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanCreationWizard({ isOpen, onClose }: PlanCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [planData, setPlanData] = useState<Partial<CreatePlanFromTemplate>>({
    tenantId: 'demo-tenant-001',
    owner: 'current-user',
    createdBy: 'current-user',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plan-templates?status=ACTIVE');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectTemplate = (template: PlanTemplate) => {
    setSelectedTemplate(template);
    setPlanData({
      ...planData,
      templateId: template.id,
    });
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !planData.title) return;

    setSaving(true);
    try {
      const response = await fetch('/api/plans/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      if (!response.ok) throw new Error('Failed to create plan');

      const data = await response.json();
      router.push(`/plans/${data.plan.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Template selection
        return !!selectedTemplate;
      case 1: // Basics
        return !!planData.title && !!planData.description;
      case 2: // Sections
        return true; // Can skip sections for now
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[color:var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[color:var(--color-border)]">
            <div>
              <h2 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                Create New Plan
              </h2>
              <p className="text-[color:var(--color-muted)] mt-1">
                {STEPS[currentStep].description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
            >
              <Cross2Icon className="h-6 w-6 text-[color:var(--color-muted)]" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 border-b border-[color:var(--color-border)]">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        index < currentStep
                          ? 'bg-transparent text-white'
                          : index === currentStep
                          ? 'bg-[color:var(--color-primary)] text-white'
                          : 'bg-[color:var(--color-border)] text-[color:var(--color-muted)]'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckIcon className="h-6 w-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-medium ${
                          index === currentStep
                            ? 'text-[color:var(--color-primary)]'
                            : index < currentStep
                            ? 'text-[color:var(--color-success)]'
                            : 'text-[color:var(--color-muted)]'
                        }`}
                      >
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${
                        index < currentStep ? 'bg-transparent' : 'bg-[color:var(--color-border)]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {currentStep === 0 && (
              <TemplateSelectionStep
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelect={handleSelectTemplate}
                loading={loading}
              />
            )}

            {currentStep === 1 && (
              <BasicsStep
                planData={planData}
                onChange={setPlanData}
                template={selectedTemplate}
              />
            )}

            {currentStep === 2 && (
              <SectionsStep
                template={selectedTemplate}
                planData={planData}
              />
            )}

            {currentStep === 3 && (
              <ReviewStep
                planData={planData}
                template={selectedTemplate}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-6 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Back
            </button>

            <div className="text-sm text-[color:var(--color-muted)]">
              Step {currentStep + 1} of {STEPS.length}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                Next
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed() || saving}
                className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? 'Creating...' : 'Create Plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components

function TemplateSelectionStep({
  templates,
  selectedTemplate,
  onSelect,
  loading,
}: {
  templates: PlanTemplate[];
  selectedTemplate: PlanTemplate | null;
  onSelect: (template: PlanTemplate) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[color:var(--color-muted)]">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
        Select a Template
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`text-left p-6 rounded-lg border-2 transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)]'
                : 'border-[color:var(--color-border)] hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)]/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-[color:var(--color-foreground)]">{template.name}</h4>
              {selectedTemplate?.id === template.id && (
                <CheckIcon className="h-5 w-5 text-[color:var(--color-primary)]" />
              )}
            </div>
            <p className="text-sm text-[color:var(--color-muted)] mb-2">
              {template.description || 'No description'}
            </p>
            <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
              <span className="px-2 py-1 bg-[color:var(--color-surface-alt)] rounded">
                {template.planType.replace('_', ' ')}
              </span>
              {template.isSystemTemplate && (
                <span className="px-2 py-1 bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)] rounded">
                  System
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BasicsStep({
  planData,
  onChange,
  template,
}: {
  planData: Partial<CreatePlanFromTemplate>;
  onChange: (data: Partial<CreatePlanFromTemplate>) => void;
  template: PlanTemplate | null;
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
        Plan Information
      </h3>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
            Plan Title *
          </label>
          <input
            type="text"
            value={planData.title || ''}
            onChange={(e) => onChange({ ...planData, title: e.target.value })}
            placeholder="FY2026 Sales Compensation Plan"
            className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
            Description *
          </label>
          <textarea
            value={planData.description || ''}
            onChange={(e) => onChange({ ...planData, description: e.target.value })}
            placeholder="Describe the purpose and scope of this plan..."
            rows={4}
            className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
          />
        </div>

        <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-[color:var(--color-foreground)] mb-1">
                Using Template: {template?.name}
              </h4>
              <p className="text-sm text-[color:var(--color-muted)]">
                {template?.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionsStep({
  template,
  planData,
}: {
  template: PlanTemplate | null;
  planData: Partial<CreatePlanFromTemplate>;
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
        Template Sections
      </h3>
      <p className="text-[color:var(--color-muted)] mb-6">
        The following sections will be included in your plan. You can fill them out after creation.
      </p>
      <div className="bg-[color:var(--color-surface-alt)] rounded-lg p-6">
        <p className="text-[color:var(--color-muted)] text-center">
          Section preview will be available after plan creation
        </p>
      </div>
    </div>
  );
}

function ReviewStep({
  planData,
  template,
}: {
  planData: Partial<CreatePlanFromTemplate>;
  template: PlanTemplate | null;
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
        Review Your Plan
      </h3>
      <div className="space-y-6 max-w-2xl">
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg p-6">
          <h4 className="font-semibold text-[color:var(--color-foreground)] mb-4">Plan Details</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-[color:var(--color-muted)]">Title</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">{planData.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[color:var(--color-muted)]">Description</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">{planData.description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[color:var(--color-muted)]">Template</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">{template?.name}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-info-border)] rounded-lg p-4">
          <p className="text-sm text-[color:var(--color-info)]">
            <strong>Next steps:</strong> After creating this plan, you'll be able to fill out all sections, collaborate with your team, and submit for approval.
          </p>
        </div>
      </div>
    </div>
  );
}
