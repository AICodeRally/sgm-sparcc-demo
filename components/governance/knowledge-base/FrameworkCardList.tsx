'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  Cross2Icon,
  MixerHorizontalIcon,
  GridIcon,
  RowsIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowLeftIcon,
} from '@radix-ui/react-icons';

// Pagination: Load 50 cards at a time for performance
const PAGE_SIZE = 50;
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

// Pillar tile component for the pillar selection view
function PillarTile({
  pillar,
  cardCount,
  categoryCount,
  onClick,
}: {
  pillar: SPMPillar;
  cardCount: number;
  categoryCount: number;
  onClick: () => void;
}) {
  const meta = SPMPillarMetadata[pillar];
  return (
    <button
      onClick={onClick}
      className="group p-6 bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)] hover:border-[color:var(--color-primary)] hover:shadow-lg transition-all text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span className="text-2xl font-bold text-[color:var(--color-primary)] group-hover:scale-110 transition-transform">
          {cardCount}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-1">
        {meta.name}
      </h3>
      <p className="text-sm text-[color:var(--color-muted)] line-clamp-2 mb-3">
        {meta.description}
      </p>
      <div className="text-xs text-[color:var(--color-muted)]">
        {categoryCount} categories
      </div>
    </button>
  );
}

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
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const pillars = SPMPillarSchema.options;
  const cardTypes = CardTypeSchema.options;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [searchQuery, selectedPillar, selectedCategory, selectedCardType]);

  // Extract unique categories from cards
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    cards.forEach((card) => categorySet.add(card.category));
    return Array.from(categorySet).sort();
  }, [cards]);

  // Calculate stats per pillar for the pillar selection view
  const pillarStats = useMemo(() => {
    const stats: Record<SPMPillar, { cardCount: number; categories: Set<string> }> = {} as Record<SPMPillar, { cardCount: number; categories: Set<string> }>;
    pillars.forEach((p) => {
      stats[p] = { cardCount: 0, categories: new Set() };
    });
    cards.forEach((card) => {
      if (stats[card.pillar]) {
        stats[card.pillar].cardCount++;
        stats[card.pillar].categories.add(card.category);
      }
    });
    return stats;
  }, [cards, pillars]);

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

  // Paginate filtered cards for performance
  const paginatedCards = useMemo(() => {
    return filteredCards.slice(0, displayCount);
  }, [filteredCards, displayCount]);

  const hasMoreCards = displayCount < filteredCards.length;
  const remainingCards = filteredCards.length - displayCount;

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, filteredCards.length));
  }, [filteredCards.length]);

  // Group cards by pillar for display (uses paginated cards)
  const groupedByPillar = useMemo(() => {
    const groups: Record<string, FrameworkCardType[]> = {};
    paginatedCards.forEach((card) => {
      if (!groups[card.pillar]) {
        groups[card.pillar] = [];
      }
      groups[card.pillar].push(card);
    });
    return groups;
  }, [paginatedCards]);

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

  // Show pillar tiles when no filters active (landing view)
  const showPillarTiles = !hasActiveFilters;

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

      {/* Pillar Selection View - Landing state */}
      {showPillarTiles ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-2">
              Select a Pillar to Explore
            </h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              Or use search above to find cards across all pillars
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pillars.map((pillar) => (
              <PillarTile
                key={pillar}
                pillar={pillar}
                cardCount={pillarStats[pillar]?.cardCount || 0}
                categoryCount={pillarStats[pillar]?.categories.size || 0}
                onClick={() => setSelectedPillar(pillar)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Back to Pillars button when viewing filtered results */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Pillars
            </button>
            {selectedPillar !== 'all' && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SPMPillarMetadata[selectedPillar].color }}
                />
                <span className="font-medium text-[color:var(--color-foreground)]">
                  {SPMPillarMetadata[selectedPillar].name}
                </span>
              </div>
            )}
          </div>

          {/* Cards Display */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[color:var(--color-muted)] mb-2">No cards found</div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-[color:var(--color-primary)] hover:underline"
              >
                Clear all filters
              </button>
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
              {paginatedCards.map((card) => (
                <FrameworkCard key={card.id} card={card} onTermClick={onTermClick} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Load More Button - only when viewing cards */}
      {!showPillarTiles && hasMoreCards && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-primary)]/90 transition-colors font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Load {Math.min(PAGE_SIZE, remainingCards)} more cards
            <span className="text-white/70 text-sm">({remainingCards} remaining)</span>
          </button>
        </div>
      )}

      {/* Results Summary - only when viewing cards */}
      {!showPillarTiles && filteredCards.length > 0 && (
        <div className="text-center text-sm text-[color:var(--color-muted)] pt-4 border-t border-[color:var(--color-border)]">
          Showing {paginatedCards.length} of {filteredCards.length} cards
          {filteredCards.length !== cards.length && ` (${cards.length} total)`}
        </div>
      )}
    </div>
  );
}

export default FrameworkCardList;
