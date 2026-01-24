/**
 * Live Search Provider - PostgreSQL full-text search implementation
 *
 * Uses Prisma `contains` queries across policies, documents, and governance frameworks
 * rather than a dedicated search index table. Index/batch/remove operations are no-ops
 * since the real data is always queried directly from source tables.
 */

import type { ISearchPort } from '@/lib/ports/search.port';
import type {
  IndexItem,
  CreateIndexItem,
  UpdateIndexItem,
  SearchQuery,
  SearchResponse,
  SearchAggregations,
} from '@/lib/contracts/index-item.contract';
import { getPrismaClient } from '@/lib/db/prisma';

/**
 * Convert a source record to an IndexItem shape
 */
function toIndexItem(
  entityType: string,
  record: any,
  tenantId: string
): IndexItem {
  return {
    id: `${entityType}-${record.id}`,
    tenantId,
    entityType,
    entityId: record.id,
    title: record.name || record.title || '',
    description: record.description || undefined,
    content: record.content || undefined,
    tags: record.tags || [],
    category: record.category || record.type || undefined,
    status: record.status || undefined,
    effectiveDate: record.effectiveDate || undefined,
    expirationDate: record.expirationDate || undefined,
    ownerId: record.createdBy || undefined,
    ownerName: undefined,
    searchableText: [record.name, record.title, record.description, record.content]
      .filter(Boolean)
      .join(' '),
    boost: 1.0,
    indexedAt: record.createdAt || new Date(),
    lastUpdatedAt: record.updatedAt || record.createdAt || new Date(),
    metadata: record.metadata || undefined,
  };
}

export class LiveSearchProvider implements ISearchPort {
  private prisma = getPrismaClient();

  /**
   * No-op: live search queries source tables directly
   */
  async index(data: CreateIndexItem): Promise<IndexItem> {
    return {
      id: `${data.entityType}-${data.entityId}`,
      tenantId: data.tenantId,
      entityType: data.entityType,
      entityId: data.entityId,
      title: data.title,
      description: data.description,
      content: data.content,
      tags: data.tags || [],
      category: data.category,
      status: data.status,
      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      searchableText: [data.title, data.description, data.content].filter(Boolean).join(' '),
      boost: data.boost || 1.0,
      indexedAt: new Date(),
      lastUpdatedAt: data.lastUpdatedAt || new Date(),
      metadata: data.metadata,
    };
  }

  /**
   * No-op: live search queries source tables directly
   */
  async indexBatch(items: CreateIndexItem[]): Promise<IndexItem[]> {
    return Promise.all(items.map((item) => this.index(item)));
  }

  /**
   * No-op: live search queries source tables directly
   */
  async updateIndex(data: UpdateIndexItem): Promise<IndexItem> {
    return {
      id: data.id,
      tenantId: data.tenantId || '',
      entityType: data.entityType || '',
      entityId: data.entityId || '',
      title: data.title || '',
      description: data.description,
      content: data.content,
      tags: data.tags || [],
      category: data.category,
      status: data.status,
      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      searchableText: [data.title, data.description, data.content].filter(Boolean).join(' '),
      boost: data.boost || 1.0,
      indexedAt: data.indexedAt || new Date(),
      lastUpdatedAt: data.lastUpdatedAt,
      metadata: data.metadata,
    };
  }

  /**
   * No-op: live search queries source tables directly
   */
  async removeFromIndex(entityType: string, entityId: string): Promise<void> {
    // No-op - data lives in source tables
  }

  /**
   * No-op: just re-creates the index item
   */
  async reindex(entityType: string, entityId: string, data: CreateIndexItem): Promise<IndexItem> {
    return this.index(data);
  }

  /**
   * No-op: returns 0 since there's no separate index to rebuild
   */
  async reindexAll(tenantId: string, entityType: string): Promise<number> {
    return 0;
  }

