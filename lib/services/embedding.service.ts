/**
 * Embedding Service for SGM
 * Supports OpenAI text-embedding-3-small with 768-dim output
 */

// Target 768 dimensions for pgvector (matches nomic-embed-text)
const TARGET_DIMENSIONS = 768;

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  dimensions: number;
  tokenCount?: number;
}

/**
 * Generate embeddings using OpenAI text-embedding-3-small
 * Uses 768 dimensions to match database schema
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY required for embeddings');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: TARGET_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(error.error?.message || `OpenAI embedding failed: ${response.status}`);
  }

  const data = await response.json() as {
    model: string;
    data: Array<{ embedding: number[]; index: number }>;
    usage: { total_tokens: number };
  };

  return {
    embeddings: data.data.map(d => d.embedding),
    model: 'text-embedding-3-small',
    dimensions: TARGET_DIMENSIONS,
    tokenCount: data.usage?.total_tokens,
  };
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await generateEmbeddings([text]);
  return result.embeddings[0];
}

/**
 * Format embedding as pgvector-compatible string
 */
export function embeddingToVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Pad or truncate embedding to target dimensions
 */
export function normalizeEmbedding(embedding: number[], targetDims: number = TARGET_DIMENSIONS): number[] {
  if (embedding.length === targetDims) {
    return embedding;
  }

  if (embedding.length > targetDims) {
    return embedding.slice(0, targetDims);
  }

  // Pad with zeros
  const padded = [...embedding];
  while (padded.length < targetDims) {
    padded.push(0);
  }
  return padded;
}

/**
 * Check if embeddings are configured
 */
export function isEmbeddingsConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
