'use client';

import React, { useState, useEffect } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { DemoBadge } from '@/components/demo/DemoBadge';
import {
  TrashIcon,
  DownloadIcon,
  EyeOpenIcon,
  Cross2Icon,
  FileTextIcon,
  ClipboardIcon,
  CheckCircledIcon,
  ReaderIcon,
  PersonIcon,
  GlobeIcon,
  BarChartIcon,
  LayersIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';

interface DemoItem {
  id: string;
  type: 'document' | 'case' | 'approval' | 'policy' | 'committee' | 'territory' | 'plan' | 'template';
  title: string;
  code?: string;
  owner?: string;
  createdAt: string;
  demoMetadata?: {
    year?: number;
    bu?: string;
    division?: string;
    category?: string;
  } | null;
}

export default function DemoLibraryPage() {
  const [demoItems, setDemoItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch all demo items from different endpoints
  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        // In a real implementation, this would fetch from multiple API endpoints
        // For now, we'll simulate with documents
        const response = await fetch('/api/sgm/documents?tenantId=demo-tenant-001');
        const data = await response.json();

        const items: DemoItem[] = (data.documents || [])
          .filter((doc: any) => doc.isDemo)
          .map((doc: any) => ({
            id: doc.id,
            type: 'document' as const,
            title: doc.title,
            code: doc.documentCode,
            owner: doc.owner,
            createdAt: doc.createdAt,
            demoMetadata: doc.demoMetadata,
          }));

        setDemoItems(items);
      } catch (error) {
        console.error('Failed to fetch demo items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoData();
  }, []);

  // Filtered items
  const filteredItems = demoItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  // Statistics
  const stats = {
    total: demoItems.length,
    documents: demoItems.filter(i => i.type === 'document').length,
    cases: demoItems.filter(i => i.type === 'case').length,
    approvals: demoItems.filter(i => i.type === 'approval').length,
    policies: demoItems.filter(i => i.type === 'policy').length,
    committees: demoItems.filter(i => i.type === 'committee').length,
    territories: demoItems.filter(i => i.type === 'territory').length,
    plans: demoItems.filter(i => i.type === 'plan').length,
    templates: demoItems.filter(i => i.type === 'template').length,
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all
  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map(i => i.id)));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  // Delete selected items
  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;

    try {
      // In a real implementation, this would call delete APIs for each selected item
      console.log(`Deleting ${selectedItems.size} demo items:`, Array.from(selectedItems));

      // Optimistically remove from local state
      setDemoItems(prev => prev.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete demo items:', error);
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      document: FileTextIcon,
      case: ClipboardIcon,
      approval: CheckCircledIcon,
      policy: ReaderIcon,
      committee: PersonIcon,
      territory: GlobeIcon,
      plan: BarChartIcon,
      template: LayersIcon,
    };
    const Icon = icons[type] || FileTextIcon;
    return <Icon className="w-5 h-5 text-[color:var(--color-primary)]" />;
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      document: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] border-[color:var(--color-info-border)]',
      case: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]',
      approval: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)] border-[color:var(--color-border)]',
      policy: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]',
      committee: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]',
      territory: 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] border-[color:var(--color-accent-border)]',
      plan: 'bg-[color:var(--color-accent-bg)] text-[color:var(--color-accent)] border-[color:var(--color-accent-border)]',
      template: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-info)] border-[color:var(--color-info-border)]',
    };
    return colors[type] || 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
  };

  return (
    <>
      <SetPageTitle
        title="Demo Library"
        description="Manage all demo/sample data in one place - keep to learn or remove when ready"
      />
      <div className="min-h-screen sparcc-hero-bg p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl shadow-lg border border-[color:var(--color-border)] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">Demo Data Library</h1>
                    <p className="text-sm text-[color:var(--color-muted)] mt-1">
                      {stats.total} sample items • Keep to learn the system or remove when ready
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-surface-alt)]"
              >
                Back to Home
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-[color:var(--color-info-bg)] rounded-lg p-4 border border-[color:var(--color-info-border)]">
                <div className="text-3xl font-bold text-[color:var(--color-primary)]">{stats.documents}</div>
                <div className="text-sm text-[color:var(--color-info)] mt-1">Documents</div>
              </div>
              <div className="bg-[color:var(--color-success-bg)] rounded-lg p-4 border border-[color:var(--color-success-border)]">
                <div className="text-3xl font-bold text-[color:var(--color-success)]">{stats.cases}</div>
                <div className="text-sm text-[color:var(--color-success)] mt-1">Cases</div>
              </div>
              <div className="bg-[color:var(--color-surface-alt)] rounded-lg p-4 border border-[color:var(--color-border)]">
                <div className="text-3xl font-bold text-[color:var(--color-primary)]">{stats.approvals}</div>
                <div className="text-sm text-[color:var(--color-primary)] mt-1">Approvals</div>
              </div>
              <div className="bg-[color:var(--color-warning-bg)] rounded-lg p-4 border border-[color:var(--color-warning-border)]">
                <div className="text-3xl font-bold text-[color:var(--color-warning)]">{stats.total}</div>
                <div className="text-sm text-[color:var(--color-warning)] mt-1">Total Items</div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl shadow-lg border border-[color:var(--color-border)] p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm border border-[color:var(--color-border)] rounded-md px-3 py-2 bg-[color:var(--color-surface)] focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  <option value="all">All Types ({stats.total})</option>
                  <option value="document">Documents ({stats.documents})</option>
                  <option value="case">Cases ({stats.cases})</option>
                  <option value="approval">Approvals ({stats.approvals})</option>
                  <option value="policy">Policies ({stats.policies})</option>
                  <option value="committee">Committees ({stats.committees})</option>
                  <option value="territory">Territories ({stats.territories})</option>
                  <option value="plan">Plans ({stats.plans})</option>
                  <option value="template">Templates ({stats.templates})</option>
                </select>

                {/* Selection Controls */}
                <div className="flex items-center gap-2 pl-4 border-l border-[color:var(--color-border)]">
                  <button
                    onClick={selectAll}
                    className="text-sm text-[color:var(--color-info)] hover:text-[color:var(--color-primary)] font-medium"
                  >
                    Select All
                  </button>
                  {selectedItems.size > 0 && (
                    <>
                      <span className="text-[color:var(--color-muted)]">•</span>
                      <button
                        onClick={deselectAll}
                        className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] font-medium"
                      >
                        Deselect All
                      </button>
                    </>
                  )}
                </div>

                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2 pl-4 border-l border-[color:var(--color-border)]">
                    <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                      {selectedItems.size} selected
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--color-error)] text-white text-sm font-medium rounded-md hover:bg-[color:var(--color-error)]"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Selected ({selectedItems.size})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Item List */}
          <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-xl shadow-lg border border-[color:var(--color-border)] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[color:var(--color-muted)]">Loading demo items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[color:var(--color-surface-alt)] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[color:var(--color-muted)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">No demo items found</p>
                <p className="text-sm text-[color:var(--color-muted)]">All demo data has been removed</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-[color:var(--color-surface-alt)] transition-colors"
                    style={{
                      borderLeft: selectedItems.has(item.id) ? '3px solid #FF6B35' : '3px solid transparent',
                      backgroundColor: selectedItems.has(item.id) ? 'rgba(255, 107, 53, 0.04)' : undefined,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="mt-1 w-5 h-5 rounded border-[color:var(--color-border)] text-[color:var(--color-warning)] focus:ring-[color:var(--color-warning-border)]"
                      />

                      {/* Type Icon */}
                      <div className={`flex-none w-12 h-12 rounded-lg flex items-center justify-center border ${getTypeColor(item.type)}`}>
                        <span>{getTypeIcon(item.type)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h3 className="text-sm font-medium text-[color:var(--color-foreground)] truncate">
                            {item.title}
                          </h3>
                          <DemoBadge isDemo={true} demoMetadata={item.demoMetadata} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[color:var(--color-muted)]">
                          {item.code && (
                            <>
                              <span className="font-mono">{item.code}</span>
                              <span>•</span>
                            </>
                          )}
                          <span className="capitalize">{item.type}</span>
                          {item.owner && (
                            <>
                              <span>•</span>
                              <span>{item.owner}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-muted)] rounded-md hover:bg-[color:var(--color-surface-alt)]"
                          title="View Item"
                        >
                          <EyeOpenIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItems(new Set([item.id]));
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-error)] rounded-md hover:bg-[color:var(--color-error-bg)]"
                          title="Delete Item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--color-surface)] rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[color:var(--color-error-bg)] flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-6 h-6 text-[color:var(--color-error)]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-1">Delete Demo Items?</h2>
                <p className="text-sm text-[color:var(--color-muted)]">
                  You are about to delete <strong>{selectedItems.size}</strong> demo item{selectedItems.size !== 1 ? 's' : ''}.
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-muted)]"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-md hover:bg-[color:var(--color-surface-alt)]"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-[color:var(--color-error)] rounded-md hover:bg-[color:var(--color-error)]"
              >
                Delete {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
