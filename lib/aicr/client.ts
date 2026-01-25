/**
 * AICR Platform Client
 *
 * Calls AICR Platform API for AI services instead of running local LLM.
 * Supports the expert hierarchy: SGM → SPARCC/SPM → Summit → Platform
 *
 * LLM Strategy: Local-first with gateway fallback
 * - Primary: Ollama (local, free)
 * - Fallback 1: Claude (best quality)
 * - Fallback 2: OpenAI
 * - Fallback 3: Gemini (emergency)
 */

const AICR_API = process.env.AICR_API_URL || 'http://localhost:3000';
const AICR_TENANT_ID = process.env.AICR_TENANT_ID || 'demo';

export interface AskSGMRequest {
  message: string;
  domain?: 'sgm' | 'spm' | 'enterprise' | 'platform';
  intent?: 'governance_ruling' | 'dispute_kit' | 'exception_packet' | 'governance_gap';
  context?: {
    planId?: string;
    transactionId?: string;
    repId?: string;
    planYear?: number;
    jurisdiction?: string;
    cycleState?: string;
    currentPage?: string;
  };
  tenantId?: string;
  escalate?: boolean;  // Force escalation to parent expert
}

export interface AskSGMResponse {
  answer: string;
  citations?: Array<{
    policyVersionId: string;
    excerpt: string;
    score: number;
  }>;
  suggestedActions?: string[];
  deliverableType?: 'RULING' | 'EXCEPTION_PACKET' | 'DISPUTE_KIT' | 'CHANGE_CONTROL_MEMO' | 'GOVERNANCE_GAP';
  confidence?: number;
  escalatedFrom?: string;  // If escalated from child expert
  expert?: {
    slug: string;
    name: string;
    domain: string;
  };
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  cached?: boolean;
}

export interface AICRClientConfig {
  apiUrl?: string;
  tenantId?: string;
  timeout?: number;
  debug?: boolean;
}

// Spine Search Types
export interface SpineSearchOptions {
  limit?: number;
  vectorWeight?: number;
  keywordWeight?: number;
  minScore?: number;
  filePatterns?: string[];
  fileTypes?: string[];
  chunkTypes?: string[];
}

export interface SpineSearchResult {
  id: string;
  filePath: string;
  content: string;
  metadata: Record<string, unknown>;
  scores: {
    vector: number;
    keyword: number;
    combined: number;
  };
}

export interface SpineSearchResponse {
  query: string;
  results: SpineSearchResult[];
  count: number;
}

/**
 * AICR Platform Client
 */
export class AICRClient {
  private apiUrl: string;
  private tenantId: string;
  private timeout: number;
  private debug: boolean;

  constructor(config: AICRClientConfig = {}) {
    this.apiUrl = config.apiUrl || AICR_API;
    this.tenantId = config.tenantId || AICR_TENANT_ID;
    this.timeout = config.timeout || 120000; // 2 minutes
    this.debug = config.debug || false;
  }

