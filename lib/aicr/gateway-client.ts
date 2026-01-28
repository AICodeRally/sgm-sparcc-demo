/**
 * AICR Gateway Client
 *
 * Routes LLM requests through the AICR unified gateway (/api/v1/chat)
 * which provides:
 * - Per-tenant budget enforcement
 * - Rate limiting (60/min, 1000/hr defaults)
 * - Response caching (5 min TTL)
 * - Unified billing via Vercel AI Gateway
 *
 * Priority: AICR Gateway → Direct Claude API
 */

export interface GatewayChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GatewayChatRequest {
  model: string;
  messages: GatewayChatMessage[];
  temperature?: number;
  max_tokens?: number;
  skip_cache?: boolean;
}

export interface GatewayChatResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _cached?: boolean;
  _latencyMs?: number;
}

export interface GatewayBudgetStatus {
  tenantId: string;
  budget?: {
    limit: { dollars: number; mc: number };
    used: { dollars: number; mc: number };
    remaining: { dollars: number; mc: number };
    percentUsed: number;
  };
  rateLimit?: {
    limits: { requestsPerMinute: number; requestsPerHour: number };
    remaining: { perMinute: number; perHour: number };
  };
  cache?: {
    size: number;
    totalHits: number;
  };
}

/**
 * AICR Gateway Client
 */
export class AICRGatewayClient {
  private gatewayUrl: string;
  private apiKey: string;
  private tenantId: string;
  private timeout: number;
  private debug: boolean;

  constructor(config: {
    gatewayUrl?: string;
    apiKey?: string;
    tenantId?: string;
    timeout?: number;
    debug?: boolean;
  } = {}) {
    this.gatewayUrl = config.gatewayUrl || process.env.AICR_GATEWAY_URL || '';
    this.apiKey = config.apiKey || process.env.AICR_API_KEY || '';
    this.tenantId = config.tenantId || process.env.AICR_TENANT_ID || 'default';
    this.timeout = config.timeout || 120000; // 2 minutes
    this.debug = config.debug || false;
  }

  /**
   * Send chat request through AICR Gateway
   */
  async chat(request: GatewayChatRequest): Promise<GatewayChatResponse> {
    if (this.debug) {
      console.log(`[AICR Gateway] Sending ${request.model} request (${request.messages.length} messages)`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.gatewayUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Tenant-ID': this.tenantId,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const error = await response.json();
        const code = error.error?.code;
        if (code === 'BUDGET_EXCEEDED') {
          throw new Error(`AICR Gateway budget exceeded: ${error.error?.message}`);
        }
        if (code === 'RATE_LIMITED') {
          const retryAfter = response.headers.get('Retry-After') || '60';
          throw new Error(`AICR Gateway rate limited. Retry after ${retryAfter}s`);
        }
        throw new Error(`AICR Gateway error: ${JSON.stringify(error)}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AICR Gateway error (${response.status}): ${errorText.slice(0, 200)}`);
      }

      const data = await response.json() as GatewayChatResponse;

      // Log cache status
      const cacheHeader = response.headers.get('X-Cache');
      if (this.debug) {
        console.log(`[AICR Gateway] Response: ${data.usage?.total_tokens || 0} tokens, cache: ${cacheHeader || 'N/A'}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AICR Gateway timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Get budget status for current tenant
   */
  async getBudgetStatus(): Promise<GatewayBudgetStatus> {
    try {
      const response = await fetch(`${this.gatewayUrl}/api/v1/budget`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Tenant-ID': this.tenantId,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Budget status error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[AICR Gateway] Failed to get budget status:', error);
      return { tenantId: this.tenantId };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.gatewayUrl}/api/v1/chat`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let gatewayClient: AICRGatewayClient | null = null;

/**
 * Get or create gateway client singleton
 */
export function getAICRGatewayClient(config?: ConstructorParameters<typeof AICRGatewayClient>[0]): AICRGatewayClient {
  if (!gatewayClient) {
    gatewayClient = new AICRGatewayClient(config);
  }
  return gatewayClient;
}

/**
 * Check if AICR Gateway is configured
 */
export function isAICRGatewayConfigured(): boolean {
  return !!(process.env.AICR_GATEWAY_URL && process.env.AICR_API_KEY);
}

/**
 * Supported models via AICR Gateway
 */
export const GATEWAY_MODELS = {
  // OpenAI
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  // Anthropic
  'claude-sonnet-4': 'claude-sonnet-4',
  'claude-3-opus': 'claude-3-opus',
  'claude-3-sonnet': 'claude-3-sonnet',
  'claude-3-haiku': 'claude-3-haiku',
  // Aliases
  'claude-sonnet-4-20250514': 'claude-sonnet-4-20250514',
} as const;

export type GatewayModel = keyof typeof GATEWAY_MODELS;
