/**
 * Live Territory Provider - Prisma-backed implementation
 *
 * CRITICAL: Requires DATABASE_URL with &schema=sgm_summit_demo
 * Uses Prisma ORM for real database operations on isolated schema
 */

import type { ITerritoryPort } from '@/lib/ports/territory.port';
import type {
  Territory,
  CreateTerritory,
  UpdateTerritory,
  TerritoryFilters,
  TerritoryAssignment,
} from '@/lib/contracts/territory.contract';
import { getPrismaClient } from '@/lib/db/prisma';

export class LiveTerritoryProvider implements ITerritoryPort {
  private prisma = getPrismaClient();

  async findAll(filters?: TerritoryFilters): Promise<Territory[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.parentTerritoryId) where.parentTerritoryId = filters.parentTerritoryId;
    if (filters?.assignedToUserId) where.assignedToUserId = filters.assignedToUserId;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const territories = await this.prisma.territory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return territories as Territory[];
  }

  async findById(id: string): Promise<Territory | null> {
    const territory = await this.prisma.territory.findUnique({
      where: { id },
    });

    return territory as Territory | null;
  }

  async findByStatus(tenantId: string, status: Territory['status']): Promise<Territory[]> {
    const territories = await this.prisma.territory.findMany({
      where: { tenantId, status },
      orderBy: { createdAt: 'desc' },
    });

    return territories as Territory[];
  }

  async findRoots(tenantId: string): Promise<Territory[]> {
    const territories = await this.prisma.territory.findMany({
      where: { tenantId, parentTerritoryId: null },
      orderBy: { name: 'asc' },
    });

    return territories as Territory[];
  }

  async findChildren(parentId: string): Promise<Territory[]> {
    const territories = await this.prisma.territory.findMany({
      where: { parentTerritoryId: parentId },
      orderBy: { name: 'asc' },
    });

    return territories as Territory[];
  }

  async findHierarchy(tenantId: string): Promise<Territory[]> {
    const territories = await this.prisma.territory.findMany({
      where: { tenantId },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });

    return territories as Territory[];
  }

  async findByAssignee(userId: string): Promise<Territory[]> {
    const territories = await this.prisma.territory.findMany({
      where: { assignedToUserId: userId },
      orderBy: { name: 'asc' },
    });

    return territories as Territory[];
  }

  async create(data: CreateTerritory): Promise<Territory> {
    const territory = await this.prisma.territory.create({
      data: {
        ...data,
        coverageRules: data.coverageRules ? JSON.parse(JSON.stringify(data.coverageRules)) : null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return territory as Territory;
  }

  async update(data: UpdateTerritory): Promise<Territory> {
    const { id, ...updates } = data;

    const territory = await this.prisma.territory.update({
      where: { id },
      data: {
        ...updates,
        coverageRules: updates.coverageRules ? JSON.parse(JSON.stringify(updates.coverageRules)) : undefined,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
        updatedAt: new Date(),
      },
    });

    return territory as Territory;
  }

  async assign(territoryId: string, userId: string, assignedBy: string): Promise<Territory> {
    const territory = await this.prisma.territory.update({
      where: { id: territoryId },
      data: {
        assignedToUserId: userId,
        assignedAt: new Date(),
        updatedBy: assignedBy,
        updatedAt: new Date(),
      },
    });

    return territory as Territory;
  }

  async unassign(territoryId: string, unassignedBy: string): Promise<Territory> {
    const territory = await this.prisma.territory.update({
      where: { id: territoryId },
      data: {
        assignedToUserId: null,
        assignedAt: null,
        updatedBy: unassignedBy,
        updatedAt: new Date(),
      },
    });

    return territory as Territory;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    // Soft delete: mark as archived
    await this.prisma.territory.update({
      where: { id },
      data: {
        status: 'archived',
        updatedBy: deletedBy,
        updatedAt: new Date(),
      },
    });
  }

  async getAssignmentHistory(territoryId: string): Promise<TerritoryAssignment[]> {
    // No dedicated assignment history table - return empty array
    // Future: implement via audit log or dedicated TerritoryAssignment model
    return [];
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.territory.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: { type: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);
  }
}
