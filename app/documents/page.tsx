'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  FileTextIcon,
  GearIcon,
  ReaderIcon,
  ArchiveIcon,
  CheckboxIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CaretSortIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import { ThreePaneWorkspace } from '@/components/workspace/ThreePaneWorkspace';
import { DemoBadge, DemoHighlight, LiveBadge, LiveHighlight } from '@/components/demo/DemoBadge';
import { DemoToggle, DemoFilter, DemoWarningBanner } from '@/components/demo/DemoToggle';
import { ModeContextBadge } from '@/components/modes/ModeBadge';

interface Document {
  id: string;
  documentCode: string;
  title: string;
  documentType: string;
  category?: string;
  status: string;
  version: string;
  lastUpdated: string;
  owner: string;
  description?: string;
  effectiveDate?: string;
  isDemo?: boolean;
  demoMetadata?: {
    year?: number;
    bu?: string;
    division?: string;
    category?: string;
  } | null;
}

interface FilterState {
  status?: string;
  documentType?: string;
  category?: string;
  search?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchInput, setSearchInput] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [sortBy, setSortBy] = useState<'updated' | 'code' | 'title'>('updated');
  const [demoFilter, setDemoFilter] = useState<DemoFilter>('all');

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.documentType) queryParams.append('documentType', filters.documentType);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.search) queryParams.append('search', filters.search);
        queryParams.append('tenantId', 'demo-tenant-001');

        const response = await fetch(`/api/sgm/documents?${queryParams}`);
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  // Filter documents based on demo filter
  const filteredDocuments = documents.filter(doc => {
    if (demoFilter === 'demo-only') return doc.isDemo === true;
    if (demoFilter === 'real-only') return doc.isDemo !== true;
    return true; // 'all'
  });

  // Calculate demo counts
  const demoCounts = {
    total: documents.length,
    demo: documents.filter(d => d.isDemo).length,
    real: documents.filter(d => !d.isDemo).length,
  };

  // Get unique document types and categories
  const documentTypes = ['FRAMEWORK', 'POLICY', 'PROCEDURE', 'TEMPLATE', 'CHECKLIST', 'GUIDE'];
  const statuses = ['DRAFT', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ARCHIVED'];
  const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  // Status color mapping
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

  // Document type icon - Using Radix icons
  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      FRAMEWORK: ArchiveIcon,
      POLICY: FileTextIcon,
      PROCEDURE: GearIcon,
      TEMPLATE: ReaderIcon,
      CHECKLIST: CheckboxIcon,
      GUIDE: BookmarkIcon,
    };
    return iconMap[type] || FileTextIcon;
  };

  // Left Nav - Filters and saved views
  const leftNav = (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Document Type
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(prev => ({ ...prev, documentType: undefined }))}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              !filters.documentType
                ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            All Documents
          </button>
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, documentType: type }))}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                filters.documentType === type
                  ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] font-medium'
                  : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              {React.createElement(getDocumentIcon(type), { className: 'w-4 h-4' })}
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">
          Status
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              !filters.status
                ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] font-medium'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
            }`}
          >
            All Statuses
          </button>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({ ...prev, status }))}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                filters.status === status
                  ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] font-medium'
                  : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Center Content - Document list
  const centerContent = (
    <div className="flex flex-col h-full">
      {/* Demo Warning Banner */}
      {demoCounts.demo > 0 && (
        <div className="px-4 pt-4">
          <DemoWarningBanner
            demoCount={demoCounts.demo}
            onViewDemoLibrary={() => window.location.href = '/demo-library'}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ModeContextBadge size="sm" />
            <Link
              href="/documents/upload"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[color:var(--color-success)] text-white text-sm font-medium rounded-md hover:bg-[color:var(--color-success)] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Document
            </Link>
            <Link
              href="/documents/new"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[color:var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[color:var(--color-secondary)] transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              New Document
            </Link>
          </div>
          <DemoToggle
            value={demoFilter}
            onChange={setDemoFilter}
            counts={demoCounts}
            mode="full"
          />
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search documents by title, code, or content..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[color:var(--color-border)] rounded-md focus:ring-2 focus:ring-[color:var(--color-info-border)] focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'updated' ? 'code' : 'updated')}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-[color:var(--color-foreground)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-surface-alt)]"
          >
            <CaretSortIcon className="w-4 h-4" />
            Sort
          </button>
        </form>

        {/* Results count */}
        <div className="mt-2 text-xs text-[color:var(--color-muted)]">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          {filters.documentType && ` • Type: ${filters.documentType}`}
          {filters.status && ` • Status: ${filters.status.replace(/_/g, ' ')}`}
          {demoFilter !== 'all' && (
            <span className="ml-1 text-[color:var(--color-warning)] font-medium">
              • Showing {demoFilter === 'demo-only' ? 'Demo Only' : 'Real Data Only'}
            </span>
          )}
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[color:var(--color-muted)]">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileTextIcon className="w-12 h-12 text-[color:var(--color-muted)] mb-3" />
            <p className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">No documents found</p>
            <p className="text-sm text-[color:var(--color-muted)] mb-4">Get started by creating your first document</p>
            <Link
              href="/documents/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[color:var(--color-secondary)]"
            >
              <PlusIcon className="w-4 h-4" />
              New Document
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map(doc => {
              const IconComponent = getDocumentIcon(doc.documentType);
              const Highlight = doc.isDemo ? DemoHighlight : LiveHighlight;
              return (
                <Highlight key={doc.id} isDemo={doc.isDemo}>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left px-4 py-3 hover:bg-[color:var(--color-surface-alt)] transition-colors ${
                      selectedDoc?.id === doc.id ? 'bg-[color:var(--color-surface-alt)]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-none mt-0.5">
                        <IconComponent className="w-5 h-5 text-[color:var(--color-muted)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-[color:var(--color-foreground)] truncate">
                                {doc.title}
                              </h3>
                              <DemoBadge isDemo={doc.isDemo} demoMetadata={doc.demoMetadata} size="sm" />
                              <LiveBadge isDemo={doc.isDemo} size="sm" label="LIVE" />
                            </div>
                            <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                              {doc.documentCode} • v{doc.version}
                            </p>
                          </div>
                          <span
                            className={`flex-none px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                              doc.status
                            )}`}
                          >
                            {doc.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-[color:var(--color-muted)] mt-1 line-clamp-1">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[color:var(--color-muted)]">
                          <span>{doc.owner}</span>
                          <span>•</span>
                          <span>Updated {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                          {doc.effectiveDate && (
                            <>
                              <span>•</span>
                              <span>Effective {new Date(doc.effectiveDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </Highlight>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Right Detail Pane - Document preview/actions
  const rightDetail = selectedDoc ? (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-[color:var(--color-border)]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">{selectedDoc.title}</h2>
              <DemoBadge isDemo={selectedDoc.isDemo} demoMetadata={selectedDoc.demoMetadata} size="md" />
              <LiveBadge isDemo={selectedDoc.isDemo} size="md" label="LIVE" />
            </div>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">{selectedDoc.documentCode}</p>
          </div>
          <button className="text-[color:var(--color-muted)] hover:text-[color:var(--color-muted)]">
            <DotsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Status
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                selectedDoc.status
              )}`}
            >
              {selectedDoc.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Document Type
            </h3>
            <p className="text-sm text-[color:var(--color-foreground)]">{selectedDoc.documentType}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Version
            </h3>
            <p className="text-sm text-[color:var(--color-foreground)]">v{selectedDoc.version}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Owner
            </h3>
            <p className="text-sm text-[color:var(--color-foreground)]">{selectedDoc.owner}</p>
          </div>

          {selectedDoc.effectiveDate && (
            <div>
              <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
                Effective Date
              </h3>
              <p className="text-sm text-[color:var(--color-foreground)]">
                {new Date(selectedDoc.effectiveDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {selectedDoc.description && (
            <div>
              <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-[color:var(--color-foreground)]">{selectedDoc.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-2">
              Last Updated
            </h3>
            <p className="text-sm text-[color:var(--color-foreground)]">
              {new Date(selectedDoc.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-none p-4 border-t border-[color:var(--color-border)]">
        <Link
          href={`/documents/${selectedDoc.id}`}
          className="block w-full text-center px-4 py-2 bg-[color:var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[color:var(--color-secondary)]"
        >
          View Full Document
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <>
      <SetPageTitle
        title="Document Library"
        description="48 governance documents with versioning, effective dating, and lifecycle management"
      />
      <div className="h-full">
        <ThreePaneWorkspace
          leftNav={leftNav}
          centerContent={centerContent}
          rightDetail={rightDetail}
          showRightPane={!!selectedDoc}
        />
      </div>
    </>
  );
}
