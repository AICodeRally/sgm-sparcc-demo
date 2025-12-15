'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
      window.history.pushState({}, '', `/sgm/search?${params}`);
      setSearchInput('');
    }
  };

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

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      FRAMEWORK: '📋',
      POLICY: '📄',
      PROCEDURE: '🔄',
      TEMPLATE: '📝',
      CHECKLIST: '✅',
      GUIDE: '📚',
    };
    return icons[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          <p className="text-gray-600 mt-1">Find documents across your governance system</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-4">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Enter a search query to get started</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No results found for "<strong>{query}</strong>"
            </p>
            <p className="text-gray-400 mt-2">Try different keywords or filters</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">
              Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "
              <strong>{query}</strong>"
            </p>

            <div className="space-y-4">
              {results.map(result => (
                <Link key={result.id} href={`/sgm/documents/${result.id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{getDocumentIcon(result.documentType)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{result.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{result.documentCode}</p>

                        {result.description && (
                          <p className="text-gray-600 mt-2 line-clamp-2">{result.description}</p>
                        )}

                        <div className="flex items-center gap-4 mt-4 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Type: {result.documentType}
                          </span>
                          <span className="text-xs text-gray-500">
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
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
