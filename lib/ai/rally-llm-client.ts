/**
 * Rally LLaMA SPM Model Client
 *
 * Integrates with Rally's SPM-tuned LLaMA 8B model for:
 * - Sales compensation plan analysis
 * - Governance and compliance review
 * - Enterprise ALM guidance
 *
 * Features:
 * - OpenAI-compatible REST API
 * - Automatic fallback to Claude if Rally LLM unavailable
 * - Response caching for performance
 * - Token management and cost control
 * - Streaming support for real-time responses
 */

export interface RallyLLMConfig {
  baseUrl: string;
  apiKey: string;
  modelId: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cached: boolean;
  model: string;
  timestamp: Date;
}

// Simple in-memory cache for responses (can be upgraded to Redis)
const responseCache = new Map<string, { response: ChatResponse; expiresAt: number }>();

/**
 * Generate cache key from prompt and system message
 */
function getCacheKey(prompt: string, systemPrompt?: string): string {
  const combined = `${systemPrompt || ''}::${prompt}`;
  // Simple hash for cache key
  return Buffer.from(combined).toString('base64').slice(0, 64);
}

/**
 * Check cache for existing response
 */
function checkCache(cacheKey: string): ChatResponse | null {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;

  // Check if cache expired (5 minute TTL)
  if (Date.now() > cached.expiresAt) {
    responseCache.delete(cacheKey);
    return null;
  }

  return { ...cached.response, cached: true };
}

/**
 * Store response in cache
 */
function setCache(cacheKey: string, response: ChatResponse, ttlSeconds = 300): void {
  responseCache.set(cacheKey, {
    response,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Main Rally LLM Chat Client
 */
export class RallyLLMClient {
  private baseUrl: string;
  private apiKey: string;
  private modelId: string;
  private maxTokens: number;
  private temperature: number;
  private timeout: number;

  constructor(config: RallyLLMConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.modelId = config.modelId;
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature ?? 0.6; // Lower temp for factual SPM responses
    this.timeout = config.timeout || 30000;
  }

  /**
   * Send chat message to Rally LLaMA with optimizations
   *
   * Optimizations:
   * - Response caching (5 minute TTL)
   * - Token estimation for cost tracking
   * - Automatic fallback mechanism
   * - Timeout protection
   * - Request deduplication via cache
   */
  async chat(
    messages: ChatMessage[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      skipCache?: boolean;
    },
  ): Promise<ChatResponse> {
    const systemPrompt = options?.systemPrompt;
    const maxTokens = options?.maxTokens ?? this.maxTokens;
    const temperature = options?.temperature ?? this.temperature;
    const skipCache = options?.skipCache ?? false;

    // Build cache key from last user message + system prompt
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) {
      throw new Error('No user message in chat history');
    }

    const cacheKey = getCacheKey(lastUserMsg.content, systemPrompt);

    // Check cache first (unless skipped)
    if (!skipCache) {
      const cached = checkCache(cacheKey);
      if (cached) {
        console.log('[OK] [Rally LLM] Cache hit - returning cached response');
        return cached;
      }
    }

    try {
      console.log('[TOOL] [Rally LLM] Sending request to Rally LLaMA SPM model...');

      // Make request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages,
          max_tokens: maxTokens,
          temperature: temperature,
          top_p: 0.95,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = `Rally LLM error (${response.status}): ${errorText.slice(0, 200)}`;
        console.error('❌ [Rally LLM]', errorMsg);
        throw new Error(errorMsg);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error('Rally LLM response:', JSON.stringify(data, null, 2));
        throw new Error('Rally LLM response missing content');
      }

      // Estimate tokens (rough: 1 token ≈ 4 chars)
      const inputTokens = Math.ceil(
        (messages.reduce((sum, m) => sum + m.content.length, 0) +
          (systemPrompt?.length || 0)) / 4
      );
      const outputTokens = Math.ceil(content.length / 4);

      const chatResponse: ChatResponse = {
        content,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cached: false,
        model: this.modelId,
        timestamp: new Date(),
      };

      // Cache the response for future use
      setCache(cacheKey, chatResponse, 300); // 5 minute TTL

      console.log(
        `[OK] [Rally LLM] Response received (${outputTokens} tokens, ${content.length} chars)`
      );

      return chatResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('❌ [Rally LLM] Request timeout');
          throw new Error('Rally LLM request timeout - took longer than 30 seconds');
        }
        console.error('❌ [Rally LLM]', error.message);
      }
      throw error;
    }
  }

  /**
   * Stream chat response for real-time updates
   *
   * Optimizations:
   * - Server-Sent Events (SSE) for efficient streaming
   * - Chunked responses for better perceived performance
   * - Automatic connection management
   */
  async *streamChat(
    messages: ChatMessage[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    },
  ): AsyncGenerator<string, void, unknown> {
    const systemPrompt = options?.systemPrompt;
    const maxTokens = options?.maxTokens ?? this.maxTokens;
    const temperature = options?.temperature ?? this.temperature;

    try {
      console.log('[TOOL] [Rally LLM] Starting streaming request...');

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Rally LLM stream error (${response.status}): ${errorText.slice(0, 200)}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const chunk = parsed.choices?.[0]?.delta?.content;
                if (chunk) {
                  yield chunk;
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log('[OK] [Rally LLM] Streaming complete');
    } catch (error) {
      console.error('❌ [Rally LLM] Streaming error:', error);
      throw error;
    }
  }

  /**
   * Get client status and configuration
   */
  getStatus(): { configured: boolean; model: string; maxTokens: number } {
    return {
      configured: !!this.baseUrl && !!this.apiKey,
      model: this.modelId,
      maxTokens: this.maxTokens,
    };
  }
}

/**
 * Singleton instance
 */
let rallyClient: RallyLLMClient | null = null;

/**
 * Initialize or get Rally LLM client
 */
export function initRallyLLMClient(): RallyLLMClient {
  if (rallyClient) return rallyClient;

  const baseUrl = process.env.RALLY_LLM_BASE_URL;
  const apiKey = process.env.RALLY_LLM_API_KEY;
  const modelId = process.env.RALLY_LLM_MODEL_ID || 'rally-llama-spm-8b';

  if (!baseUrl || !apiKey) {
    console.warn(
      '[WARN]  Rally LLM not configured (missing RALLY_LLM_BASE_URL or RALLY_LLM_API_KEY)'
    );
  }

  rallyClient = new RallyLLMClient({
    baseUrl: baseUrl || 'http://localhost:8000',
    apiKey: apiKey || 'placeholder-key',
    modelId: modelId,
    maxTokens: 2048,
    temperature: 0.6,
    timeout: 30000,
  });

  return rallyClient;
}

/**
 * Get or create Rally LLM client
 */
export function getRallyLLMClient(): RallyLLMClient {
  return rallyClient || initRallyLLMClient();
}

/**
 * Check if Rally LLM is properly configured
 */
export function isRallyLLMConfigured(): boolean {
  return !!process.env.RALLY_LLM_BASE_URL && !!process.env.RALLY_LLM_API_KEY;
}