  /**
   * Search across policies, documents, and governance frameworks
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    const results: IndexItem[] = [];

    const searchText = query.query;
    const tenantWhere: any = query.tenantId ? { tenantId: query.tenantId } : {};
    const entityTypes = query.entityTypes || ['policy', 'document', 'governanceFramework'];

    // Search Policies
    if (entityTypes.includes('policy')) {
      try {
        const policies = await this.prisma.policy.findMany({
          where: {
            ...tenantWhere,
            OR: [
              { name: { contains: searchText, mode: 'insensitive' } },
              { description: { contains: searchText, mode: 'insensitive' } },
              { content: { contains: searchText, mode: 'insensitive' } },
            ],
          },
          take: query.limit || 20,
        });
        for (const p of policies) {
          results.push(toIndexItem('policy', p, p.tenantId));
        }
      } catch {
        // Policy table may not exist, skip
      }
    }

    // Search Documents
    if (entityTypes.includes('document')) {
      try {
        const documents = await this.prisma.document.findMany({
          where: {
            ...tenantWhere,
            OR: [
              { name: { contains: searchText, mode: 'insensitive' } },
              { description: { contains: searchText, mode: 'insensitive' } },
            ],
          },
          take: query.limit || 20,
        });
        for (const d of documents) {
          results.push(toIndexItem('document', d, d.tenantId));
        }
      } catch {
        // Document table may not exist, skip
      }
    }

    // Search Governance Frameworks
    if (entityTypes.includes('governanceFramework')) {
      try {
        const frameworks = await this.prisma.governanceFramework.findMany({
          where: {
            ...tenantWhere,
            OR: [
              { name: { contains: searchText, mode: 'insensitive' } },
              { description: { contains: searchText, mode: 'insensitive' } },
            ],
          },
          take: query.limit || 20,
        });
        for (const f of frameworks) {
          results.push(toIndexItem('governanceFramework', f, f.tenantId));
        }
      } catch {
        // GovernanceFramework table may not exist, skip
      }
    }

    // Apply status filter
    let filtered = results;
    if (query.status) {
      filtered = filtered.filter((item) => item.status === query.status);
    }
    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter((item) => item.category && query.categories!.includes(item.category));
    }

    // Sort
    if (query.sortBy === 'title') {
      filtered.sort((a, b) =>
        query.sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );
    } else if (query.sortBy === 'date') {
      filtered.sort((a, b) =>
        query.sortOrder === 'asc'
          ? new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime()
          : new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
      );
    }

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const paged = filtered.slice(offset, offset + limit);

    const executionTimeMs = Date.now() - startTime;

    return {
      query: query.query,
      results: paged.map((item, idx) => ({
        item,
        score: 1.0 - idx * 0.01, // Simple descending score
        highlights: query.highlight
          ? [item.title, item.description].filter(Boolean) as string[]
          : undefined,
      })),
      total: filtered.length,
      limit,
      offset,
      executionTimeMs,
    };
  }

  /**
   * Suggest search terms based on prefix matching
   */
  async suggest(tenantId: string, prefix: string, limit: number = 10): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      const policies = await this.prisma.policy.findMany({
        where: {
          tenantId,
          name: { contains: prefix, mode: 'insensitive' },
        },
        select: { name: true },
        take: limit,
      });
      suggestions.push(...policies.map((p: any) => p.name));
    } catch {
      // Skip if table doesn't exist
    }

    try {
      const documents = await this.prisma.document.findMany({
        where: {
          tenantId,
          name: { contains: prefix, mode: 'insensitive' },
        },
        select: { name: true },
        take: limit,
      });
      suggestions.push(...documents.map((d: any) => d.name));
    } catch {
      // Skip if table doesn't exist
    }

    // Deduplicate and limit
    return [...new Set(suggestions)].slice(0, limit);
  }

  /**
   * Get aggregation counts by entity type, category, and status
   */
  async getAggregations(tenantId: string, query?: string): Promise<SearchAggregations> {
    const entityTypes: Array<{ key: string; count: number }> = [];
    const categories: Array<{ key: string; count: number }> = [];
    const statuses: Array<{ key: string; count: number }> = [];

    try {
      const policyCount = await this.prisma.policy.count({ where: { tenantId } });
      if (policyCount > 0) entityTypes.push({ key: 'policy', count: policyCount });

      const policyStatuses = await this.prisma.policy.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      });
      for (const s of policyStatuses) {
        statuses.push({ key: s.status, count: (s as any)._count.status });
      }

      const policyCategories = await this.prisma.policy.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: { category: true },
      });
      for (const c of policyCategories) {
        if (c.category) categories.push({ key: c.category, count: (c as any)._count.category });
      }
    } catch {
      // Skip if table doesn't exist
    }

    try {
      const docCount = await this.prisma.document.count({ where: { tenantId } });
      if (docCount > 0) entityTypes.push({ key: 'document', count: docCount });
    } catch {
      // Skip if table doesn't exist
    }

    try {
      const fwCount = await this.prisma.governanceFramework.count({ where: { tenantId } });
      if (fwCount > 0) entityTypes.push({ key: 'governanceFramework', count: fwCount });
    } catch {
      // Skip if table doesn't exist
    }

    return {
      entityTypes,
      categories,
      tags: [], // Tags require a separate index
      statuses,
    };
  }

  /**
   * Find an indexed item by entity type and ID
   */
  async findByEntity(entityType: string, entityId: string): Promise<IndexItem | null> {
    try {
      let record: any = null;

      if (entityType === 'policy') {
        record = await this.prisma.policy.findUnique({ where: { id: entityId } });
      } else if (entityType === 'document') {
        record = await this.prisma.document.findUnique({ where: { id: entityId } });
      } else if (entityType === 'governanceFramework') {
        record = await this.prisma.governanceFramework.findUnique({ where: { id: entityId } });
      }

      if (!record) return null;
      return toIndexItem(entityType, record, record.tenantId);
    } catch {
      return null;
    }
  }

  /**
   * Find all indexed items for an entity type
   */
  async findByEntityType(tenantId: string, entityType: string): Promise<IndexItem[]> {
    try {
      let records: any[] = [];

      if (entityType === 'policy') {
        records = await this.prisma.policy.findMany({ where: { tenantId } });
      } else if (entityType === 'document') {
        records = await this.prisma.document.findMany({ where: { tenantId } });
      } else if (entityType === 'governanceFramework') {
        records = await this.prisma.governanceFramework.findMany({ where: { tenantId } });
      }

      return records.map((r: any) => toIndexItem(entityType, r, tenantId));
    } catch {
      return [];
    }
  }

  /**
   * Count all searchable entities
   */
  async count(tenantId: string): Promise<number> {
    let total = 0;

    try {
      total += await this.prisma.policy.count({ where: { tenantId } });
    } catch { /* skip */ }

    try {
      total += await this.prisma.document.count({ where: { tenantId } });
    } catch { /* skip */ }

    try {
      total += await this.prisma.governanceFramework.count({ where: { tenantId } });
    } catch { /* skip */ }

    return total;
  }

  /**
   * Count searchable entities by type
   */
  async countByEntityType(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    try {
      counts.policy = await this.prisma.policy.count({ where: { tenantId } });
    } catch { /* skip */ }

    try {
      counts.document = await this.prisma.document.count({ where: { tenantId } });
    } catch { /* skip */ }

    try {
      counts.governanceFramework = await this.prisma.governanceFramework.count({ where: { tenantId } });
    } catch { /* skip */ }

    return counts;
  }

  /**
   * No-op: cannot clear source data via search interface
   */
  async clearIndex(tenantId: string): Promise<number> {
    // No-op - live search doesn't maintain a separate index
    return 0;
  }
}
