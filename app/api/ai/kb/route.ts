/**
 * KB AI Endpoint
 *
 * POST /api/ai/kb
 *
 * Pure RAG queries against the SPM Knowledge Base.
 * Returns relevant KB cards without governance formatting.
 * Lighter weight than /api/ai/asksgm for simple lookups.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAICRClient, isAICRConfigured } from '@/lib/aicr';
import { requireActor } from '@/lib/security/actor';
import { requireTenantContext } from '@/lib/security/require-tenant';
import { rateLimitOrThrow } from '@/lib/security/rate-limit';
import {
  AI_GUARDRAILS,
  parseJsonWithLimit,
} from '@/lib/security/guardrails';
import { isSecurityError } from '@/lib/security/errors';

interface KBQueryRequest {
  query: string;
  limit?: number;
  pillar?: string;        // Filter by pillar (e.g., 'ICM', 'GOVERNANCE_COMPLIANCE')
  category?: string;      // Filter by category
  includeRelated?: boolean; // Include related cards
}

interface KBCard {
  id: string;
  term: string;
  definition: string;
  pillar: string;
  category: string;
  score: number;
  relatedTerms?: string[];
}

interface KBQueryResponse {
  query: string;
  cards: KBCard[];
  count: number;
  source: 'spine' | 'local';
  searchTimeMs: number;
}

// Telemetry logging helper
function logTelemetry(event: Record<string, unknown>) {
  console.log('[KB Telemetry]', JSON.stringify(event, null, 2));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const actor = requireTenantContext(await requireActor());
    rateLimitOrThrow(
      `${actor.tenantId}:${actor.userId}:/api/ai/kb`,
      {
        perMinute: Number(process.env.AI_RATE_LIMIT_PER_MINUTE || '60'),
        perDay: Number(process.env.AI_RATE_LIMIT_PER_DAY || '2000'),
      }
    );

    const body = await parseJsonWithLimit<KBQueryRequest>(request, AI_GUARDRAILS.maxBodyBytes);

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const limit = Math.min(body.limit || 10, 50);
    let cards: KBCard[] = [];
    let source: 'spine' | 'local' = 'local';

    // Try AICR spine search first
    if (isAICRConfigured()) {
      try {
        const aicrClient = getAICRClient();
        const searchResponse = await aicrClient.spineSearch(body.query, {
          limit,
          vectorWeight: 0.7,
          keywordWeight: 0.3,
          minScore: 0.35,
          // Filter to KB content
          filePatterns: body.pillar
            ? [`**/spm-kb-*${body.pillar.toLowerCase()}*`]
            : ['**/spm-kb-*.json', '**/knowledge-base/**'],
        });

        cards = searchResponse.results.map((r) => {
          // Parse KB card from spine chunk
          const metadata = r.metadata as Record<string, unknown>;
          return {
            id: r.id,
            term: (metadata.term as string) || r.filePath.split('/').pop()?.replace('.json', '') || 'Unknown',
            definition: r.content.slice(0, 500),
            pillar: (metadata.pillar as string) || 'GENERAL',
            category: (metadata.category as string) || 'General',
            score: r.scores.combined,
            relatedTerms: (metadata.relatedTerms as string[]) || [],
          };
        });

        source = 'spine';
        console.log(`[OK] [KB] Spine search returned ${cards.length} cards`);
      } catch (spineError) {
        console.warn(`[WARN] [KB] Spine search failed, falling back to local:`, spineError);
      }
    }

    // Fallback to local KB search if spine failed or not configured
    if (cards.length === 0) {
      cards = await searchLocalKB(body.query, limit, body.pillar, body.category);
      source = 'local';
    }

    const searchTimeMs = Date.now() - startTime;

    logTelemetry({
      name: 'kb.query',
      appId: 'sgm-sparcc',
      tenantId: actor.tenantId,
      ts: new Date().toISOString(),
      metrics: {
        query: body.query.slice(0, 100),
        resultsCount: cards.length,
        source,
        searchTimeMs,
        pillarFilter: body.pillar || null,
      },
    });

    const response: KBQueryResponse = {
      query: body.query,
      cards,
      count: cards.length,
      source,
      searchTimeMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }

    console.error('KB query error:', error);
    return NextResponse.json(
      { error: 'Failed to query knowledge base' },
      { status: 500 }
    );
  }
}

/**
 * Local KB search fallback
 * Searches in-memory KB cards when spine is unavailable
 */
async function searchLocalKB(
  query: string,
  limit: number,
  pillar?: string,
  category?: string
): Promise<KBCard[]> {
  // Dynamic import to avoid loading all cards on every request
  const { loadAllKBCards } = await import('@/lib/data/synthetic/kb-loader');
  const allCards = await loadAllKBCards();

  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

  // Score and filter cards
  const scored = allCards
    .filter((card) => {
      if (pillar && card.pillar !== pillar) return false;
      if (category && card.category !== category) return false;
      return true;
    })
    .map((card) => {
      let score = 0;

      // Exact term match (highest weight)
      if (card.term.toLowerCase().includes(queryLower)) {
        score += 0.5;
      }

      // Definition match
      const defLower = card.definition.toLowerCase();
      for (const term of queryTerms) {
        if (defLower.includes(term)) {
          score += 0.1;
        }
      }

      // Keyword match
      if (card.keywords) {
        for (const kw of card.keywords) {
          if (queryLower.includes(kw.toLowerCase())) {
            score += 0.15;
          }
        }
      }

      // Related terms match
      if (card.relatedTerms) {
        for (const rt of card.relatedTerms) {
          if (queryLower.includes(rt.toLowerCase())) {
            score += 0.1;
          }
        }
      }

      return { ...card, score };
    })
    .filter((card) => card.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((card) => ({
    id: card.id,
    term: card.term,
    definition: card.definition,
    pillar: card.pillar,
    category: card.category,
    score: card.score,
    relatedTerms: card.relatedTerms,
  }));
}

// GET endpoint for API discovery
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/kb',
    method: 'POST',
    description: 'Query the SPM Knowledge Base for relevant cards',
    body: {
      query: 'string (required) - The search query',
      limit: 'number (default: 10, max: 50) - Maximum results',
      pillar: 'string (optional) - Filter by pillar (e.g., ICM, GOVERNANCE_COMPLIANCE)',
      category: 'string (optional) - Filter by category',
      includeRelated: 'boolean (optional) - Include related cards',
    },
    response: {
      query: 'string - The original query',
      cards: 'KBCard[] - Matching KB cards with scores',
      count: 'number - Number of results',
      source: '"spine" | "local" - Data source used',
      searchTimeMs: 'number - Search latency',
    },
  });
}
