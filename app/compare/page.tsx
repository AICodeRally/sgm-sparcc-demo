'use client';

import React, { useState, useMemo } from 'react';
import {
  FileTextIcon,
  ClockIcon,
  PersonIcon,
  CheckCircledIcon,
  UpdateIcon,
  ArrowRightIcon,
  DotFilledIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import {
  DOCUMENT_VERSIONS,
  VERSION_STATS,
  getDocumentVersions,
  getVersion,
  compareVersions,
  DocumentVersion,
  VersionDiff,
} from '@/lib/data/synthetic/versions.data';

export default function VersionComparePage() {
  const [selectedDocCode, setSelectedDocCode] = useState<string>('SCP-001');
  const [oldVersionId, setOldVersionId] = useState<string>('ver-001-v2');
  const [newVersionId, setNewVersionId] = useState<string>('ver-001-v3');

  // Get unique document codes
  const documentCodes = useMemo(() => {
    const codes = new Set(DOCUMENT_VERSIONS.map(v => v.documentCode));
    return Array.from(codes).sort();
  }, []);

  // Get versions for selected document
  const versions = useMemo(() => {
    return getDocumentVersions(selectedDocCode);
  }, [selectedDocCode]);

  // Get selected versions
  const oldVersion = useMemo(() => getVersion(oldVersionId), [oldVersionId]);
  const newVersion = useMemo(() => getVersion(newVersionId), [newVersionId]);

  // Get diff
  const diffs = useMemo(() => {
    if (oldVersionId && newVersionId) {
      return compareVersions(oldVersionId, newVersionId);
    }
    return [];
  }, [oldVersionId, newVersionId]);

  // Get change type color
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'bg-[color:var(--color-success-bg)] border-[color:var(--color-success-border)] text-[color:var(--color-success)]';
      case 'deletion':
        return 'bg-[color:var(--color-error-bg)] border-[color:var(--color-error-border)] text-[color:var(--color-error)]';
      case 'modification':
        return 'bg-[color:var(--color-warning-bg)] border-[color:var(--color-warning-border)] text-[color:var(--color-warning)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)] text-[color:var(--color-foreground)]';
    }
  };

  // Get change type badge color
  const getChangeBadgeColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'deletion':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
      case 'modification':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] border-[color:var(--color-success-border)]';
      case 'IN_REVIEW':
        return 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-[color:var(--color-warning-border)]';
      case 'DRAFT':
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
      case 'ARCHIVED':
        return 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)] border-[color:var(--color-error-border)]';
      default:
        return 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)] border-[color:var(--color-border)]';
    }
  };

  return (
    <>
      <SetPageTitle
        title="Version Compare"
        description="Side-by-side document version comparison with highlighted changes"
      />
      <div className="h-screen sparcc-hero-bg flex flex-col">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                  Version Compare
                </h1>
                <p className="text-sm text-[color:var(--color-muted)] mt-1">
                  Side-by-side document version comparison
                </p>
              </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-[color:var(--color-surface-alt)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-primary)]">{VERSION_STATS.totalVersions}</span>
                <span className="text-[color:var(--color-primary)] ml-1">versions</span>
              </div>
              <div className="bg-[color:var(--color-success-bg)] px-3 py-1 rounded-full">
                <span className="font-semibold text-[color:var(--color-success)]">{VERSION_STATS.recentUpdates}</span>
                <span className="text-[color:var(--color-success)] ml-1">recent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Document & Version Selector */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {/* Document Selector */}
              <div>
                <label className="block text-sm font-semibold text-[color:var(--color-foreground)] mb-2">
                  Document
                </label>
                <select
                  value={selectedDocCode}
                  onChange={(e) => {
                    setSelectedDocCode(e.target.value);
                    const newVersions = getDocumentVersions(e.target.value);
                    if (newVersions.length >= 2) {
                      setNewVersionId(newVersions[0].id);
                      setOldVersionId(newVersions[1].id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  {documentCodes.map(code => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Old Version Selector */}
              <div>
                <label className="block text-sm font-semibold text-[color:var(--color-foreground)] mb-2">
                  Compare From (Old)
                </label>
                <select
                  value={oldVersionId}
                  onChange={(e) => setOldVersionId(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.version} - {new Date(version.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* New Version Selector */}
              <div>
                <label className="block text-sm font-semibold text-[color:var(--color-foreground)] mb-2">
                  Compare To (New)
                </label>
                <select
                  value={newVersionId}
                  onChange={(e) => setNewVersionId(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-border)]"
                >
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.version} - {new Date(version.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Version Timeline */}
          <div className="w-80 border-r border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] mb-3 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                Version History
              </h3>

              <div className="space-y-3">
                {versions.map((version, index) => {
                  const isOld = version.id === oldVersionId;
                  const isNew = version.id === newVersionId;
                  const isSelected = isOld || isNew;

                  return (
                    <div
                      key={version.id}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-alt)]'
                          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-border)]'
                      }`}
                    >
                      {/* Timeline connector */}
                      {index < versions.length - 1 && (
                        <div className="absolute left-5 top-full w-0.5 h-3 bg-[color:var(--color-accent-border)]"></div>
                      )}

                      {/* Version badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[color:var(--color-surface-alt)] flex items-center justify-center">
                            <FileTextIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[color:var(--color-foreground)]">{version.version}</p>
                            {isOld && (
                              <span className="text-xs text-[color:var(--color-primary)] font-medium">Old</span>
                            )}
                            {isNew && (
                              <span className="text-xs text-[color:var(--color-primary)] font-medium">New</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(version.status)}`}>
                          {version.status}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1 text-xs text-[color:var(--color-muted)] mb-2">
                        <div className="flex items-center gap-1">
                          <PersonIcon className="w-3 h-3" />
                          <span>{version.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Changes summary */}
                      <p className="text-xs text-[color:var(--color-muted)] leading-relaxed">
                        {version.changesSummary}
                      </p>

                      {/* Change count */}
                      {version.changeCount > 0 && (
                        <div className="mt-2 pt-2 border-t border-[color:var(--color-accent-border)]">
                          <span className="text-xs text-[color:var(--color-primary)] font-medium">
                            {version.changeCount} {version.changeCount === 1 ? 'change' : 'changes'}
                          </span>
                        </div>
                      )}

                      {/* Select buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setOldVersionId(version.id)}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            isOld
                              ? 'bg-[color:var(--color-primary)] text-white'
                              : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                          }`}
                        >
                          Set as Old
                        </button>
                        <button
                          onClick={() => setNewVersionId(version.id)}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            isNew
                              ? 'bg-[color:var(--color-primary)] text-white'
                              : 'bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-alt)]'
                          }`}
                        >
                          Set as New
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center - Comparison Results */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Comparison Header */}
            {oldVersion && newVersion && (
              <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] p-6 mb-6">
                <div className="flex items-center justify-between">
                  {/* Old Version */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileTextIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                      <span className="text-sm font-semibold text-[color:var(--color-muted)]">From</span>
                    </div>
                    <p className="text-lg font-bold text-[color:var(--color-foreground)]">{oldVersion.version}</p>
                    <p className="text-sm text-[color:var(--color-muted)]">
                      {new Date(oldVersion.createdAt).toLocaleDateString()} • {oldVersion.createdBy}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="px-6">
                    <ArrowRightIcon className="w-8 h-8 text-[color:var(--color-primary)]" />
                  </div>

                  {/* New Version */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-sm font-semibold text-[color:var(--color-muted)]">To</span>
                      <UpdateIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                    </div>
                    <p className="text-lg font-bold text-[color:var(--color-foreground)]">{newVersion.version}</p>
                    <p className="text-sm text-[color:var(--color-muted)]">
                      {new Date(newVersion.createdAt).toLocaleDateString()} • {newVersion.createdBy}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-[color:var(--color-accent-border)]">
                  <p className="text-sm text-[color:var(--color-foreground)]">
                    <strong>Changes:</strong> {newVersion.changesSummary}
                  </p>
                  <p className="text-sm text-[color:var(--color-primary)] font-medium mt-1">
                    {diffs.length} {diffs.length === 1 ? 'section' : 'sections'} modified
                  </p>
                </div>
              </div>
            )}

            {/* Diff Results */}
            {diffs.length === 0 ? (
              <div className="text-center py-12 bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)]">
                <CheckCircledIcon className="w-12 h-12 text-[color:var(--color-success)] mx-auto mb-3" />
                <p className="text-[color:var(--color-muted)]">No differences found between versions</p>
              </div>
            ) : (
              <div className="space-y-6">
                {diffs.map((diff, index) => (
                  <div
                    key={index}
                    className="bg-[color:var(--surface-glass)] backdrop-blur-sm rounded-lg border border-[color:var(--color-border)] overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="bg-[color:var(--color-surface-alt)] px-4 py-3 border-b border-[color:var(--color-border)]">
                      <h3 className="font-semibold text-[color:var(--color-foreground)] flex items-center gap-2">
                        <ChevronRightIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                        {diff.sectionTitle}
                      </h3>
                      <p className="text-xs text-[color:var(--color-muted)] mt-1">
                        {diff.changes.length} {diff.changes.length === 1 ? 'change' : 'changes'} detected
                      </p>
                    </div>

                    {/* Changes */}
                    <div className="p-4 space-y-4">
                      {diff.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="space-y-2">
                          {/* Change Type Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded border uppercase ${getChangeBadgeColor(change.type)}`}>
                              {change.type}
                            </span>
                            {change.context && (
                              <span className="text-xs text-[color:var(--color-muted)]">{change.context}</span>
                            )}
                          </div>

                          {/* Side by Side Comparison */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Old Text */}
                            {change.oldText && (
                              <div className={`p-3 rounded border ${
                                change.type === 'deletion' ? getChangeColor('deletion') : 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)]'
                              }`}>
                                <p className="text-xs font-semibold text-[color:var(--color-muted)] mb-1">Old Version</p>
                                <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed whitespace-pre-wrap">
                                  {change.oldText}
                                </p>
                              </div>
                            )}

                            {/* New Text */}
                            {change.newText && (
                              <div className={`p-3 rounded border ${
                                change.type === 'addition' ? getChangeColor('addition') : getChangeColor('modification')
                              }`}>
                                <p className="text-xs font-semibold text-[color:var(--color-muted)] mb-1">New Version</p>
                                <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed whitespace-pre-wrap">
                                  {change.newText}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
