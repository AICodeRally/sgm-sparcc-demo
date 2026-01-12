'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  FileTextIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  AvatarIcon,
  ClockIcon,
  TableIcon,
  BarChartIcon,
  PlusIcon,
  ArrowRightIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Navigate' | 'Search' | 'Create' | 'Recent';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command items
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-documents',
      title: 'Documents',
      subtitle: 'Browse governance documents',
      icon: FileTextIcon,
      category: 'Navigate',
      action: () => router.push('/documents'),
      keywords: ['document', 'policy', 'procedure', 'framework'],
    },
    {
      id: 'nav-approvals',
      title: 'Approvals',
      subtitle: 'View approval queue',
      icon: CheckCircledIcon,
      category: 'Navigate',
      action: () => router.push('/approvals'),
      keywords: ['approval', 'review', 'sgcc', 'crb', 'spif', 'windfall'],
    },
    {
      id: 'nav-cases',
      title: 'Cases',
      subtitle: 'Manage exceptions and disputes',
      icon: ExclamationTriangleIcon,
      category: 'Navigate',
      action: () => router.push('/cases'),
      keywords: ['case', 'exception', 'dispute', 'territory'],
    },
    {
      id: 'nav-committees',
      title: 'Committees',
      subtitle: 'SGCC and CRB management',
      icon: AvatarIcon,
      category: 'Navigate',
      action: () => router.push('/committees'),
      keywords: ['committee', 'sgcc', 'crb', 'members'],
    },
    {
      id: 'nav-audit',
      title: 'Audit Timeline',
      subtitle: 'Event history and compliance',
      icon: ClockIcon,
      category: 'Navigate',
      action: () => router.push('/audit'),
      keywords: ['audit', 'timeline', 'events', 'compliance'],
    },
    {
      id: 'nav-matrix',
      title: 'Governance Matrix',
      subtitle: 'Policy coverage mapping',
      icon: TableIcon,
      category: 'Navigate',
      action: () => router.push('/governance-matrix'),
      keywords: ['matrix', 'coverage', 'policy', 'mapping'],
    },
    {
      id: 'nav-analytics',
      title: 'Analytics',
      subtitle: 'Governance health metrics',
      icon: BarChartIcon,
      category: 'Navigate',
      action: () => router.push('/analytics'),
      keywords: ['analytics', 'metrics', 'kpi', 'dashboard'],
    },
    {
      id: 'nav-home',
      title: 'Home',
      subtitle: 'Return to dashboard',
      icon: TableIcon,
      category: 'Navigate',
      action: () => router.push('/'),
      keywords: ['home', 'dashboard'],
    },

    // Search (example items)
    {
      id: 'search-windfall-policy',
      title: 'Windfall Deal Review Policy',
      subtitle: 'SCP-007 • Policy',
      icon: FileTextIcon,
      category: 'Search',
      action: () => router.push('/documents'),
      keywords: ['windfall', 'policy', 'scp-007', 'deal'],
    },
    {
      id: 'search-sgcc-charter',
      title: 'SGCC Charter',
      subtitle: 'GC-001 • Framework',
      icon: FileTextIcon,
      category: 'Search',
      action: () => router.push('/documents'),
      keywords: ['sgcc', 'charter', 'gc-001', 'framework'],
    },
    {
      id: 'search-exception-policy',
      title: 'Exception Request Policy',
      subtitle: 'SCP-011 • Policy',
      icon: FileTextIcon,
      category: 'Search',
      action: () => router.push('/documents'),
      keywords: ['exception', 'policy', 'scp-011'],
    },

    // Create actions
    {
      id: 'create-case',
      title: 'Create New Case',
      subtitle: 'Open exception or dispute',
      icon: PlusIcon,
      category: 'Create',
      action: () => router.push('/cases'),
      keywords: ['create', 'new', 'case', 'exception', 'dispute'],
    },
    {
      id: 'create-approval',
      title: 'Submit for Approval',
      subtitle: 'Request SGCC or CRB review',
      icon: PlusIcon,
      category: 'Create',
      action: () => router.push('/approvals'),
      keywords: ['create', 'submit', 'approval', 'request'],
    },
  ];

  // Filter commands based on query
  const filteredCommands = query
    ? commands.filter(cmd => {
        const searchText = `${cmd.title} ${cmd.subtitle || ''} ${cmd.keywords?.join(' ') || ''}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
    : commands;

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          selectedCommand.action();
          onClose();
          setQuery('');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-[color:var(--color-surface)] rounded-lg shadow-2xl border border-[color:var(--color-border)] overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[color:var(--color-border)]">
            <MagnifyingGlassIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or jump to..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-base outline-none text-[color:var(--color-foreground)] placeholder-[color:var(--color-muted)]"
            />
            <button
              onClick={() => {
                onClose();
                setQuery('');
              }}
              className="p-1 hover:bg-[color:var(--color-surface-alt)] rounded transition-colors"
            >
              <Cross2Icon className="w-4 h-4 text-[color:var(--color-muted)]" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="p-8 text-center text-[color:var(--color-muted)]">
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedCommands).map(([category, items], catIndex) => (
                  <div key={category} className={catIndex > 0 ? 'mt-4' : ''}>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider">
                        {category}
                      </p>
                    </div>
                    {items.map((item, itemIndex) => {
                      const globalIndex = filteredCommands.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action();
                            onClose();
                            setQuery('');
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                            isSelected
                              ? 'bg-[color:var(--color-surface-alt)] border-l-2 border-[color:var(--color-primary)]'
                              : 'hover:bg-[color:var(--color-surface-alt)]'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-muted)]'}`} />
                          <div className="flex-1 text-left">
                            <p className={`text-sm font-medium ${isSelected ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-foreground)]'}`}>
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-xs text-[color:var(--color-muted)]">{item.subtitle}</p>
                            )}
                          </div>
                          {isSelected && (
                            <ArrowRightIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] flex items-center justify-between text-xs text-[color:var(--color-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded text-xs font-mono">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded text-xs font-mono">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded text-xs font-mono">esc</kbd>
                to close
              </span>
            </div>
            <span className="text-xs text-[color:var(--color-primary)] font-medium">
              SPARCC Search
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
