'use client';

import { useState } from 'react';

interface Doc {
  id: string;
  title: string;
  excerpt: string;
  lastUpdated: Date;
}

interface KBOrbProps {
  endpoint?: string;
}

export function KBOrb({ endpoint = '/api/kb/search' }: KBOrbProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Doc[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.docs ?? data.results ?? []);
    } catch {
      // Handle error silently
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <form onSubmit={handleSearch} className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {results.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Search the knowledge base...</p>
        ) : (
          results.map((doc) => (
            <a
              key={doc.id}
              href={`/docs/${doc.id}`}
              className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h4 className="font-medium text-sm text-gray-900 dark:text-white">{doc.title}</h4>
              <p className="text-xs mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">{doc.excerpt}</p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
