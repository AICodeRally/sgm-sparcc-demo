/**
 * Live Link Provider - Stub implementation
 *
 * NOTE: There is no dedicated Link/SectionMapping Prisma model in the current schema.
 * This provider implements the ILinkPort interface but throws descriptive errors
 * indicating that a database migration is needed to add a `links` table.
 *
 * Once the migration is applied, this can be replaced with real Prisma queries.
 */

import type { ILinkPort } from '@/lib/ports/link.port';
import type {
  Link,
  CreateLink,
  LinkFilters,
  LinkGraph,
  CoverageMatrix,
} from '@/lib/contracts/link.contract';
import { getPrismaClient } from '@/lib/db/prisma';

class LinksMigrationRequiredError extends Error {
  constructor(method: string) {
    super(
      `LiveLinkProvider.${method}() is not available - requires a 'links' table migration. ` +
      `Run the migration to add the Link model to the Prisma schema before using live link operations.`
    );
    this.name = 'LinksMigrationRequiredError';
  }
}

export class LiveLinkProvider implements ILinkPort {
  private prisma = getPrismaClient();

  async findAll(filters?: LinkFilters): Promise<Link[]> {
    throw new LinksMigrationRequiredError('findAll');
  }

  async findById(id: string): Promise<Link | null> {
    throw new LinksMigrationRequiredError('findById');
  }

  async findFromSource(entityType: string, entityId: string): Promise<Link[]> {
    throw new LinksMigrationRequiredError('findFromSource');
  }

  async findToTarget(entityType: string, entityId: string): Promise<Link[]> {
    throw new LinksMigrationRequiredError('findToTarget');
  }

  async findBetween(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string
  ): Promise<Link[]> {
    throw new LinksMigrationRequiredError('findBetween');
  }

  async findByType(tenantId: string, linkType: Link['linkType']): Promise<Link[]> {
    throw new LinksMigrationRequiredError('findByType');
  }

  async create(data: CreateLink): Promise<Link> {
    throw new LinksMigrationRequiredError('create');
  }

  async createBatch(links: CreateLink[]): Promise<Link[]> {
    throw new LinksMigrationRequiredError('createBatch');
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    throw new LinksMigrationRequiredError('delete');
  }

  async deleteByEntity(entityType: string, entityId: string, deletedBy: string): Promise<number> {
    throw new LinksMigrationRequiredError('deleteByEntity');
  }

  async buildGraph(entityType: string, entityId: string, depth?: number): Promise<LinkGraph> {
    throw new LinksMigrationRequiredError('buildGraph');
  }

  async buildCoverageMatrix(
    rowEntityType: string,
    columnEntityType: string,
    tenantId: string
  ): Promise<CoverageMatrix> {
    throw new LinksMigrationRequiredError('buildCoverageMatrix');
  }

  async findOrphans(tenantId: string, entityType: string): Promise<string[]> {
    throw new LinksMigrationRequiredError('findOrphans');
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    throw new LinksMigrationRequiredError('countByType');
  }
}
