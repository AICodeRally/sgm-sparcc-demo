'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  // Get unique document types and categories
  const documentTypes = ['FRAMEWORK', 'POLICY', 'PROCEDURE', 'TEMPLATE', 'CHECKLIST', 'GUIDE'];
  const statuses = ['DRAFT', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ARCHIVED'];
  const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  // Status color mapping
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

  // Document type icon
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600 mt-1">Manage governance documents and policies</p>
            </div>
            <Link href="/sgm/documents/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + New Document
            </Link>
          </div>

          {/* Search and filters */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Filters */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

            {/* Status Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value=""
                    checked={!filters.status}
                    onChange={() => setFilters(prev => ({ ...prev, status: undefined }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">All Statuses</span>
                </label>
                {statuses.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={filters.status === status}
                      onChange={() => setFilters(prev => ({ ...prev, status }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Type Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Type</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value=""
                    checked={!filters.documentType}
                    onChange={() => setFilters(prev => ({ ...prev, documentType: undefined }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">All Types</span>
                </label>
                {documentTypes.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={filters.documentType === type}
                      onChange={() => setFilters(prev => ({ ...prev, documentType: type }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={() => setFilters(prev => ({ ...prev, category: undefined }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={filters.category === cat}
                        onChange={() => setFilters(prev => ({ ...prev, category: cat }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No documents found</p>
                <Link href="/sgm/documents/new" className="text-blue-600 hover:text-blue-700">
                  Create your first document
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {documents.map(doc => (
                  <Link key={doc.id} href={`/sgm/documents/${doc.id}`}>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDocumentIcon(doc.documentType)}</span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                              <p className="text-sm text-gray-500">{doc.documentCode}</p>
                            </div>
                          </div>
                          {doc.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                            {doc.category && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {doc.category}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">v{doc.version}</span>
                            <span className="text-xs text-gray-500">{doc.owner}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">
                            Updated {new Date(doc.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
