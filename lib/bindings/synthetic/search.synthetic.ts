import type { ISearchPort } from '@/lib/ports/search.port';
import type {
  IndexItem,
  CreateIndexItem,
  UpdateIndexItem,
  SearchQuery,
  SearchResponse,
  SearchAggregations,
} from '@/lib/contracts/index-item.contract';

export class SyntheticSearchProvider implements ISearchPort {
  private searchIndex: Map<string, IndexItem>;

  constructor() {
    this.searchIndex = new Map();
  }

  async index(data: CreateIndexItem): Promise<IndexItem> {
    const item: IndexItem = {
      ...data,
      id: `idx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      searchableText: this.buildSearchableText(data),
      indexedAt: new Date(),
    };

    this.searchIndex.set(item.id, item);
    return item;
  }

  async indexBatch(items: CreateIndexItem[]): Promise<IndexItem[]> {
    return Promise.all(items.map((i) => this.index(i)));
  }

  async updateIndex(data: UpdateIndexItem): Promise<IndexItem> {
    const existing = this.searchIndex.get(data.id);
    if (!existing) throw new Error(`IndexItem ${data.id} not found`);

    const updated: IndexItem = {
      ...existing,
      ...data,
      searchableText: this.buildSearchableText(data),
    };

    this.searchIndex.set(updated.id, updated);
    return updated;
  }

  async removeFromIndex(entityType: string, entityId: string): Promise<void> {
    const items = Array.from(this.searchIndex.values()).filter(
      (i) => i.entityType === entityType && i.entityId === entityId
    );

    items.forEach((i) => this.searchIndex.delete(i.id));
  }

  async reindex(
    entityType: string,
    entityId: string,
    data: CreateIndexItem
  ): Promise<IndexItem> {
    await this.removeFromIndex(entityType, entityId);
    return this.index(data);
  }

  async reindexAll(tenantId: string, entityType: string): Promise<number> {
    // Synthetic mode: no-op
    return 0;
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();

    let results = Array.from(this.searchIndex.values());

    // Apply filters
    if (query.tenantId) {
      results = results.filter((i) => i.tenantId === query.tenantId);
    }
    if (query.entityTypes) {
      results = results.filter((i) => query.entityTypes!.includes(i.entityType));
    }
    if (query.categories) {
      results = results.filter((i) => query.categories!.includes(i.category || ''));
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter((i) => query.tags!.some((t) => i.tags.includes(t)));
    }
    if (query.status) {
      results = results.filter((i) => i.status === query.status);
    }
    if (query.ownerId) {
      results = results.filter((i) => i.ownerId === query.ownerId);
    }
    if (query.effectiveAfter) {
      results = results.filter((i) => i.effectiveDate && i.effectiveDate >= query.effectiveAfter!);
    }
    if (query.effectiveBefore) {
      results = results.filter(
        (i) => i.effectiveDate && i.effectiveDate <= query.effectiveBefore!
      );
    }

    // Full-text search (simple implementation)
    const searchQuery = query.query.toLowerCase();
    const scored = results
      .map((item) => {
        const text = item.searchableText || '';
        const matches = (text.toLowerCase().match(new RegExp(searchQuery, 'gi')) || []).length;
        const score = matches * (item.boost || 1.0);

        return {
          item,
          score,
          highlights: this.extractHighlights(text, searchQuery),
        };
      })
      .filter((r) => r.score > 0);

    // Sort by relevance or date
    if (query.sortBy === 'relevance') {
      scored.sort((a, b) => b.score - a.score);
    } else if (query.sortBy === 'date') {
      scored.sort((a, b) => b.item.lastUpdatedAt.getTime() - a.item.lastUpdatedAt.getTime());
    } else if (query.sortBy === 'title') {
      scored.sort((a, b) => a.item.title.localeCompare(b.item.title));
    }

    if (query.sortOrder === 'asc') {
      scored.reverse();
    }

    // Pagination
    const total = scored.length;
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const paginated = scored.slice(offset, offset + limit);

    const executionTimeMs = Date.now() - startTime;

    return {
      query: query.query,
      results: paginated,
      total,
      limit,
      offset,
      executionTimeMs,
    };
  }

  async suggest(tenantId: string, prefix: string, limit: number = 10): Promise<string[]> {
    const items = Array.from(this.searchIndex.values()).filter((i) => i.tenantId === tenantId);

    const suggestions = new Set<string>();

    items.forEach((item) => {
      if (item.title.toLowerCase().startsWith(prefix.toLowerCase())) {
        suggestions.add(item.title);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  async getAggregations(tenantId: string, query?: string): Promise<SearchAggregations> {
    let items = Array.from(this.searchIndex.values()).filter((i) => i.tenantId === tenantId);

    if (query) {
      const searchQuery = query.toLowerCase();
      items = items.filter((i) =>
        (i.searchableText || '').toLowerCase().includes(searchQuery)
      );
    }

    const entityTypes: Map<string, number> = new Map();
    const categories: Map<string, number> = new Map();
    const tags: Map<string, number> = new Map();
    const statuses: Map<string, number> = new Map();

    items.forEach((item) => {
      entityTypes.set(item.entityType, (entityTypes.get(item.entityType) || 0) + 1);
      if (item.category) {
        categories.set(item.category, (categories.get(item.category) || 0) + 1);
      }
      item.tags.forEach((tag) => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
      if (item.status) {
        statuses.set(item.status, (statuses.get(item.status) || 0) + 1);
      }
    });

    return {
      entityTypes: Array.from(entityTypes.entries()).map(([key, count]) => ({ key, count })),
      categories: Array.from(categories.entries()).map(([key, count]) => ({ key, count })),
      tags: Array.from(tags.entries()).map(([key, count]) => ({ key, count })),
      statuses: Array.from(statuses.entries()).map(([key, count]) => ({ key, count })),
    };
  }

  async findByEntity(entityType: string, entityId: string): Promise<IndexItem | null> {
    const items = Array.from(this.searchIndex.values()).filter(
      (i) => i.entityType === entityType && i.entityId === entityId
    );

    return items[0] || null;
  }

  async findByEntityType(tenantId: string, entityType: string): Promise<IndexItem[]> {
    return Array.from(this.searchIndex.values()).filter(
      (i) => i.tenantId === tenantId && i.entityType === entityType
    );
  }

  async count(tenantId: string): Promise<number> {
    return Array.from(this.searchIndex.values()).filter((i) => i.tenantId === tenantId).length;
  }

  async countByEntityType(tenantId: string): Promise<Record<string, number>> {
    const items = Array.from(this.searchIndex.values()).filter((i) => i.tenantId === tenantId);

    const counts: Record<string, number> = {};
    items.forEach((i) => {
      counts[i.entityType] = (counts[i.entityType] || 0) + 1;
    });

    return counts;
  }

  async clearIndex(tenantId: string): Promise<number> {
    const items = Array.from(this.searchIndex.values()).filter((i) => i.tenantId === tenantId);

    items.forEach((i) => this.searchIndex.delete(i.id));

    return items.length;
  }

  // Helper methods

  private buildSearchableText(data: Partial<IndexItem>): string {
    const parts = [data.title || '', data.description || '', data.content || ''];
    return parts.filter(Boolean).join(' ');
  }

  private extractHighlights(text: string, query: string, snippetLength: number = 100): string[] {
    const regex = new RegExp(`(.{0,${snippetLength / 2}})(${query})(.{0,${snippetLength / 2}})`, 'gi');
    const matches = [...text.matchAll(regex)];

    return matches.slice(0, 3).map((m) => `...${m[1]}<mark>${m[2]}</mark>${m[3]}...`);
  }
}
