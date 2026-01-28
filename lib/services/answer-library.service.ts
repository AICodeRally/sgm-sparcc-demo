/**
 * Answer Library Service for SGM
 * Manages cached Q&A pairs with confidence scoring
 *
 * Note: This version uses JSON arrays for embeddings.
 * For production with high volume, upgrade to pgvector.
 */

import { prisma } from '@/lib/db/prisma';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AnswerLibraryConfig {
  similarityThreshold: number; // Default: 0.92
  minConfidence: number; // Default: 0.5
  embeddingDimensions: number; // Default: 768
}

const DEFAULT_CONFIG: AnswerLibraryConfig = {
  similarityThreshold: 0.92,
  minConfidence: 0.5,
  embeddingDimensions: 768,
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface LibraryMatch {
  id: string;
  queryText: string;
  answerText: string;
  sourcesJson: unknown;
  confidenceScore: number;
  similarity: number;
  useCount: number;
}

export interface SaveAnswerRequest {
  queryText: string;
  queryEmbedding: number[];
  answerText: string;
  sources: unknown[];
  embeddingModel: string;
  llmModel: string;
  llmProvider: string;
}

export interface LibraryStats {
  totalAnswers: number;
  activeAnswers: number;
  totalUses: number;
  avgConfidence: number;
}

// ============================================================================
// WILSON SCORE CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate confidence score using Wilson score interval
 *
 * The Wilson score provides a lower bound on the confidence interval
 * for a proportion. It's preferred over simple proportion (thumbsUp/total)
 * because it accounts for uncertainty with small sample sizes.
 */
export function calculateConfidence(thumbsUp: number, thumbsDown: number): number {
  const total = thumbsUp + thumbsDown;

  // No votes yet - assume full confidence
  if (total === 0) return 1.0;

  const p = thumbsUp / total;
  const z = 1.96; // 95% confidence interval

  const denominator = 1 + (z * z) / total;
  const center = p + (z * z) / (2 * total);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);

  // Wilson score lower bound
  const score = (center - spread) / denominator;

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    // Pad shorter array with zeros
    const maxLen = Math.max(a.length, b.length);
    while (a.length < maxLen) a.push(0);
    while (b.length < maxLen) b.push(0);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================================
// ANSWER LIBRARY FUNCTIONS
// ============================================================================

/**
 * Search the answer library for a semantically similar cached answer
 *
 * Uses cosine similarity on stored embeddings. Returns the best match
 * if it exceeds both the similarity threshold and minimum confidence.
 */
export async function searchAnswerLibrary(
  queryEmbedding: number[],
  threshold?: number,
  config: Partial<AnswerLibraryConfig> = {}
): Promise<LibraryMatch | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const similarityThreshold = threshold ?? finalConfig.similarityThreshold;

  // Get all active answers with embeddings
  const answers = await prisma.answerLibrary.findMany({
    where: {
      isActive: true,
      confidenceScore: { gte: finalConfig.minConfidence },
      queryEmbedding: { not: null },
    },
    select: {
      id: true,
      queryText: true,
      answerText: true,
      sourcesJson: true,
      confidenceScore: true,
      useCount: true,
      queryEmbedding: true,
    },
  });

  if (answers.length === 0) {
    return null;
  }

  // Find best match by cosine similarity
  let bestMatch: (typeof answers[0] & { similarity: number }) | null = null;

  for (const answer of answers) {
    const storedEmbedding = answer.queryEmbedding as number[];
    if (!storedEmbedding || !Array.isArray(storedEmbedding)) continue;

    const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);

    if (similarity >= similarityThreshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { ...answer, similarity };
      }
    }
  }

  if (!bestMatch) {
    return null;
  }

  // Increment use count
  await prisma.answerLibrary.update({
    where: { id: bestMatch.id },
    data: {
      useCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return {
    id: bestMatch.id,
    queryText: bestMatch.queryText,
    answerText: bestMatch.answerText,
    sourcesJson: bestMatch.sourcesJson,
    confidenceScore: Number(bestMatch.confidenceScore),
    similarity: bestMatch.similarity,
    useCount: bestMatch.useCount + 1,
  };
}

/**
 * Save a new answer to the library
 */
export async function saveToAnswerLibrary(request: SaveAnswerRequest): Promise<string> {
  const normalizedQuery = request.queryText.toLowerCase().trim();

  const answer = await prisma.answerLibrary.create({
    data: {
      queryText: request.queryText,
      queryEmbedding: request.queryEmbedding,
      normalizedQuery,
      answerText: request.answerText,
      sourcesJson: request.sources,
      embeddingModel: request.embeddingModel,
      llmModel: request.llmModel,
      llmProvider: request.llmProvider,
      confidenceScore: 1.0,
      useCount: 1,
      isActive: true,
    },
  });

  return answer.id;
}

/**
 * Update answer confidence based on user feedback
 */
export async function updateAnswerConfidence(
  answerLibraryId: string,
  feedbackType: 'thumbs_up' | 'thumbs_down'
): Promise<void> {
  const answer = await prisma.answerLibrary.findUnique({
    where: { id: answerLibraryId },
    select: {
      thumbsUpCount: true,
      thumbsDownCount: true,
    },
  });

  if (!answer) {
    throw new Error(`Answer library entry not found: ${answerLibraryId}`);
  }

  const newThumbsUp = feedbackType === 'thumbs_up'
    ? answer.thumbsUpCount + 1
    : answer.thumbsUpCount;
  const newThumbsDown = feedbackType === 'thumbs_down'
    ? answer.thumbsDownCount + 1
    : answer.thumbsDownCount;

  const newConfidence = calculateConfidence(newThumbsUp, newThumbsDown);

  // Deactivate if confidence < 0.3 with at least 5 votes
  const totalVotes = newThumbsUp + newThumbsDown;
  const shouldDeactivate = newConfidence < 0.3 && totalVotes >= 5;

  await prisma.answerLibrary.update({
    where: { id: answerLibraryId },
    data: {
      thumbsUpCount: newThumbsUp,
      thumbsDownCount: newThumbsDown,
      confidenceScore: newConfidence,
      isActive: shouldDeactivate ? false : undefined,
    },
  });
}

/**
 * Get statistics about the answer library
 */
export async function getLibraryStats(): Promise<LibraryStats> {
  const [total, active, aggregates] = await Promise.all([
    prisma.answerLibrary.count(),
    prisma.answerLibrary.count({ where: { isActive: true } }),
    prisma.answerLibrary.aggregate({
      _sum: { useCount: true },
      _avg: { confidenceScore: true },
      where: { isActive: true },
    }),
  ]);

  return {
    totalAnswers: total,
    activeAnswers: active,
    totalUses: aggregates._sum.useCount || 0,
    avgConfidence: aggregates._avg.confidenceScore || 1.0,
  };
}
