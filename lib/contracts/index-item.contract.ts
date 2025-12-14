import { z } from 'zod';

/**
 * Index Item Contract - Search index entry (IndexItem pattern)
 *
 * Represents a searchable entity with indexed fields for full-text search.
 * Enables fast querying across all entities in the system.
 */
export const IndexItemSchema = z.object({
  // Identity
  id: z.string().cuid(),
  tenantId: z.string(),

  // Entity Reference
  entityType: z.string(), // e.g., "policy", "territory", "approval"
  entityId: z.string(),

  // Indexed Content
  title: z.string().min(1).max(200), // Primary searchable field
  description: z.string().max(2000).optional(), // Secondary searchable field
  content: z.string().optional(), // Full-text content (can be large)

  // Tags & Categories
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),

  // Status & Lifecycle
  status: z.string().optional(), // e.g., "draft", "published"
  effectiveDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),

  // Ownership
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),

  // Search Metadata
  searchableText: z.string().optional(), // Concatenated text for full-text search
  boost: z.number().min(0).default(1.0), // Search ranking boost (0-∞)

  // Index Metadata
  indexedAt: z.coerce.date(),
  lastUpdatedAt: z.coerce.date(),

  // Additional Metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

export type IndexItem = z.infer<typeof IndexItemSchema>;

/**
 * Create Index Item
 */
export const CreateIndexItemSchema = IndexItemSchema.omit({
  id: true,
  indexedAt: true,
  searchableText: true, // Auto-generated
});

export type CreateIndexItem = z.infer<typeof CreateIndexItemSchema>;

/**
 * Update Index Item
 */
export const UpdateIndexItemSchema = IndexItemSchema.partial().required({
  id: true,
  lastUpdatedAt: true,
});

export type UpdateIndexItem = z.infer<typeof UpdateIndexItemSchema>;

/**
 * Search Query
 */
export const SearchQuerySchema = z.object({
  // Query String
  query: z.string().min(1).max(500),

  // Filters
  tenantId: z.string().optional(),
  entityTypes: z.array(z.string()).optional(), // Filter by entity type
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
  ownerId: z.string().optional(),

  // Date Ranges
  effectiveAfter: z.coerce.date().optional(),
  effectiveBefore: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),

  // Sorting
  sortBy: z.enum(['relevance', 'date', 'title']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Highlighting
  highlight: z.boolean().default(false),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/**
 * Search Result
 */
export const SearchResultSchema = z.object({
  item: IndexItemSchema,
  score: z.number().min(0), // Relevance score
  highlights: z.array(z.string()).optional(), // Highlighted snippets
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * Search Response
 */
export const SearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(SearchResultSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  executionTimeMs: z.number(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

/**
 * Aggregation Bucket (for faceted search)
 */
export const AggregationBucketSchema = z.object({
  key: z.string(),
  count: z.number().int(),
});

export type AggregationBucket = z.infer<typeof AggregationBucketSchema>;

/**
 * Search Aggregations (facets)
 */
export const SearchAggregationsSchema = z.object({
  entityTypes: z.array(AggregationBucketSchema),
  categories: z.array(AggregationBucketSchema),
  tags: z.array(AggregationBucketSchema),
  statuses: z.array(AggregationBucketSchema),
});

export type SearchAggregations = z.infer<typeof SearchAggregationsSchema>;
