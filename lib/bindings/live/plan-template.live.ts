/**
 * Live Plan Template Provider - Prisma-backed implementation
 *
 * Implements plan template and template section operations using Prisma ORM
 */

import type { IPlanTemplatePort } from '@/lib/ports/plan-template.port';
import type {
  PlanTemplate,
  CreatePlanTemplate,
  UpdatePlanTemplate,
  ClonePlanTemplate,
  PlanTemplateFilters,
  TemplateUsageStats,
} from '@/lib/contracts/plan-template.contract';
import type {
  TemplateSection,
  CreateTemplateSection,
  UpdateTemplateSection,
  TemplateSectionTree,
  ReorderSections,
} from '@/lib/contracts/template-section.contract';
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

export class LivePlanTemplateProvider implements IPlanTemplatePort {
  private prisma = getPrismaClient();

  // =============================================================================
  // TEMPLATE CRUD
  // =============================================================================

  async findAll(filters?: PlanTemplateFilters): Promise<PlanTemplate[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.status) where.status = filters.status;
    if (filters?.planType) where.planType = filters.planType;
    if (filters?.isSystemTemplate !== undefined) where.isSystemTemplate = filters.isSystemTemplate;

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const templates = await this.prisma.planTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return templates as PlanTemplate[];
  }

  async findById(id: string): Promise<PlanTemplate | null> {
    const template = await this.prisma.planTemplate.findUnique({
      where: { id },
    });

    return template as PlanTemplate | null;
  }

  async findByCode(tenantId: string, code: string): Promise<PlanTemplate | null> {
    const template = await this.prisma.planTemplate.findFirst({
      where: { tenantId, code },
    });

    return template as PlanTemplate | null;
  }

  async create(data: CreatePlanTemplate): Promise<PlanTemplate> {
    const template = await this.prisma.planTemplate.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return template as PlanTemplate;
  }

  async update(data: UpdatePlanTemplate): Promise<PlanTemplate> {
    const { id, ...updates } = data;

    const template = await this.prisma.planTemplate.update({
      where: { id },
      data: {
        ...updates,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
        updatedAt: new Date(),
      },
    });

    return template as PlanTemplate;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.planTemplate.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    // Delete sections first, then template
    await this.prisma.templateSection.deleteMany({
      where: { templateId: id },
    });
    await this.prisma.planTemplate.delete({
      where: { id },
    });
  }

  // =============================================================================
  // VERSIONING
  // =============================================================================

  async createVersion(
    templateId: string,
    changes: Partial<PlanTemplate>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<PlanTemplate> {
    const existing = await this.findById(templateId);
    if (!existing) {
      throw new Error(`Template ${templateId} not found`);
    }

    const newVersion = bumpVersion(existing.version || '1.0.0', bumpType);

    // Mark existing as superseded
    await this.prisma.planTemplate.update({
      where: { id: templateId },
      data: {
        status: 'SUPERSEDED',
        updatedAt: new Date(),
      },
    });

    // Create new version
    const newTemplate = await this.prisma.planTemplate.create({
      data: {
        tenantId: existing.tenantId,
        code: existing.code,
        name: changes.name || existing.name,
        description: changes.description || existing.description,
        planType: existing.planType,
        version: newVersion,
        status: 'DRAFT',
        isSystemTemplate: existing.isSystemTemplate,
        createdBy: changes.createdBy || existing.createdBy,
        metadata: existing.metadata ? JSON.parse(JSON.stringify(existing.metadata)) : null,
      },
    });

    // Copy sections to new template
    const sections = await this.getSections(templateId);
    for (const section of sections) {
      await this.prisma.templateSection.create({
        data: {
          templateId: newTemplate.id,
          sectionKey: section.sectionKey,
          title: section.title,
          description: section.description,
          orderIndex: section.orderIndex,
          parentSectionId: null, // Will need re-mapping for nested sections
          isRequired: section.isRequired,
          contentTemplate: section.contentTemplate,
          fieldDefinitions: section.fieldDefinitions ? JSON.parse(JSON.stringify(section.fieldDefinitions)) : null,
          metadata: section.metadata ? JSON.parse(JSON.stringify(section.metadata)) : null,
        },
      });
    }

    return newTemplate as PlanTemplate;
  }

  async findVersions(templateId: string): Promise<PlanTemplate[]> {
    const template = await this.findById(templateId);
    if (!template) return [];

    const versions = await this.prisma.planTemplate.findMany({
      where: {
        tenantId: template.tenantId,
        code: template.code,
      },
      orderBy: { version: 'asc' },
    });

    return versions as PlanTemplate[];
  }

  async findLatestVersion(tenantId: string, code: string): Promise<PlanTemplate | null> {
    const template = await this.prisma.planTemplate.findFirst({
      where: { tenantId, code },
      orderBy: { version: 'desc' },
    });

    return template as PlanTemplate | null;
  }

  // =============================================================================
  // CLONING
  // =============================================================================

  async clone(data: ClonePlanTemplate): Promise<PlanTemplate> {
    const source = await this.findById(data.sourceTemplateId);
    if (!source) {
      throw new Error(`Template ${data.sourceTemplateId} not found`);
    }

    // Create cloned template
    const cloned = await this.prisma.planTemplate.create({
      data: {
        tenantId: source.tenantId,
        code: data.newCode,
        name: data.newName,
        description: source.description,
        planType: source.planType,
        version: '1.0.0',
        status: 'DRAFT',
        isSystemTemplate: false,
        owner: data.newOwner,
        source: 'CLONED',
        clonedFromId: data.sourceTemplateId,
        createdBy: data.clonedBy,
        metadata: source.metadata ? JSON.parse(JSON.stringify(source.metadata)) : null,
      },
    });

    // Copy sections
    const sections = await this.getSections(data.sourceTemplateId);
    for (const section of sections) {
      await this.prisma.templateSection.create({
        data: {
          templateId: cloned.id,
          sectionKey: section.sectionKey,
          title: section.title,
          description: section.description,
          orderIndex: section.orderIndex,
          parentSectionId: null,
          isRequired: section.isRequired,
          contentTemplate: section.contentTemplate,
          fieldDefinitions: section.fieldDefinitions ? JSON.parse(JSON.stringify(section.fieldDefinitions)) : null,
          metadata: section.metadata ? JSON.parse(JSON.stringify(section.metadata)) : null,
        },
      });
    }

    return cloned as PlanTemplate;
  }

  // =============================================================================
  // SECTION MANAGEMENT
  // =============================================================================

  async getSections(templateId: string): Promise<TemplateSection[]> {
    const sections = await this.prisma.templateSection.findMany({
      where: { templateId },
      orderBy: { orderIndex: 'asc' },
    });

    return sections as TemplateSection[];
  }

  async getSectionTree(templateId: string): Promise<TemplateSectionTree[]> {
    const sections = await this.getSections(templateId);

    // Build tree from flat list
    const rootSections = sections.filter((s: TemplateSection) => !s.parentSectionId);
    const buildTree = (parentId: string | null): TemplateSectionTree[] => {
      return sections
        .filter((s: TemplateSection) => s.parentSectionId === parentId)
        .map((s: TemplateSection) => ({
          ...s,
          children: buildTree(s.id),
        })) as TemplateSectionTree[];
    };

    return rootSections.map((s: TemplateSection) => ({
      ...s,
      children: buildTree(s.id),
    })) as TemplateSectionTree[];
  }

  async getSection(sectionId: string): Promise<TemplateSection | null> {
    const section = await this.prisma.templateSection.findUnique({
      where: { id: sectionId },
    });

    return section as TemplateSection | null;
  }

  async addSection(data: CreateTemplateSection): Promise<TemplateSection> {
    const section = await this.prisma.templateSection.create({
      data: {
        ...data,
        fieldDefinitions: data.fieldDefinitions ? JSON.parse(JSON.stringify(data.fieldDefinitions)) : null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return section as TemplateSection;
  }

  async updateSection(data: UpdateTemplateSection): Promise<TemplateSection> {
    const { id, ...updates } = data;

    const section = await this.prisma.templateSection.update({
      where: { id },
      data: {
        ...updates,
        fieldDefinitions: updates.fieldDefinitions ? JSON.parse(JSON.stringify(updates.fieldDefinitions)) : undefined,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
      },
    });

    return section as TemplateSection;
  }

  async deleteSection(sectionId: string): Promise<void> {
    await this.prisma.templateSection.delete({
      where: { id: sectionId },
    });
  }

  async reorderSections(data: ReorderSections): Promise<TemplateSection[]> {
    for (const item of data.sectionOrders) {
      await this.prisma.templateSection.update({
        where: { id: item.sectionId },
        data: {
          orderIndex: item.orderIndex,
          parentSectionId: item.parentSectionId || null,
        },
      });
    }

    return this.getSections(data.templateId);
  }

  // =============================================================================
  // USAGE STATISTICS
  // =============================================================================

  async getUsageStats(templateId: string): Promise<TemplateUsageStats> {
    const planCount = await this.prisma.plan.count({
      where: { templateId },
    });

    const template = await this.findById(templateId);

    return {
      templateId,
      templateCode: template?.code || '',
      templateName: template?.name || '',
      totalUsageCount: planCount,
      activePlans: 0,
      completedPlans: 0,
      lastUsed: template?.lastUpdated || undefined,
    } as TemplateUsageStats;
  }

  async getAllUsageStats(tenantId: string): Promise<TemplateUsageStats[]> {
    const templates = await this.prisma.planTemplate.findMany({
      where: { tenantId },
    });

    const stats: TemplateUsageStats[] = [];
    for (const template of templates) {
      const stat = await this.getUsageStats(template.id);
      stats.push(stat);
    }

    return stats;
  }

  async incrementUsageCount(templateId: string): Promise<void> {
    await this.prisma.planTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  // =============================================================================
  // SEARCH & DISCOVERY
  // =============================================================================

  async search(tenantId: string, query: string): Promise<PlanTemplate[]> {
    const templates = await this.prisma.planTemplate.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return templates as PlanTemplate[];
  }

  async findByTags(tenantId: string, tags: string[]): Promise<PlanTemplate[]> {
    // Query all templates for tenant and filter by tags JSON field
    const templates = await this.prisma.planTemplate.findMany({
      where: { tenantId },
    });

    const filtered = templates.filter((t: any) => {
      const templateTags = t.tags as string[];
      if (!templateTags) return false;
      return tags.some((tag) => templateTags.includes(tag));
    });

    return filtered as PlanTemplate[];
  }

  async findSystemTemplates(): Promise<PlanTemplate[]> {
    const templates = await this.prisma.planTemplate.findMany({
      where: { isSystemTemplate: true },
      orderBy: { createdAt: 'desc' },
    });

    return templates as PlanTemplate[];
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.planTemplate.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.planTemplate.groupBy({
      by: ['planType'],
      where: { tenantId },
      _count: { planType: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.planType] = item._count.planType;
      return acc;
    }, {} as Record<string, number>);
  }
}
