/**
 * Live Governance Framework Provider - Prisma-backed implementation
 *
 * Implements governance framework operations using Prisma ORM
 */

import type { IGovernanceFrameworkPort } from '@/lib/ports/governance-framework.port';
import type {
  GovernanceFramework,
  CreateGovernanceFramework,
  UpdateGovernanceFramework,
  GovernanceFrameworkFilters,
  GetApplicableFrameworks,
  ApplicableFramework,
  ImportGovernanceFramework,
  CreateFrameworkVersion,
} from '@/lib/contracts/governance-framework.contract';
import type { PlanType } from '@/lib/contracts/plan-template.contract';
import { getPrismaClient } from '@/lib/db/prisma';

/**
 * Helper to bump semantic version
 */
function bumpVersion(version: string, bumpType: 'major' | 'minor' | 'patch'): string {
  const [major, minor, patch] = version.split('.').map(Number);

  if (bumpType === 'major') {
    return `${major + 1}.0.0`;
  } else if (bumpType === 'minor') {
    return `${major}.${minor + 1}.0`;
  } else {
    return `${major}.${minor}.${patch + 1}`;
  }
}

export class LiveGovernanceFrameworkProvider implements IGovernanceFrameworkPort {
  private prisma = getPrismaClient();

  async findAll(filters?: GovernanceFrameworkFilters): Promise<GovernanceFramework[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.isGlobal !== undefined) where.isGlobal = filters.isGlobal;
    if (filters?.isMandatory !== undefined) where.isMandatory = filters.isMandatory;

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const frameworks = await this.prisma.governanceFramework.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return frameworks.map(this.mapToContract);
  }

  async findById(id: string): Promise<GovernanceFramework | null> {
    const framework = await this.prisma.governanceFramework.findUnique({
      where: { id },
    });

    return framework ? this.mapToContract(framework) : null;
  }

  async findByCode(code: string): Promise<GovernanceFramework | null> {
    const framework = await this.prisma.governanceFramework.findUnique({
      where: { code },
    });

    return framework ? this.mapToContract(framework) : null;
  }

  async create(data: CreateGovernanceFramework): Promise<GovernanceFramework> {
    const framework = await this.prisma.governanceFramework.create({
      data: {
        ...data,
        contentType: (data as any).contentType || 'markdown',
        structuredContent: (data as any).structuredContent || undefined,
        applicableTo: data.applicableTo || [],
      },
    });

    return this.mapToContract(framework);
  }

  async update(data: UpdateGovernanceFramework): Promise<GovernanceFramework> {
    const { id, ...updates } = data;

    const framework = await this.prisma.governanceFramework.update({
      where: { id },
      data: updates,
    });

    return this.mapToContract(framework);
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.governanceFramework.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.governanceFramework.delete({
      where: { id },
    });
  }

  async createVersion(data: CreateFrameworkVersion): Promise<GovernanceFramework> {
    const existing = await this.findById(data.frameworkId);
    if (!existing) {
      throw new Error(`Framework ${data.frameworkId} not found`);
    }

    const newVersion = bumpVersion(existing.version, data.bumpType);

    // Mark existing as superseded
    await this.update({
      id: data.frameworkId,
      status: 'SUPERSEDED',
    });

    // Create new version
    const newFramework = await this.create({
      tenantId: existing.tenantId,
      code: existing.code,
      title: data.changes.title || existing.title,
      category: data.changes.category || existing.category,
      content: data.changes.content || existing.content,
      contentType: existing.contentType || 'markdown',
      structuredContent: existing.structuredContent || null,
      version: newVersion,
      status: 'DRAFT',
      isGlobal: existing.isGlobal,
      isMandatory: existing.isMandatory,
      applicableTo: data.changes.applicableTo || existing.applicableTo,
      createdBy: data.createdBy,
    } as any);

    return newFramework;
  }

  async findVersions(frameworkId: string): Promise<GovernanceFramework[]> {
    const framework = await this.findById(frameworkId);
    if (!framework) return [];

    const versions = await this.prisma.governanceFramework.findMany({
      where: {
        tenantId: framework.tenantId,
        code: framework.code,
      },
      orderBy: { version: 'asc' },
    });

    return versions.map(this.mapToContract);
  }

  async findLatestVersion(code: string): Promise<GovernanceFramework | null> {
    const frameworks = await this.prisma.governanceFramework.findMany({
      where: { code },
      orderBy: { version: 'desc' },
      take: 1,
    });

    return frameworks[0] ? this.mapToContract(frameworks[0]) : null;
  }

  async getApplicableFrameworks(data: GetApplicableFrameworks): Promise<ApplicableFramework[]> {
    const where: any = {
      OR: [
        { tenantId: data.tenantId },
        { isGlobal: true },
      ],
      status: 'ACTIVE',
    };

    const frameworks = await this.prisma.governanceFramework.findMany({
      where,
    });

    // Filter by plan type
    const applicable = frameworks.filter((fw: any) => {
      const applicableTo = fw.applicableTo as string[];
      return applicableTo && applicableTo.includes(data.planType);
    });

    // Filter out optional frameworks if requested
    const filtered = data.includeOptional
      ? applicable
      : applicable.filter((fw: any) => fw.isMandatory);

    return filtered.map((fw: any) => ({
      frameworkCode: fw.code,
      title: fw.title,
      category: fw.category,
      mandatoryCompliance: fw.isMandatory,
      relevantSections: [],
      content: fw.content,
      version: fw.version,
    }));
  }

  async findByPlanType(planType: PlanType, tenantId: string): Promise<GovernanceFramework[]> {
    const where: any = {
      OR: [
        { tenantId },
        { isGlobal: true },
      ],
      status: 'ACTIVE',
    };

    const frameworks = await this.prisma.governanceFramework.findMany({
      where,
    });

    // Filter by plan type
    const filtered = frameworks.filter((fw: any) => {
      const applicableTo = fw.applicableTo as string[];
      return applicableTo && applicableTo.includes(planType);
    });

    return filtered.map(this.mapToContract);
  }

  async findMandatory(tenantId: string): Promise<GovernanceFramework[]> {
    const where: any = {
      OR: [
        { tenantId },
        { isGlobal: true },
      ],
      isMandatory: true,
      status: 'ACTIVE',
    };

    const frameworks = await this.prisma.governanceFramework.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return frameworks.map(this.mapToContract);
  }

  async findGlobal(): Promise<GovernanceFramework[]> {
    const frameworks = await this.prisma.governanceFramework.findMany({
      where: {
        isGlobal: true,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    return frameworks.map(this.mapToContract);
  }

  async importFromFiles(data: ImportGovernanceFramework): Promise<GovernanceFramework[]> {
    // TODO: Implement file import logic
    throw new Error('importFromFiles not yet implemented');
  }

  async exportAsMarkdown(frameworkId: string): Promise<string> {
    const framework = await this.findById(frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    return framework.content;
  }

  async bulkImport(frameworks: CreateGovernanceFramework[]): Promise<GovernanceFramework[]> {
    const created: GovernanceFramework[] = [];

    for (const data of frameworks) {
      const framework = await this.create(data);
      created.push(framework);
    }

    return created;
  }

  async search(query: string, tenantId: string): Promise<GovernanceFramework[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findByCategory(category: string, tenantId: string): Promise<GovernanceFramework[]> {
    const frameworks = await this.prisma.governanceFramework.findMany({
      where: {
        tenantId,
        category,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    return frameworks.map(this.mapToContract);
  }

  async countByCategory(tenantId: string): Promise<Record<string, number>> {
    const frameworks = await this.prisma.governanceFramework.findMany({
      where: {
        OR: [
          { tenantId },
          { isGlobal: true },
        ],
        status: 'ACTIVE',
      },
    });

    const counts: Record<string, number> = {};
    frameworks.forEach((fw: any) => {
      counts[fw.category] = (counts[fw.category] || 0) + 1;
    });

    return counts;
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const frameworks = await this.prisma.governanceFramework.findMany({
      where: {
        OR: [
          { tenantId },
          { isGlobal: true },
        ],
      },
    });

    const counts: Record<string, number> = {};
    frameworks.forEach((fw: any) => {
      counts[fw.status] = (counts[fw.status] || 0) + 1;
    });

    return counts;
  }

  async validatePlanCompliance(planId: string): Promise<{
    frameworkCode: string;
    frameworkTitle: string;
    isMandatory: boolean;
    issues: Array<{
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      message: string;
      sectionKey?: string;
    }>;
  }[]> {
    // TODO: Implement plan compliance validation
    return [];
  }

  /**
   * Map Prisma model to contract type
   */
  private mapToContract(framework: any): GovernanceFramework {
    return {
      id: framework.id,
      tenantId: framework.tenantId,
      code: framework.code,
      title: framework.title,
      category: framework.category,
      content: framework.content,
      contentType: framework.contentType || 'markdown',
      structuredContent: framework.structuredContent || null,
      version: framework.version,
      status: framework.status,
      isGlobal: framework.isGlobal,
      isMandatory: framework.isMandatory,
      applicableTo: framework.applicableTo as any[],
      createdBy: framework.createdBy,
      createdAt: framework.createdAt,
      updatedAt: framework.updatedAt,
    };
  }
}
