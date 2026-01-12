'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: string;
  documentCode: string;
  title: string;
  description?: string;
  documentType: string;
  category?: string;
  status: string;
  version: string;
  createdAt: string;
  lastUpdated: string;
  effectiveDate?: string;
  expirationDate?: string;
  owner: string;
  createdBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/sgm/documents/${documentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data.document);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]',
      UNDER_REVIEW: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
      PENDING_APPROVAL: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
      APPROVED: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)]',
      ACTIVE: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
      ARCHIVED: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]',
    };
    return colors[status] || 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-alt)] flex items-center justify-center">
        <p className="text-[color:var(--color-muted)]">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-alt)] flex flex-col items-center justify-center">
        <p className="text-[color:var(--color-error)] mb-4">{error || 'Document not found'}</p>
        <Link href="/documents" className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)]">
          Back to Documents
        </Link>
      </div>
    );
  }

  // Extract markdown content from metadata
  const markdownContent = document.metadata?.markdown_content || '';

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/documents" className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)] text-sm mb-4 inline-block">
            ← Back to Documents
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">{document.title}</h1>
              <p className="text-[color:var(--color-muted)] mt-1">{document.documentCode}</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)]">
                Edit
              </button>
              <button className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)]">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2">
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
              {document.description && (
                <p className="text-[color:var(--color-muted)] mb-6 italic">{document.description}</p>
              )}

              {markdownContent ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-sm text-[color:var(--color-foreground)] bg-[color:var(--color-surface-alt)] p-4 rounded">
                    {markdownContent.slice(0, 500)}...
                  </div>
                  <p className="text-center text-[color:var(--color-muted)] mt-4">
                    <em>Preview truncated. Download full document to see complete content.</em>
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[color:var(--color-muted)]">No content available for preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Metadata */}
          <div className="space-y-6">
            {/* Status & Metadata */}
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Type</label>
                  <p className="mt-1 text-sm text-[color:var(--color-foreground)]">{document.documentType}</p>
                </div>
                {document.category && (
                  <div>
                    <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Category</label>
                    <p className="mt-1 text-sm text-[color:var(--color-foreground)]">{document.category}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Version</label>
                  <p className="mt-1 text-sm text-[color:var(--color-foreground)]">{document.version}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Owner</label>
                  <p className="mt-1 text-sm text-[color:var(--color-foreground)]">{document.owner}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Lifecycle</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Created</label>
                  <p className="mt-1 text-sm text-[color:var(--color-foreground)]">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Last Updated</label>
                  <p className="mt-1 text-sm text-[color:var(--color-foreground)]">
                    {new Date(document.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                {document.effectiveDate && (
                  <div>
                    <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Effective Date</label>
                    <p className="mt-1 text-sm text-[color:var(--color-foreground)]">
                      {new Date(document.effectiveDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {document.expirationDate && (
                  <div>
                    <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Expiration Date</label>
                    <p className="mt-1 text-sm text-[color:var(--color-foreground)]">
                      {new Date(document.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
                <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm">
                  View History
                </button>
                <button className="w-full px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm">
                  Submit for Review
                </button>
                <button className="w-full px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)] text-sm">
                  Create New Version
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
