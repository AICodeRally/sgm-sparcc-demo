'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  GlobeAltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Policy {
  code: string;
  name: string;
  category: string;
  frameworkArea: string;
  status: 'DRAFT' | 'TEMPLATE' | 'APPROVED';
  source: 'HenrySchein' | 'Jamf';
  wordCount: number;
  legalReviewRequired: boolean;
  content: string;
}

interface PolicyStats {
  totalPolicies: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  frameworkAreas: string[];
}

export default function PolicyLibraryPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [stats, setStats] = useState<PolicyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    fetch('/api/policies/library')
      .then(res => res.json())
      .then(data => {
        setPolicies(data.policies || []);
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading policies:', err);
        setLoading(false);
      });
  }, []);

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = searchQuery === '' ||
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (policy.frameworkArea && policy.frameworkArea.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;
    const matchesSource = sourceFilter === 'all' || policy.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSource;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'TEMPLATE':
        return <DocumentCheckIcon className="w-5 h-5 text-blue-600" />;
      case 'DRAFT':
        return <ClockIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'TEMPLATE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DRAFT':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5 text-purple-600";
    if (category.includes('Financial')) return <CurrencyDollarIcon className={iconClass} />;
    if (category.includes('Legal') || category.includes('Compliance')) return <ShieldCheckIcon className={iconClass} />;
    if (category.includes('HR')) return <UsersIcon className={iconClass} />;
    if (category.includes('Performance')) return <ArrowTrendingUpIcon className={iconClass} />;
    if (category.includes('IT') || category.includes('Data')) return <CircleStackIcon className={iconClass} />;
    if (category.includes('Governance')) return <Cog6ToothIcon className={iconClass} />;
    return <DocumentTextIcon className={iconClass} />;
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowPolicyModal(true);
  };

  const handleDownloadPolicy = (policy: Policy) => {
    // In a real implementation, this would download the markdown file
    const element = document.createElement('a');
    const content = policy.content || `# ${policy.name}\n\n(Content not loaded)`;
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${policy.code}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const categories = Array.from(new Set(policies.map(p => p.category))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading policy library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-xl">
                  <BookOpenIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Policy Library
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Comprehensive compensation governance policy templates
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-900">{stats.totalPolicies}</div>
                  <div className="text-sm text-purple-700">Total Policies</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-900">{stats.byStatus.APPROVED || 0}</div>
                  <div className="text-sm text-green-700">Approved</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-900">{stats.byStatus.TEMPLATE || 0}</div>
                  <div className="text-sm text-blue-700">Templates</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-900">{stats.byStatus.DRAFT || 0}</div>
                  <div className="text-sm text-orange-700">Drafts</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies by name, code, or framework area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="TEMPLATE">Template</option>
              <option value="DRAFT">Draft</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="HenrySchein">Henry Schein</option>
              <option value="Jamf">Jamf</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || sourceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSourceFilter('all');
                }}
                className="px-4 py-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear All
              </button>
            )}

            <div className="flex-1"></div>

            <div className="text-sm text-gray-600">
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPolicies.map(policy => (
            <div
              key={policy.code}
              className="bg-white rounded-xl border-2 border-purple-200 p-6 hover:shadow-xl hover:border-purple-400 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(policy.category)}
                    <h3 className="text-xl font-bold text-gray-900">{policy.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(policy.status)}`}>
                      {policy.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                      {policy.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="font-mono font-medium text-purple-700">{policy.code}</span>
                    {policy.frameworkArea && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ShieldCheckIcon className="w-4 h-4" />
                          {policy.frameworkArea}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{policy.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <DocumentTextIcon className="w-4 h-4" />
                      {policy.wordCount.toLocaleString()} words
                    </span>
                  </div>

                  {policy.legalReviewRequired && (
                    <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg inline-flex">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Requires legal review before implementation
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewPolicy(policy)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    View Policy
                  </button>
                  <button
                    onClick={() => handleDownloadPolicy(policy)}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    title="Download Markdown"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No policies found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Policy Modal */}
        {showPolicyModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPolicyModal(false)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPolicy.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-mono font-medium text-purple-700">{selectedPolicy.code}</span>
                      {selectedPolicy.frameworkArea && (
                        <>
                          <span>•</span>
                          <span>{selectedPolicy.frameworkArea}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{selectedPolicy.wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPolicyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="prose prose-purple max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedPolicy.content.substring(0, 5000)}
                    {selectedPolicy.content.length > 5000 && (
                      <p className="text-sm text-gray-500 italic mt-4">
                        ... (Content truncated. Download the full policy for complete text.)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedPolicy.status)}`}>
                    {selectedPolicy.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                    {selectedPolicy.source}
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadPolicy(selectedPolicy)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
