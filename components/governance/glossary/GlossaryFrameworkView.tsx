'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookmarkIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import type { GovernanceFramework, GlossaryContent, GlossaryPhase, GlossaryItem } from '@/lib/contracts/governance-framework.contract';

interface GlossaryFrameworkViewProps {
  framework: GovernanceFramework;
}

export function GlossaryFrameworkView({ framework }: GlossaryFrameworkViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase-1']));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const structuredContent = framework.structuredContent as GlossaryContent | null;
  const phases: GlossaryPhase[] = structuredContent?.phases ?? [];

  // Calculate totals
  const totalEntries = phases.reduce((sum, phase) => sum + phase.totalEntries, 0);
  const totalItems = phases.reduce((sum, phase) => sum + phase.totalItems, 0);

  // Filter entries based on search
  const filterPhases = (phases: GlossaryPhase[]): GlossaryPhase[] => {
    if (!searchQuery.trim()) return phases;

    const query = searchQuery.toLowerCase();
    return phases.map(phase => ({
      ...phase,
      items: phase.items.map(item => ({
        ...item,
        entries: item.entries.filter(entry =>
          entry.keyword.toLowerCase().includes(query) ||
          entry.definition.toLowerCase().includes(query)
        )
      })).filter(item => item.entries.length > 0)
    })).filter(phase => phase.items.length > 0);
  };

  const filteredPhases = filterPhases(phases);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  if (!structuredContent || phases.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[color:var(--color-muted)]">No glossary content available.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
              SPM Knowledge Base
            </h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              {totalEntries} keywords across {totalItems} components in {phases.length} domains
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[color:var(--color-primary)]">{totalEntries}</div>
              <div className="text-xs text-[color:var(--color-muted)]">Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[color:var(--color-accent)]">{totalItems}</div>
              <div className="text-xs text-[color:var(--color-muted)]">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[color:var(--color-success)]">{phases.length}</div>
              <div className="text-xs text-[color:var(--color-muted)]">Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-muted)]" />
        <input
          type="text"
          placeholder="Search keywords and definitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
        />
        {searchQuery && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--color-muted)]">
            {filteredPhases.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.entries.length, 0), 0)} results
          </span>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {filteredPhases.map((phase) => (
          <div
            key={phase.id}
            className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] overflow-hidden"
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-[color:var(--color-surface-alt)] transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedPhases.has(phase.id) ? (
                  <ChevronDownIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
                )}
                <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                  {phase.number}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[color:var(--color-foreground)]">{phase.title}</h3>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    {phase.totalItems} components • {phase.totalEntries} keywords
                  </p>
                </div>
              </div>
            </button>

            {/* Phase Content */}
            {expandedPhases.has(phase.id) && (
              <div className="border-t border-[color:var(--color-border)] p-4 space-y-3">
                {phase.items.map((item) => (
                  <GlossaryItemCard
                    key={item.id}
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleItem(item.id)}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPhases.length === 0 && searchQuery && (
        <div className="text-center py-12 text-[color:var(--color-muted)]">
          No keywords found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}

interface GlossaryItemCardProps {
  item: GlossaryItem;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}

function GlossaryItemCard({ item, isExpanded, onToggle, searchQuery }: GlossaryItemCardProps) {
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-[color:var(--color-surface)] transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
          )}
          <BookmarkIcon className="h-4 w-4 text-[color:var(--color-accent)]" />
          <div className="text-left">
            <span className="font-medium text-[color:var(--color-foreground)]">{item.title}</span>
            <span className="ml-2 text-xs text-[color:var(--color-muted)]">({item.category})</span>
          </div>
        </div>
        <span className="text-sm text-[color:var(--color-muted)]">{item.entries.length} keywords</span>
      </button>

      {isExpanded && (
        <div className="border-t border-[color:var(--color-border)] p-3 space-y-3">
          {item.entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[color:var(--color-surface)] rounded-lg p-3 border border-[color:var(--color-border)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-[color:var(--color-primary)] mb-1">
                    {highlightText(entry.keyword)}
                  </h4>
                  <p className="text-sm text-[color:var(--color-foreground)] leading-relaxed">
                    {highlightText(entry.definition)}
                  </p>
                </div>
                {entry.userType && (
                  <div className="flex items-center gap-1 text-xs text-[color:var(--color-muted)] whitespace-nowrap">
                    <PersonIcon className="h-3 w-3" />
                    {entry.userType}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
