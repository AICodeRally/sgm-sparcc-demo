'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  Cross2Icon,
  MixerHorizontalIcon,
  GridIcon,
  RowsIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
import { FrameworkCard } from './FrameworkCard';
import type {
  FrameworkCard as FrameworkCardType,
  SPMPillar,
  CardType,
} from '@/lib/contracts/spm-knowledge-base.contract';
import { SPMPillarMetadata, SPMPillarSchema, CardTypeSchema } from '@/lib/contracts/spm-knowledge-base.contract';

interface FrameworkCardListProps {
  cards: FrameworkCardType[];
  onTermClick?: (term: string) => void;
  initialFilters?: {
    pillar?: SPMPillar;
    category?: string;
    cardType?: CardType;
  };
  className?: string;
}

type ViewMode = 'grid' | 'list';

const CARD_TYPE_LABELS: Record<CardType, string> = {
  concept: 'Concept',
  mechanic: 'Mechanic',
  process: 'Process',
  role: 'Role',
  regulation: 'Regulation',
};

export function FrameworkCardList({
  cards,
  onTermClick,
  initialFilters = {},
  className = '',
}: FrameworkCardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<SPMPillar | 'all'>(initialFilters.pillar || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category || 'all');
  const [selectedCardType, setSelectedCardType] = useState<CardType | 'all'>(initialFilters.cardType || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories from cards
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    cards.forEach((card) => categorySet.add(card.category));
    return Array.from(categorySet).sort();
  }, [cards]);

  // Filter cards based on search and filters
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          card.keyword,
          card.definition,
          card.whyItMatters || '',
          card.extendedDefinition || '',
          ...(card.aliases || []),
          ...(card.tags || []),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Pillar filter
      if (selectedPillar !== 'all' && card.pillar !== selectedPillar) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && card.category !== selectedCategory) {
        return false;
      }

      // Card type filter
      if (selectedCardType !== 'all' && card.cardType !== selectedCardType) {
        return false;
      }

      return true;
    });
  }, [cards, searchQuery, selectedPillar, selectedCategory, selectedCardType]);

  // Group cards by pillar for display
  const groupedByPillar = useMemo(() => {
    const groups: Record<string, FrameworkCardType[]> = {};
    filteredCards.forEach((card) => {
      if (!groups[card.pillar]) {
        groups[card.pillar] = [];
      }
      groups[card.pillar].push(card);
    });
    return groups;
  }, [filteredCards]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPillar('all');
    setSelectedCategory('all');
    setSelectedCardType('all');
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedPillar !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCardType !== 'all';

  const pillars = SPMPillarSchema.options;
  const cardTypes = CardTypeSchema.options;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">SPM Knowledge Base</h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              {filteredCards.length} of {cards.length} cards
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--color-primary)]">{cards.length}</div>
                <div className="text-xs text-[color:var(--color-muted)]">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--color-accent)]">{categories.length}</div>
                <div className="text-xs text-[color:var(--color-muted)]">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--color-success)]">{pillars.length}</div>
                <div className="text-xs text-[color:var(--color-muted)]">Pillars</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search keywords, definitions, aliases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[color:var(--color-surface-alt)] rounded-full transition-colors"
            >
              <Cross2Icon className="h-4 w-4 text-[color:var(--color-muted)]" />
            </button>
          )}
        </div>

        {/* Filter Toggle and View Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-[color:var(--color-primary)]/10 border-[color:var(--color-primary)] text-[color:var(--color-primary)]'
                  : 'border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]'
              }`}
            >
              <MixerHorizontalIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[color:var(--color-primary)] text-white text-xs">
                  {[selectedPillar !== 'all', selectedCategory !== 'all', selectedCardType !== 'all'].filter(
                    Boolean
                  ).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
              >
                <Cross2Icon className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[color:var(--color-surface)] text-[color:var(--color-primary)] shadow-sm'
                  : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
              }`}
              title="Grid view"
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[color:var(--color-surface)] text-[color:var(--color-primary)] shadow-sm'
                  : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'
              }`}
              title="List view"
            >
              <RowsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[color:var(--color-surface-alt)] rounded-lg border border-[color:var(--color-border)]">
            {/* Pillar Filter */}
            <div>
              <label className="block text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                Pillar
              </label>
              <div className="relative">
                <select
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value as SPMPillar | 'all')}
                  className="w-full appearance-none px-3 py-2 pr-8 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] text-sm focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
                >
                  <option value="all">All Pillars</option>
                  {pillars.map((pillar) => (
                    <option key={pillar} value={pillar}>
                      {SPMPillarMetadata[pillar].name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] text-sm focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Card Type Filter */}
            <div>
              <label className="block text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wide mb-2">
                Card Type
              </label>
              <div className="relative">
                <select
                  value={selectedCardType}
                  onChange={(e) => setSelectedCardType(e.target.value as CardType | 'all')}
                  className="w-full appearance-none px-3 py-2 pr-8 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] text-sm focus:ring-2 focus:ring-[color:var(--color-accent-border)] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {cardTypes.map((type) => (
                    <option key={type} value={type}>
                      {CARD_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)] pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-[color:var(--color-muted)] mb-2">No cards found</div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-[color:var(--color-primary)] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View - Group by Pillar
        <div className="space-y-8">
          {Object.entries(groupedByPillar).map(([pillar, pillarCards]) => {
            const pillarMeta = SPMPillarMetadata[pillar as SPMPillar];
            return (
              <div key={pillar}>
                {/* Pillar Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: pillarMeta.color }}
                  />
                  <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {pillarMeta.name}
                  </h3>
                  <span className="text-sm text-[color:var(--color-muted)]">
                    ({pillarCards.length} cards)
                  </span>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pillarCards.map((card) => (
                    <FrameworkCard key={card.id} card={card} onTermClick={onTermClick} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredCards.map((card) => (
            <FrameworkCard key={card.id} card={card} onTermClick={onTermClick} />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredCards.length > 0 && (
        <div className="text-center text-sm text-[color:var(--color-muted)] pt-4 border-t border-[color:var(--color-border)]">
          Showing {filteredCards.length} of {cards.length} cards
        </div>
      )}
    </div>
  );
}

export default FrameworkCardList;
