'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckIcon,
  Cross2Icon,
  LockClosedIcon,
  EyeOpenIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  STANDARD_PLAN_TEMPLATE,
  getSectionsByCategory,
  type TemplateSection,
} from '@/lib/data/plan-template-library.data';

type CategoryType = 'PLAN_OVERVIEW' | 'PLAN_MEASURES' | 'PAYOUTS' | 'PAYOUT_EXAMPLE' | 'TERMS_CONDITIONS';

const CATEGORIES: { id: CategoryType; name: string; description: string }[] = [
  {
    id: 'PLAN_OVERVIEW',
    name: '1. Plan Overview',
    description: 'Introduction and summary of compensation plan',
  },
  {
    id: 'PLAN_MEASURES',
    name: '2. Plan Measures',
    description: 'Compensation components (quotas, bonuses, SPIFs)',
  },
  {
    id: 'PAYOUTS',
    name: '3. Payouts',
    description: 'Payment timing and schedule',
  },
  {
    id: 'PAYOUT_EXAMPLE',
    name: '4. Payout Example',
    description: 'Worked calculation examples',
  },
  {
    id: 'TERMS_CONDITIONS',
    name: '5. Terms & Conditions',
    description: 'Governance policies and plan administration',
  },
];

export default function TemplateBuilderPage() {
  const router = useRouter();

  // Track which optional sections are selected
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize with all required sections selected
  useMemo(() => {
    const requiredSections = STANDARD_PLAN_TEMPLATE.filter((s) => s.isRequired).map((s) => s.id);
    setSelectedSections(new Set(requiredSections));
  }, []);

  // Keyboard shortcut: Cmd+Enter to create template
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (templateName && !isCreating && !success) {
          handleCreateTemplate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [templateName, isCreating, success]);

  const toggleSection = (sectionId: string, isRequired: boolean) => {
    if (isRequired) return; // Can't deselect required sections

    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelectedSections(newSelected);
  };

  const getSelectedSections = () => {
    return STANDARD_PLAN_TEMPLATE.filter((s) => selectedSections.has(s.id)).sort(
      (a, b) => a.order - b.order
    );
  };

  const stats = useMemo(() => {
    const selected = getSelectedSections();
    const total = STANDARD_PLAN_TEMPLATE.length;
    const required = STANDARD_PLAN_TEMPLATE.filter((s) => s.isRequired).length;
    const optional = STANDARD_PLAN_TEMPLATE.filter((s) => s.isSelectable).length;
    const selectedOptional = selected.filter((s) => s.isSelectable).length;

    return {
      total,
      required,
      optional,
      selected: selected.length,
      selectedOptional,
    };
  }, [selectedSections]);

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/plan-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant-001',
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          planType: 'COMPENSATION_PLAN',
          category: 'Custom',
          tags: ['Custom', 'User Created'],
          version: '1.0.0',
          status: 'DRAFT',
          source: 'USER_CREATED',
          createdBy: 'current-user', // TODO: Get from auth session
          sections: getSelectedSections().map((s) => ({
            sectionKey: s.id,
            title: s.title,
            description: s.description,
            orderIndex: s.order,
            level: 0,
            isRequired: s.isRequired,
            contentTemplate: s.defaultContent,
            aiAgentRoles: [],
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      const data = await response.json();
      console.log('Template created:', data.template);

      // Show success state briefly
      setSuccess(true);

      // Redirect to templates list after 1.5 seconds
      setTimeout(() => {
        router.push('/templates');
      }, 1500);
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to create template');
      setIsCreating(false);
    }
  };

  return (
    <>
      <SetPageTitle
        title="Template Builder"
        description="Create custom compensation plan templates"
      />

      <div className="h-screen sparcc-hero-bg flex flex-col">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/templates"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Templates
                </Link>
                <div className="h-6 w-px bg-[color:var(--color-accent-border)]"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                    Compensation Plan Template Builder
                  </h1>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    Select sections to include in your custom template
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-[color:var(--color-muted)]">
                    <span className="font-bold text-[color:var(--color-primary)]">{stats.selected}</span> of{' '}
                    {stats.total} sections selected
                  </div>
                  <div className="text-xs text-[color:var(--color-muted)]">
                    {stats.required} required • {stats.selectedOptional} of {stats.optional} optional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-[1800px] mx-auto px-6 py-6 h-full">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Left Pane: Section Selection */}
              <div className="bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)] shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
                  <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-4">Template Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Template Name <span className="text-[color:var(--color-error)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Sales Rep - Medical Division"
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Description
                      </label>
                      <textarea
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Brief description of this template's purpose..."
                        rows={2}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-xl font-bold text-[color:var(--color-foreground)] mb-4">Select Sections</h2>

                  {CATEGORIES.map((category) => {
                    const sections = getSectionsByCategory(category.id);
                    const selectedInCategory = sections.filter((s) =>
                      selectedSections.has(s.id)
                    ).length;

                    return (
                      <div key={category.id} className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-[color:var(--color-foreground)]">{category.name}</h3>
                            <p className="text-xs text-[color:var(--color-muted)]">{category.description}</p>
                          </div>
                          <span className="text-sm text-[color:var(--color-muted)]">
                            {selectedInCategory} / {sections.length}
                          </span>
                        </div>

                        <div className="space-y-2 ml-4">
                          {sections.map((section) => {
                            const isSelected = selectedSections.has(section.id);
                            const isRequired = section.isRequired;
                            const isSelectable = section.isSelectable;

                            return (
                              <div
                                key={section.id}
                                className={`border rounded-lg p-3 transition-all ${
                                  isSelected
                                    ? 'border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]'
                                    : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)]'
                                } ${
                                  !isRequired && isSelectable
                                    ? 'cursor-pointer hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)]/50'
                                    : ''
                                }`}
                                onClick={() => toggleSection(section.id, isRequired)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-none mt-0.5">
                                    {isRequired ? (
                                      <div className="w-5 h-5 rounded bg-[color:var(--color-primary)] flex items-center justify-center">
                                        <LockClosedIcon className="w-3 h-3 text-white" />
                                      </div>
                                    ) : (
                                      <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                          isSelected
                                            ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]'
                                            : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)]'
                                        }`}
                                      >
                                        {isSelected && (
                                          <CheckIcon className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-mono text-[color:var(--color-muted)]">
                                        {section.sectionNumber}
                                      </span>
                                      <h4 className="text-sm font-semibold text-[color:var(--color-foreground)]">
                                        {section.title}
                                      </h4>
                                    </div>
                                    <p className="text-xs text-[color:var(--color-muted)] mt-1">
                                      {section.description}
                                    </p>
                                    {isRequired && (
                                      <span className="inline-block mt-1 px-2 py-0.5 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] text-xs font-semibold rounded">
                                        REQUIRED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Live Preview */}
              <div className="bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)] shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOpenIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                    <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Template Preview</h2>
                  </div>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    This is how your template structure will look
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* Template Header */}
                  <div className="mb-8 p-6 bg-[color:var(--color-surface-alt)] rounded-lg border-2 border-[color:var(--color-border)]">
                    <h3 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
                      {templateName || '[Template Name]'}
                    </h3>
                    <p className="text-sm text-[color:var(--color-muted)]">
                      {templateDescription || '[Template description will appear here]'}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-[color:var(--color-primary)]">{stats.selected}</span>{' '}
                        <span className="text-[color:var(--color-muted)]">Total Sections</span>
                      </div>
                      <div className="h-4 w-px bg-[color:var(--color-border)]"></div>
                      <div>
                        <span className="font-semibold text-[color:var(--color-success)]">{stats.required}</span>{' '}
                        <span className="text-[color:var(--color-muted)]">Required</span>
                      </div>
                      <div className="h-4 w-px bg-[color:var(--color-border)]"></div>
                      <div>
                        <span className="font-semibold text-[color:var(--color-info)]">
                          {stats.selectedOptional}
                        </span>{' '}
                        <span className="text-[color:var(--color-muted)]">Optional</span>
                      </div>
                    </div>
                  </div>

                  {/* Table of Contents */}
                  <div className="bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)] p-6">
                    <h3 className="text-lg font-bold text-[color:var(--color-foreground)] mb-4">Table of Contents</h3>
                    <div className="space-y-1">
                      {CATEGORIES.map((category) => {
                        const sectionsInCategory = getSelectedSections().filter(
                          (s) => s.category === category.id
                        );

                        if (sectionsInCategory.length === 0) return null;

                        return (
                          <div key={category.id} className="mb-4">
                            <div className="font-bold text-sm text-[color:var(--color-primary)] mb-2 pb-1 border-b border-[color:var(--color-border)]">
                              {category.name}
                            </div>
                            {sectionsInCategory.map((section) => (
                              <div
                                key={section.id}
                                className="flex items-center gap-3 py-1.5 px-2 hover:bg-[color:var(--color-surface)] rounded transition-colors"
                              >
                                <span className="text-xs font-mono text-[color:var(--color-muted)] w-12">
                                  {section.sectionNumber}
                                </span>
                                <span className="text-sm text-[color:var(--color-foreground)] flex-1">
                                  {section.title}
                                </span>
                                {section.isRequired && (
                                  <LockClosedIcon className="w-3 h-3 text-[color:var(--color-accent)]" />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Empty State */}
                  {stats.selected === 0 && (
                    <div className="text-center py-12">
                      <Cross2Icon className="w-12 h-12 text-[color:var(--color-muted)] mx-auto mb-3" />
                      <p className="text-[color:var(--color-muted)]">No sections selected yet</p>
                      <p className="text-sm text-[color:var(--color-muted)]">
                        Select sections from the left panel to preview your template
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)]">
                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-lg">
                      <p className="text-sm text-[color:var(--color-error)] font-medium">{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="mb-4 p-3 bg-[color:var(--color-success-bg)] border border-[color:var(--color-success-border)] rounded-lg flex items-center gap-2">
                      <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />
                      <p className="text-sm text-[color:var(--color-success)] font-medium">
                        Template created successfully! Redirecting...
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[color:var(--color-muted)]">
                      <span className="font-semibold">{stats.selected} sections</span> ready to
                      use
                      <span className="ml-3 text-xs text-[color:var(--color-muted)]">
                        • Press <kbd className="px-1 py-0.5 bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded text-xs">⌘</kbd> + <kbd className="px-1 py-0.5 bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded text-xs">Enter</kbd> to create
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={isCreating || success}
                        className="px-6 py-2 border-2 border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save as Draft
                      </button>
                      <button
                        onClick={handleCreateTemplate}
                        disabled={!templateName || isCreating || success}
                        className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : success ? (
                          <>
                            <CheckCircledIcon className="w-5 h-5" />
                            Created!
                          </>
                        ) : (
                          'Create Template'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
