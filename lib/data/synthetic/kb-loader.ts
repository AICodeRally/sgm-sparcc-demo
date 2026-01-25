/**
 * KB Loader
 *
 * Loads and caches all SPM Knowledge Base cards from JSON files.
 * Used by the /api/ai/kb endpoint for local fallback search.
 */

import migratedCards from './spm-kb-cards-migrated.json';
import newPillarCards from './spm-kb-cards-new-pillars.json';
import expansionCards from './spm-kb-cards-expansion.json';
import expansion2Cards from './spm-kb-cards-expansion-2.json';
import expansion3Cards from './spm-kb-cards-expansion-3.json';
import expansion4Cards from './spm-kb-cards-expansion-4.json';
import expansion6Cards from './spm-kb-cards-expansion-6.json';

export interface KBCard {
  id: string;
  term: string;        // Normalized from 'keyword' field
  definition: string;
  pillar: string;
  category: string;
  keywords?: string[];
  relatedTerms?: string[];
  examples?: string[];
  sources?: string[];
}

// Raw card format from JSON files (uses 'keyword' not 'term')
interface RawKBCard {
  id: string;
  keyword: string;
  definition: string;
  pillar: string;
  category: string;
  aliases?: string[];
  relatedTerms?: string[];
  example?: string;
  [key: string]: unknown;
}

// Normalize raw card to KBCard format
function normalizeCard(raw: RawKBCard): KBCard {
  return {
    id: raw.id,
    term: raw.keyword,
    definition: raw.definition,
    pillar: raw.pillar,
    category: raw.category,
    keywords: raw.aliases || [],
    relatedTerms: raw.relatedTerms || [],
    examples: raw.example ? [raw.example] : [],
  };
}

// Cache for loaded cards
let cachedCards: KBCard[] | null = null;

/**
 * Load all KB cards from JSON files
 * Results are cached after first load
 */
export async function loadAllKBCards(): Promise<KBCard[]> {
  if (cachedCards) {
    return cachedCards;
  }

  const allCards: KBCard[] = [];

  // Load migrated cards
  if (migratedCards && Array.isArray((migratedCards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (migratedCards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  // Load new pillar cards
  if (newPillarCards && Array.isArray((newPillarCards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (newPillarCards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  // Load expansion cards
  if (expansionCards && Array.isArray((expansionCards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (expansionCards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  // Load expansion phase 2 cards
  if (expansion2Cards && Array.isArray((expansion2Cards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (expansion2Cards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  // Load expansion phase 3 cards
  if (expansion3Cards && Array.isArray((expansion3Cards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (expansion3Cards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  // Load expansion phase 4 cards
  if (expansion4Cards && Array.isArray((expansion4Cards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (expansion4Cards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  // Load expansion phase 6 cards (Operations & Support)
  if (expansion6Cards && Array.isArray((expansion6Cards as { cards?: RawKBCard[] }).cards)) {
    const rawCards = (expansion6Cards as { cards: RawKBCard[] }).cards;
    allCards.push(...rawCards.map(normalizeCard));
  }

  cachedCards = allCards;
  console.log(`[KB Loader] Loaded ${allCards.length} cards`);

  return allCards;
}

/**
 * Get cards by pillar
 */
export async function getCardsByPillar(pillar: string): Promise<KBCard[]> {
  const allCards = await loadAllKBCards();
  return allCards.filter((card) => card.pillar === pillar);
}

/**
 * Get cards by category
 */
export async function getCardsByCategory(category: string): Promise<KBCard[]> {
  const allCards = await loadAllKBCards();
  return allCards.filter((card) => card.category === category);
}

/**
 * Get card by ID
 */
export async function getCardById(id: string): Promise<KBCard | null> {
  const allCards = await loadAllKBCards();
  return allCards.find((card) => card.id === id) || null;
}

/**
 * Get card by term (case-insensitive)
 */
export async function getCardByTerm(term: string): Promise<KBCard | null> {
  const allCards = await loadAllKBCards();
  const termLower = term.toLowerCase();
  return allCards.find((card) => card.term.toLowerCase() === termLower) || null;
}

/**
 * Get KB statistics
 */
export async function getKBStats(): Promise<{
  totalCards: number;
  byPillar: Record<string, number>;
  byCategory: Record<string, number>;
}> {
  const allCards = await loadAllKBCards();

  const byPillar: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const card of allCards) {
    byPillar[card.pillar] = (byPillar[card.pillar] || 0) + 1;
    byCategory[card.category] = (byCategory[card.category] || 0) + 1;
  }

  return {
    totalCards: allCards.length,
    byPillar,
    byCategory,
  };
}

/**
 * Clear the cache (for testing or hot reload)
 */
export function clearKBCache(): void {
  cachedCards = null;
}
