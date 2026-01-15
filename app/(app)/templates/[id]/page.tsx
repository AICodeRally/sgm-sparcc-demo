'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cross2Icon,
  CopyIcon,
} from '@radix-ui/react-icons';
import type { PlanTemplate, UpdatePlanTemplate } from '@/lib/contracts/plan-template.contract';
import type { TemplateSection } from '@/lib/contracts/template-section.contract';
import { syntheticPlanTemplates, syntheticTemplateSections } from '@/lib/data/synthetic/plan-templates.data';

interface SectionData extends TemplateSection {}

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Load template from synthetic data
  const initialTemplate = useMemo(() => {
    return syntheticPlanTemplates.find(t => t.id === id) || null;
  }, [id]);

  const initialSections = useMemo(() => {
    return syntheticTemplateSections.filter(s => s.templateId === id);
  }, [id]);

  const [template, setTemplate] = useState<PlanTemplate | null>(initialTemplate);
  const [sections, setSections] = useState<SectionData[]>(initialSections);

  // Update state when ID changes
  useEffect(() => {
    setTemplate(initialTemplate);
    setSections(initialSections);
  }, [initialTemplate, initialSections]);

  const addSection = () => {
    if (!template) return;

    const newSection: SectionData = {
      id: `section-new-${Date.now()}`,
      templateId: template.id,
      sectionKey: `section-${sections.length + 1}`,
      title: `New Section ${sections.length + 1}`,
      description: '',
      orderIndex: sections.length,
      level: 0,
      isRequired: false,
      isRepeatable: false,
      contentTemplate: '',
      fieldDefinitions: [],
      aiAgentRoles: [],
      metadata: {},
    };

    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSection = (sectionId: string, updates: Partial<SectionData>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    newSections.forEach((s, i) => s.orderIndex = i);
    setSections(newSections);
    // TODO: Persist order changes
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    newSections.forEach((s, i) => s.orderIndex = i);
    setSections(newSections);
    // TODO: Persist order changes
  };

  const addTag = () => {
    if (!template || !tagInput.trim() || template.tags?.includes(tagInput.trim())) return;

    const updatedTags = [...(template.tags || []), tagInput.trim()];
    setTemplate({ ...template, tags: updatedTags });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      tags: template.tags?.filter(t => t !== tag),
    });
  };

  const handleSave = () => {
    // In demo mode, changes are in-memory only
    alert('Changes saved (demo mode - changes are in-memory only)');
  };

  const handleClone = () => {
    alert('Clone functionality coming soon!');
  };

  if (!template) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-[color:var(--color-error)]">Template not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col sparcc-hero-bg">
      {/* Header */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/templates"
              className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                {template.name}
              </h1>
              <p className="text-[color:var(--color-muted)] mt-1">
                {template.code} • {template.isSystemTemplate ? 'System Template' : 'Custom Template'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] transition-colors flex items-center gap-2"
            >
              <CopyIcon className="h-5 w-5" />
              Clone
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Template Info */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-4">
              Template Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  disabled={template.isSystemTemplate}
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent disabled:bg-[color:var(--color-surface-alt)] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Template Code
                </label>
                <input
                  type="text"
                  value={template.code}
                  disabled
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface-alt)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Plan Type
                </label>
                <input
                  type="text"
                  value={template.planType}
                  disabled
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface-alt)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={template.category || ''}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  disabled={template.isSystemTemplate}
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent disabled:bg-[color:var(--color-surface-alt)] disabled:cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Description
                </label>
                <textarea
                  value={template.description || ''}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  disabled={template.isSystemTemplate}
                  rows={3}
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent disabled:bg-[color:var(--color-surface-alt)] disabled:cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {template.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      {!template.isSystemTemplate && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-[color:var(--color-accent-bg)] rounded-full p-0.5"
                        >
                          <Cross2Icon className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {!template.isSystemTemplate && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Status
                </label>
                <select
                  value={template.status}
                  onChange={(e) => setTemplate({ ...template, status: e.target.value as any })}
                  disabled={template.isSystemTemplate}
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent disabled:bg-[color:var(--color-surface-alt)] disabled:cursor-not-allowed"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DEPRECATED">Deprecated</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Usage Count
                </label>
                <input
                  type="text"
                  value={template.usageCount || 0}
                  disabled
                  className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface-alt)] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                Template Sections ({sections.length})
              </h2>
              {!template.isSystemTemplate && (
                <button
                  onClick={addSection}
                  className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Section
                </button>
              )}
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 text-[color:var(--color-muted)]">
                <p className="mb-4">No sections in this template</p>
                {!template.isSystemTemplate && (
                  <button
                    onClick={addSection}
                    className="px-6 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors"
                  >
                    Add First Section
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="border border-[color:var(--color-border)] rounded-lg p-4 bg-[color:var(--color-surface)]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Order Controls */}
                      {!template.isSystemTemplate && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveSectionUp(index)}
                            disabled={index === 0}
                            className="p-1 hover:bg-[color:var(--color-surface-alt)] rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUpIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
                          </button>
                          <span className="text-sm text-[color:var(--color-muted)] text-center">
                            {index + 1}
                          </span>
                          <button
                            onClick={() => moveSectionDown(index)}
                            disabled={index === sections.length - 1}
                            className="p-1 hover:bg-[color:var(--color-surface-alt)] rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDownIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
                          </button>
                        </div>
                      )}

                      {/* Section Info */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              disabled={template.isSystemTemplate}
                              className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent disabled:bg-[color:var(--color-surface-alt)] disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={section.sectionKey}
                              disabled
                              className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface-alt)] cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            value={section.description || ''}
                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                            disabled={template.isSystemTemplate}
                            rows={2}
                            className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent disabled:bg-[color:var(--color-surface-alt)] disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-[color:var(--color-foreground)]">
                            <input
                              type="checkbox"
                              checked={section.isRequired}
                              onChange={(e) => updateSection(section.id, { isRequired: e.target.checked })}
                              disabled={template.isSystemTemplate}
                              className="rounded border-[color:var(--color-border)] text-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)] disabled:cursor-not-allowed"
                            />
                            Required
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[color:var(--color-foreground)]">
                            <input
                              type="checkbox"
                              checked={section.isRepeatable}
                              onChange={(e) => updateSection(section.id, { isRepeatable: e.target.checked })}
                              disabled={template.isSystemTemplate}
                              className="rounded border-[color:var(--color-border)] text-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)] disabled:cursor-not-allowed"
                            />
                            Repeatable
                          </label>
                        </div>
                      </div>

                      {/* Remove Button */}
                      {!template.isSystemTemplate && (
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-2 hover:bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
