'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircledIcon,
  UpdateIcon,
  ArchiveIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

interface DocumentWithVersions {
  id: string;
  documentCode: string;
  title: string;
  description?: string;
  documentType: string;
  category?: string;
  status: string;
  owner: string;
  createdAt: string;
  lastUpdated: string;
  versionStats: {
    totalVersions: number;
    latestVersion: string;
    activeVersion?: string;
    versionsByStatus: Record<string, number>;
  };
}

export default function DocumentLibraryPage() {
  const [documents, setDocuments] = useState<DocumentWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/documents?includeVersions=true');
      // const data = await response.json();

      // Mock data for now
      setDocuments([
        {
          id: 'doc-1',
          documentCode: 'HS-MED-FSC-2025',
          title: 'Medical Surgical Field Sales Consultant Plan',
          description: 'FY2025 compensation plan for Medical Division FSC roles',
          documentType: 'COMPENSATION_PLAN',
          category: 'Compensation',
          status: 'ACTIVE',
          owner: 'Todd LeBaron',
          createdAt: new Date('2024-11-15').toISOString(),
          lastUpdated: new Date('2025-01-08').toISOString(),
          versionStats: {
            totalVersions: 5,
            latestVersion: '1.2.0',
            activeVersion: '1.2.0',
            versionsByStatus: {
              RAW: 1,
              PROCESSED: 1,
              DRAFT: 1,
              APPROVED: 1,
              ACTIVE_FINAL: 1,
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter !== 'all') {
      if (filter === 'active' && doc.status !== 'ACTIVE') return false;
      if (filter === 'draft' && doc.status !== 'DRAFT') return false;
      if (filter === 'archived' && doc.status !== 'ARCHIVED') return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.documentCode.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'DRAFT':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      case 'ARCHIVED':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
      default:
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]';
    }
  };

  if (loading) {
    return (
      <div className="h-screen sparcc-hero-bg flex items-center justify-center">
        <div className="text-center">
          <UpdateIcon className="w-16 h-16 text-[color:var(--color-primary)] mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">Loading Documents...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <SetPageTitle
        title="Document Library"
        description="Full provenance tracking for all documents"
      />

      <div className="h-screen sparcc-hero-bg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Home
                </Link>
                <div className="h-6 w-px bg-[color:var(--color-accent-border)]"></div>
                <div>
                  <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                    Document Library
                  </h1>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    {filteredDocuments.length} documents • Full version history
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-[color:var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)] w-64"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setFilter('all')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'all' ? 'bg-[color:var(--color-primary)] text-white' : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]')}
              >
                All Documents
              </button>
              <button
                onClick={() => setFilter('active')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'active' ? 'bg-[color:var(--color-success)] text-white' : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-success-bg)]')}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'draft' ? 'bg-[color:var(--color-warning)] text-white' : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-warning-bg)]')}
              >
                Draft
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (filter === 'archived' ? 'bg-[color:var(--color-foreground)] text-[color:var(--color-surface)]' : 'bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]')}
              >
                Archived
              </button>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <FileTextIcon className="w-16 h-16 text-[color:var(--color-muted)] mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-2">No documents found</h2>
                <p className="text-[color:var(--color-muted)]">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}/versions`}
                    className="block"
                  >
                    <div className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-6 hover:shadow-xl hover:border-[color:var(--color-primary)] transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileTextIcon className="w-6 h-6 text-[color:var(--color-primary)]" />
                            <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">{doc.title}</h2>
                            <span className={'px-3 py-1 rounded-full text-xs font-semibold border ' + getStatusColor(doc.status)}>
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-sm text-[color:var(--color-muted)] mb-2">
                            Code: <span className="font-mono font-medium text-[color:var(--color-foreground)]">{doc.documentCode}</span>
                          </p>
                          {doc.description && (
                            <p className="text-[color:var(--color-foreground)] mb-3">{doc.description}</p>
                          )}
                        </div>

                        <div className="text-right ml-6">
                          <div className="text-3xl font-bold text-[color:var(--color-primary)]">
                            {doc.versionStats.totalVersions}
                          </div>
                          <div className="text-xs text-[color:var(--color-muted)]">versions</div>
                        </div>
                      </div>

                      {/* Version Stats */}
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[color:var(--color-border)]">
                        <div>
                          <div className="text-xs text-[color:var(--color-muted)] mb-1">Latest Version</div>
                          <div className="font-mono font-bold text-[color:var(--color-foreground)]">
                            {doc.versionStats.latestVersion}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[color:var(--color-muted)] mb-1">Active Version</div>
                          <div className="font-mono font-bold text-[color:var(--color-success)]">
                            {doc.versionStats.activeVersion || 'None'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[color:var(--color-muted)] mb-1">Owner</div>
                          <div className="font-medium text-[color:var(--color-foreground)]">{doc.owner}</div>
                        </div>
                        <div>
                          <div className="text-xs text-[color:var(--color-muted)] mb-1">Last Updated</div>
                          <div className="text-sm text-[color:var(--color-foreground)]">
                            {new Date(doc.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Version Status Breakdown */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[color:var(--color-border)]">
                        <div className="text-xs text-[color:var(--color-muted)]">Version Status:</div>
                        {Object.entries(doc.versionStats.versionsByStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center gap-1">
                            <span className="text-xs font-medium text-[color:var(--color-foreground)]">{status}:</span>
                            <span className="text-xs font-bold text-[color:var(--color-primary)]">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
