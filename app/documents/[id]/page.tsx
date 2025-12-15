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
      DRAFT: 'bg-gray-100 text-gray-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || 'Document not found'}</p>
        <Link href="/sgm/documents" className="text-blue-600 hover:text-blue-700">
          Back to Documents
        </Link>
      </div>
    );
  }

  // Extract markdown content from metadata
  const markdownContent = document.metadata?.markdown_content || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/sgm/documents" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← Back to Documents
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
              <p className="text-gray-600 mt-1">{document.documentCode}</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Edit
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              {document.description && (
                <p className="text-gray-600 mb-6 italic">{document.description}</p>
              )}

              {markdownContent ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded">
                    {markdownContent.slice(0, 500)}...
                  </div>
                  <p className="text-center text-gray-500 mt-4">
                    <em>Preview truncated. Download full document to see complete content.</em>
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No content available for preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Metadata */}
          <div className="space-y-6">
            {/* Status & Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{document.documentType}</p>
                </div>
                {document.category && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{document.category}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Version</label>
                  <p className="mt-1 text-sm text-gray-900">{document.version}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Owner</label>
                  <p className="mt-1 text-sm text-gray-900">{document.owner}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(document.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                {document.effectiveDate && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Effective Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(document.effectiveDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {document.expirationDate && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Expiration Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(document.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  View History
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Submit for Review
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
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
