'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: string;
  documentCode: string;
  title: string;
  version: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  createdBy: string;
  updatedBy?: string;
}

export default function VersionHistoryPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [versions, setVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/sgm/documents/${documentId}/versions`);
        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }
        const data = await response.json();
        setVersions(data.versions || []);
        if (data.versions && data.versions.length > 0) {
          setSelectedVersion(data.versions[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchVersions();
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

  const selectedDoc = versions.find(v => v.id === selectedVersion);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-alt)] flex items-center justify-center">
        <p className="text-[color:var(--color-muted)]">Loading version history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href={`/documents/${documentId}`} className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)] text-sm mb-4 inline-block">
            ← Back to Document
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">Version History</h1>
          <p className="text-[color:var(--color-muted)] mt-1">All versions of {versions[0]?.title}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-6">
          {/* Version List */}
          <div className="col-span-1">
            <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] overflow-hidden">
              <div className="bg-[color:var(--color-surface-alt)] px-6 py-4 border-b border-[color:var(--color-border)]">
                <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Versions ({versions.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={`w-full text-left px-6 py-4 hover:bg-[color:var(--color-surface-alt)] transition-colors ${
                      selectedVersion === version.id ? 'bg-[color:var(--color-surface-alt)] border-l-4 border-[color:var(--color-info)]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-[color:var(--color-foreground)]">v{version.version}</p>
                        <p className="text-xs text-[color:var(--color-muted)] mt-1">
                          {new Date(version.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="text-xs font-medium text-[color:var(--color-info)] bg-[color:var(--color-surface-alt)] px-2 py-1 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                    <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded ${getStatusColor(version.status)}`}>
                      {version.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Version Details */}
          <div className="col-span-2">
            {selectedDoc ? (
              <div className="space-y-6">
                {/* Version Info */}
                <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Version</label>
                      <p className="mt-1 text-2xl font-bold text-[color:var(--color-foreground)]">v{selectedDoc.version}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Status</label>
                      <p className="mt-1">
                        <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(selectedDoc.status)}`}>
                          {selectedDoc.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Created</label>
                      <p className="mt-1 text-[color:var(--color-foreground)]">{new Date(selectedDoc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Last Updated</label>
                      <p className="mt-1 text-[color:var(--color-foreground)]">{new Date(selectedDoc.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Created By</label>
                      <p className="mt-1 text-[color:var(--color-foreground)]">{selectedDoc.createdBy}</p>
                    </div>
                    {selectedDoc.updatedBy && (
                      <div>
                        <label className="text-xs font-medium text-[color:var(--color-muted)] uppercase">Updated By</label>
                        <p className="mt-1 text-[color:var(--color-foreground)]">{selectedDoc.updatedBy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
                  <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">Version Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)]">
                      View Full Content
                    </button>
                    {versions[0].id !== selectedDoc.id && (
                      <>
                        <button className="w-full px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)]">
                          Compare with Latest
                        </button>
                        <button className="w-full px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)]">
                          Restore This Version
                        </button>
                      </>
                    )}
                    <button className="w-full px-4 py-2 border border-[color:var(--color-border)] text-[color:var(--color-foreground)] rounded-lg hover:bg-[color:var(--color-surface-alt)]">
                      Download
                    </button>
                  </div>
                </div>

                {/* Version Timeline */}
                <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8">
                  <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-6">Timeline</h3>
                  <div className="relative">
                    {/* Timeline visualization */}
                    {versions.map((version, index) => (
                      <div key={version.id} className="flex gap-4 mb-6 last:mb-0">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${selectedVersion === version.id ? 'bg-[color:var(--color-primary)]' : 'bg-[color:var(--color-border)]'}`} />
                          {index < versions.length - 1 && (
                            <div className="w-0.5 h-12 bg-[color:var(--color-border)] mt-2" />
                          )}
                        </div>

                        {/* Event details */}
                        <div className="pb-4">
                          <p className="font-medium text-[color:var(--color-foreground)]">v{version.version}</p>
                          <p className="text-sm text-[color:var(--color-muted)]">
                            {new Date(version.lastUpdated).toLocaleDateString()} at{' '}
                            {new Date(version.lastUpdated).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-[color:var(--color-muted)] mt-1">Status: {version.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8 text-center">
                <p className="text-[color:var(--color-muted)]">Select a version to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