  /**
   * Call SGM governance expert via AICR platform
   */
  async askSGM(request: AskSGMRequest): Promise<AskSGMResponse> {
    const tenantId = request.tenantId || this.tenantId;
    const domain = request.domain || 'sgm';

    if (this.debug) {
      console.log(`[AICR Client] Calling ${domain} expert for tenant ${tenantId}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.apiUrl}/${tenantId}/api/ask/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Auth headers required by AICR ask/invoke endpoint
          'x-role': 'admin',
          'x-actor-type': 'admin',
          'x-actor-id': 'sgm-prototype',
        },
        body: JSON.stringify({
          domain,
          intent: request.intent,
          message: request.message,
          context: request.context,
          escalate: request.escalate,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AICR API error (${response.status}): ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();

      if (this.debug) {
        console.log(`[AICR Client] Response from ${data.expert?.slug || domain}:`, {
          confidence: data.confidence,
          deliverableType: data.deliverableType,
          tokensUsed: data.tokensUsed,
          cached: data.cached,
        });
      }

      return data as AskSGMResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AICR API timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Check if AICR platform is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available experts for a tenant
   */
  async getExperts(tenantId?: string): Promise<Array<{ slug: string; name: string; domain: string }>> {
    const tid = tenantId || this.tenantId;
    try {
      const response = await fetch(`${this.apiUrl}/${tid}/api/ask/experts`, {
        method: 'GET',
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.experts || [];
    } catch {
      return [];
    }
  }

  /**
   * Search spine_chunks for RAG context
   * Uses hybrid search (vector similarity + keyword matching)
   */
  async spineSearch(
    query: string,
    options: SpineSearchOptions = {}
  ): Promise<SpineSearchResponse> {
    const {
      limit = 10,
      vectorWeight = 0.6,
      keywordWeight = 0.4,
      minScore = 0.25,
      filePatterns,
      fileTypes,
      chunkTypes,
    } = options;

    if (this.debug) {
      console.log(`[AICR Client] Spine search: "${query.slice(0, 50)}..." (limit: ${limit})`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for search

    try {
      const response = await fetch(`${this.apiUrl}/api/spine/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Auth headers required by AICR spine search endpoint
          'x-role': 'admin',
          'x-actor-type': 'admin',
          'x-actor-id': 'sgm-prototype',
        },
        body: JSON.stringify({
          query,
          options: {
            limit,
            vectorWeight,
            keywordWeight,
            minScore,
            filePatterns,
            fileTypes,
            chunkTypes,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spine search error (${response.status}): ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();

      if (this.debug) {
        console.log(`[AICR Client] Spine search returned ${data.count} results`);
      }

      return data as SpineSearchResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Spine search timeout after 30s');
      }
      throw error;
    }
  }

  /**
   * Build RAG context from spine search results
   * Formats results as markdown for LLM system prompt
   */
  formatSpineResultsAsRAG(results: SpineSearchResult[]): string {
    if (!results.length) {
      return '## Retrieved Knowledge\nNo relevant content found in knowledge base.';
    }

    const chunks = results.map((r, i) => {
      const source = r.filePath.split('/').pop() || r.filePath;
      const score = (r.scores.combined * 100).toFixed(0);
      return `### [${i + 1}] ${source} (relevance: ${score}%)
${r.content.slice(0, 800)}${r.content.length > 800 ? '...' : ''}`;
    });

    return `## Retrieved Knowledge (${results.length} chunks)
${chunks.join('\n\n')}`;
  }
}

// Singleton instance
let aicrClient: AICRClient | null = null;

/**
 * Get or create AICR client singleton
 */
export function getAICRClient(config?: AICRClientConfig): AICRClient {
  if (!aicrClient) {
    aicrClient = new AICRClient(config);
  }
  return aicrClient;
}

/**
 * Check if AICR is configured
 */
export function isAICRConfigured(): boolean {
  return !!process.env.AICR_API_URL;
}

/**
 * Convenience function for SGM governance queries
 */
export async function askGovernance(
  message: string,
  context?: AskSGMRequest['context'],
  options?: { intent?: AskSGMRequest['intent']; escalate?: boolean }
): Promise<AskSGMResponse> {
  const client = getAICRClient();
  return client.askSGM({
    message,
    domain: 'sgm',
    intent: options?.intent,
    context,
    escalate: options?.escalate,
  });
}

// ============================================================================
// AICR Telemetry API (for Ops and Pulse orbs)
// ============================================================================

export type TelemetrySignalType = 'OPS' | 'PULSE' | 'AI_TEL' | 'ALL';

export interface TelemetrySignal {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  suggestedAction?: string;
}

export interface TelemetryResponse {
  signals: TelemetrySignal[];
  count: number;
  timestamp: string;
}

/**
 * Fetch telemetry signals from AICR platform
 * @param signalType - OPS, PULSE, AI_TEL, or ALL
 * @param limit - Maximum number of signals to return
 */
export async function fetchTelemetry(
  signalType: TelemetrySignalType = 'ALL',
  limit: number = 20
): Promise<TelemetryResponse> {
  const apiUrl = process.env.AICR_API_URL || process.env.NEXT_PUBLIC_AICR_API_BASE || 'http://localhost:3000';

  try {
    const response = await fetch(
      `${apiUrl}/api/aicc/telemetry?signals=${signalType}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      // Return empty on error - orbs handle this gracefully
      return { signals: [], count: 0, timestamp: new Date().toISOString() };
    }

    const data = await response.json();
    return {
      signals: data.signals || data.data || [],
      count: data.count || data.signals?.length || 0,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch {
    // Return empty on network error - orbs handle this gracefully
    return { signals: [], count: 0, timestamp: new Date().toISOString() };
  }
}

/**
 * Fetch OPS signals (anomalies, thresholds, drift)
 */
export async function fetchOpsSignals(limit: number = 20): Promise<TelemetryResponse> {
  return fetchTelemetry('OPS', limit);
}

/**
 * Fetch PULSE signals (recommendations, learning, actions)
 */
export async function fetchPulseSignals(limit: number = 10): Promise<TelemetryResponse> {
  return fetchTelemetry('PULSE', limit);
}
