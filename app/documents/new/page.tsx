'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentCode: '',
    title: '',
    description: '',
    documentType: 'POLICY',
    category: '',
    tags: '',
    owner: 'Demo User',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sgm/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          status: 'DRAFT',
          version: '1.0.0',
          fileType: 'md',
          createdBy: 'system',
          tenantId: 'demo-tenant-001',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const data = await response.json();
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <Link href="/documents" className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)] text-sm mb-4 inline-block">
            ← Back to Documents
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">Create New Document</h1>
          <p className="text-[color:var(--color-muted)] mt-1">Add a new governance document to your organization</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-lg">
              <p className="text-[color:var(--color-error)] text-sm">{error}</p>
            </div>
          )}

          {/* Document Code */}
          <div className="mb-6">
            <label htmlFor="documentCode" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Document Code *
            </label>
            <input
              id="documentCode"
              name="documentCode"
              type="text"
              placeholder="e.g., POL-001, PROC-001"
              value={formData.documentCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
            <p className="text-xs text-[color:var(--color-muted)] mt-1">Unique identifier for this document</p>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Sales Crediting Policy"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Optional: Brief overview of this document"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
          </div>

          {/* Document Type */}
          <div className="mb-6">
            <label htmlFor="documentType" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Document Type *
            </label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            >
              <option value="FRAMEWORK">Framework</option>
              <option value="POLICY">Policy</option>
              <option value="PROCEDURE">Procedure</option>
              <option value="TEMPLATE">Template</option>
              <option value="CHECKLIST">Checklist</option>
              <option value="GUIDE">Guide</option>
            </select>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="e.g., Compensation, Governance"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="e.g., sales, compensation, required (comma-separated)"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
          </div>

          {/* Owner */}
          <div className="mb-6">
            <label htmlFor="owner" className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
              Owner
            </label>
            <input
              id="owner"
              name="owner"
              type="text"
              value={formData.owner}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] disabled:bg-[color:var(--color-border)]"
            >
              {loading ? 'Creating...' : 'Create Document'}
            </button>
            <Link href="/documents" className="flex-1 px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
