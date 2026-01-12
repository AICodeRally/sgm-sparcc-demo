'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  FileTextIcon,
  ClipboardIcon,
  ReloadIcon,
  LayersIcon,
  CheckCircledIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';

interface SearchResult {
  id: string;
  documentCode: string;
  title: string;
  documentType: string;
  status: string;
  description?: string;
  lastUpdated: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(!!query);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/sgm/search?q=${encodeURIComponent(query)}&tenantId=demo-tenant-001`
        );
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams({ q: searchInput });
      window.history.pushState({}, '', `/search?${params}`);
      setSearchInput('');
    }
  };

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

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      FRAMEWORK: ClipboardIcon,
      POLICY: FileTextIcon,
      PROCEDURE: ReloadIcon,
      TEMPLATE: LayersIcon,
      CHECKLIST: CheckCircledIcon,
      GUIDE: ReaderIcon,
    };
    const Icon = icons[type] || FileTextIcon;
    return <Icon className="w-7 h-7 text-[color:var(--color-primary)]" />;
  };

  return (
    <div className="h-screen sparcc-hero-bg flex flex-col">
      {/* Header */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-4">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-[color:var(--color-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
        {!query ? (
          <div className="text-center py-12">
            <p className="text-[color:var(--color-muted)] text-lg">Enter a search query to get started</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-[color:var(--color-muted)]">Searching...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-lg">
            <p className="text-[color:var(--color-error)]">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[color:var(--color-muted)] text-lg">
              No results found for "<strong>{query}</strong>"
            </p>
            <p className="text-[color:var(--color-muted)] mt-2">Try different keywords or filters</p>
          </div>
        ) : (
          <div>
            <p className="text-[color:var(--color-muted)] mb-6">
              Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "
              <strong>{query}</strong>"
            </p>

            <div className="space-y-4">
              {results.map(result => (
                <Link key={result.id} href={`/documents/${result.id}`}>
                  <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6 hover:shadow-md hover:border-[color:var(--color-border)] transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <span>{getDocumentIcon(result.documentType)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">{result.title}</h3>
                        <p className="text-sm text-[color:var(--color-muted)] mt-1">{result.documentCode}</p>

                        {result.description && (
                          <p className="text-[color:var(--color-muted)] mt-2 line-clamp-2">{result.description}</p>
                        )}

                        <div className="flex items-center gap-4 mt-4 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                          <span className="text-xs text-[color:var(--color-muted)]">
                            Type: {result.documentType}
                          </span>
                          <span className="text-xs text-[color:var(--color-muted)]">
                            Updated: {new Date(result.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <SetPageTitle
        title="Global Search"
        description="Search across all documents, policies, and governance data"
      />
      <Suspense fallback={<div className="h-screen sparcc-hero-bg flex items-center justify-center"><p>Loading...</p></div>}>
        <SearchContent />
      </Suspense>
    </>
  );
}
