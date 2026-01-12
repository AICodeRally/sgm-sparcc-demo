'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileTextIcon,
  MagnifyingGlassIcon,
  MixerVerticalIcon,
  DownloadIcon,
  CheckCircledIcon,
  ClockIcon,
  FileIcon,
  ExclamationTriangleIcon,
  ReaderIcon,
  LockClosedIcon,
  ArrowUpIcon,
  PersonIcon,
  CircleIcon,
  GearIcon,
  StackIcon,
  GlobeIcon,
  Cross2Icon
} from '@radix-ui/react-icons';
import { ModeContextBadge } from '@/components/modes/ModeBadge';

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
        return <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />;
      case 'TEMPLATE':
        return <FileIcon className="w-5 h-5 text-[color:var(--color-info)]" />;
      case 'DRAFT':
        return <ClockIcon className="w-5 h-5 text-[color:var(--color-warning)]" />;
      default:
        return <FileTextIcon className="w-5 h-5 text-[color:var(--color-muted)]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'TEMPLATE':
        return 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]';
      case 'DRAFT':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5 text-[color:var(--color-primary)]";
    if (category.includes('Financial')) return <CircleIcon className={iconClass} />;
    if (category.includes('Legal') || category.includes('Compliance')) return <LockClosedIcon className={iconClass} />;
    if (category.includes('HR')) return <PersonIcon className={iconClass} />;
    if (category.includes('Performance')) return <ArrowUpIcon className={iconClass} />;
    if (category.includes('IT') || category.includes('Data')) return <StackIcon className={iconClass} />;
    if (category.includes('Governance')) return <GearIcon className={iconClass} />;
    return <FileTextIcon className={iconClass} />;
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
      <div className="min-h-screen sparcc-hero-bg p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto"></div>
            <p className="mt-4 text-[color:var(--color-muted)]">Loading policy library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sparcc-hero-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-[color:var(--color-surface)] rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[color:var(--color-surface-alt)] rounded-xl">
                  <ReaderIcon className="w-8 h-8 text-[color:var(--color-primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-[color:var(--color-foreground)]">
                      Policy Library
                    </h1>
                    <ModeContextBadge size="md" />
                  </div>
                  <p className="text-[color:var(--color-muted)] mt-1">
                    Comprehensive compensation governance policy templates
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-[color:var(--color-surface-alt)] rounded-lg p-4">
                  <div className="text-3xl font-bold text-[color:var(--color-accent)]">{stats.totalPolicies}</div>
                  <div className="text-sm text-[color:var(--color-primary)]">Total Policies</div>
                </div>
                <div className="bg-[color:var(--color-success-bg)] rounded-lg p-4 border border-[color:var(--color-success-border)]">
                  <div className="text-3xl font-bold text-[color:var(--color-success)]">{stats.byStatus.APPROVED || 0}</div>
                  <div className="text-sm text-[color:var(--color-success)]">Approved</div>
                </div>
                <div className="bg-[color:var(--color-info-bg)] rounded-lg p-4 border border-[color:var(--color-info-border)]">
                  <div className="text-3xl font-bold text-[color:var(--color-info)]">{stats.byStatus.TEMPLATE || 0}</div>
                  <div className="text-sm text-[color:var(--color-primary)]">Templates</div>
                </div>
                <div className="bg-[color:var(--color-warning-bg)] rounded-lg p-4 border border-[color:var(--color-warning-border)]">
                  <div className="text-3xl font-bold text-[color:var(--color-warning)]">{stats.byStatus.DRAFT || 0}</div>
                  <div className="text-sm text-[color:var(--color-warning)]">Drafts</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[color:var(--color-surface)] rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[color:var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search policies by name, code, or framework area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[color:var(--color-border)] rounded-lg focus:border-[color:var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MixerVerticalIcon className="w-4 h-4 text-[color:var(--color-muted)]" />
              <span className="text-sm font-medium text-[color:var(--color-foreground)]">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-[color:var(--color-border)] rounded-lg text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="TEMPLATE">Template</option>
              <option value="DRAFT">Draft</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border-2 border-[color:var(--color-border)] rounded-lg text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border-2 border-[color:var(--color-border)] rounded-lg text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
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
                className="px-4 py-2 text-sm text-[color:var(--color-primary)] hover:text-[color:var(--color-accent)] font-medium"
              >
                Clear All
              </button>
            )}

            <div className="flex-1"></div>

            <div className="text-sm text-[color:var(--color-muted)]">
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPolicies.map(policy => (
            <div
              key={policy.code}
              className="bg-[color:var(--color-surface)] rounded-xl border-2 border-[color:var(--color-border)] p-6 hover:shadow-xl hover:border-[color:var(--color-primary)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(policy.category)}
                    <h3 className="text-xl font-bold text-[color:var(--color-foreground)]">{policy.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(policy.status)}`}>
                      {policy.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)]">
                      {policy.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[color:var(--color-muted)] mb-3">
                    <span className="font-mono font-medium text-[color:var(--color-primary)]">{policy.code}</span>
                    {policy.frameworkArea && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <LockClosedIcon className="w-4 h-4" />
                          {policy.frameworkArea}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{policy.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileTextIcon className="w-4 h-4" />
                      {policy.wordCount.toLocaleString()} words
                    </span>
                  </div>

                  {policy.legalReviewRequired && (
                    <div className="flex items-center gap-2 text-sm text-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] px-3 py-2 rounded-lg inline-flex">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Requires legal review before implementation
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewPolicy(policy)}
                    className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors font-medium"
                  >
                    View Policy
                  </button>
                  <button
                    onClick={() => handleDownloadPolicy(policy)}
                    className="p-2 border-2 border-[color:var(--color-border)] rounded-lg hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-surface-alt)] transition-colors"
                    title="Download Markdown"
                  >
                    <DownloadIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="bg-[color:var(--color-surface)] rounded-xl shadow-lg p-12 text-center">
            <FileTextIcon className="w-16 h-16 text-[color:var(--color-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[color:var(--color-foreground)] mb-2">No policies found</h3>
            <p className="text-[color:var(--color-muted)]">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Policy Modal */}
        {showPolicyModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPolicyModal(false)}>
            <div className="bg-[color:var(--color-surface)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-[color:var(--color-border)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">{selectedPolicy.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-[color:var(--color-muted)]">
                      <span className="font-mono font-medium text-[color:var(--color-primary)]">{selectedPolicy.code}</span>
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
                    className="text-[color:var(--color-muted)] hover:text-[color:var(--color-muted)]"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="prose prose-purple prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedPolicy.content.length > 5000
                      ? selectedPolicy.content.substring(0, 5000) + '\n\n*... (Content truncated. Download the full policy for complete text.)*'
                      : selectedPolicy.content
                    }
                  </ReactMarkdown>
                </div>
              </div>

              <div className="p-6 border-t border-[color:var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedPolicy.status)}`}>
                    {selectedPolicy.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)]">
                    {selectedPolicy.source}
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadPolicy(selectedPolicy)}
                  className="px-6 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-secondary)] transition-colors font-medium flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
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
