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
      DRAFT: 'bg-gray-100 text-gray-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const selectedDoc = versions.find(v => v.id === selectedVersion);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading version history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href={`/sgm/documents/${documentId}`} className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← Back to Document
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Version History</h1>
          <p className="text-gray-600 mt-1">All versions of {versions[0]?.title}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-6">
          {/* Version List */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Versions ({versions.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={`w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors ${
                      selectedVersion === version.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">v{version.version}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(version.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
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
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Version</label>
                      <p className="mt-1 text-2xl font-bold text-gray-900">v{selectedDoc.version}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                      <p className="mt-1">
                        <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(selectedDoc.status)}`}>
                          {selectedDoc.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                      <p className="mt-1 text-gray-900">{new Date(selectedDoc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Last Updated</label>
                      <p className="mt-1 text-gray-900">{new Date(selectedDoc.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Created By</label>
                      <p className="mt-1 text-gray-900">{selectedDoc.createdBy}</p>
                    </div>
                    {selectedDoc.updatedBy && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Updated By</label>
                        <p className="mt-1 text-gray-900">{selectedDoc.updatedBy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      View Full Content
                    </button>
                    {versions[0].id !== selectedDoc.id && (
                      <>
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          Compare with Latest
                        </button>
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          Restore This Version
                        </button>
                      </>
                    )}
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Download
                    </button>
                  </div>
                </div>

                {/* Version Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline</h3>
                  <div className="relative">
                    {/* Timeline visualization */}
                    {versions.map((version, index) => (
                      <div key={version.id} className="flex gap-4 mb-6 last:mb-0">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${selectedVersion === version.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                          {index < versions.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                          )}
                        </div>

                        {/* Event details */}
                        <div className="pb-4">
                          <p className="font-medium text-gray-900">v{version.version}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(version.lastUpdated).toLocaleDateString()} at{' '}
                            {new Date(version.lastUpdated).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Status: {version.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Select a version to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
