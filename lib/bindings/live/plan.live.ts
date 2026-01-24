/**
 * Live Plan Provider - Prisma-backed implementation
 *
 * Implements plan and plan section operations using Prisma ORM
 */

import type { IPlanPort } from '@/lib/ports/plan.port';
import type {
  Plan,
  CreatePlan,
  UpdatePlan,
  CreatePlanFromTemplate,
  CreatePlanVersion,
  PlanFilters,
  SubmitForReview,
  SubmitForApproval,
  ApprovePlan,
  PublishPlan,
  RejectPlan,
  ArchivePlan,
  PlanCompletionStats,
  GeneratePlanDocument,
} from '@/lib/contracts/plan.contract';
import type {
  PlanSection,
  CreatePlanSection,
  UpdatePlanSection,
  UpdateSectionContent,
  UpdateSectionFields,
  MarkSectionComplete,
  ReviewSection,
  PlanSectionTree,
  ReorderPlanSections,
  FieldValue,
} from '@/lib/contracts/plan-section.contract';
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

export class LivePlanProvider implements IPlanPort {
  private prisma = getPrismaClient();

  // =============================================================================
  // PLAN CRUD
  // =============================================================================

  async findAll(filters?: PlanFilters): Promise<Plan[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.status) where.status = filters.status;
    if (filters?.planType) where.planType = filters.planType;
    if (filters?.owner) where.owner = filters.owner;
    if (filters?.createdFromTemplateId) where.createdFromTemplateId = filters.createdFromTemplateId;

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const plans = await this.prisma.plan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return plans as Plan[];
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    return plan as Plan | null;
  }

  async findByCode(tenantId: string, code: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findFirst({
      where: { tenantId, code },
    });

    return plan as Plan | null;
  }

  async create(data: CreatePlan): Promise<Plan> {
    const plan = await this.prisma.plan.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return plan as Plan;
  }

  async createFromTemplate(data: CreatePlanFromTemplate): Promise<Plan> {
    // Fetch the template
    const template = await this.prisma.planTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new Error(`Template ${data.templateId} not found`);
    }

    // Create the plan
    const plan = await this.prisma.plan.create({
      data: {
        tenantId: data.tenantId,
        planCode: data.planCode || `PLAN-${Date.now()}`,
        title: data.title,
        description: data.description || (template as any).description,
        planType: (template as any).planType,
        createdFromTemplateId: data.templateId,
        version: '1.0.0',
        status: 'DRAFT',
        owner: data.owner,
        createdBy: data.createdBy,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    // Copy sections from template
    const templateSections = await this.prisma.templateSection.findMany({
      where: { templateId: data.templateId },
      orderBy: { orderIndex: 'asc' },
    });

    for (const section of templateSections) {
      await this.prisma.planSection.create({
        data: {
          planId: plan.id,
          sectionKey: (section as any).sectionKey,
          title: (section as any).title,
          description: (section as any).description,
          orderIndex: (section as any).orderIndex,
          parentSectionId: null,
          isRequired: (section as any).isRequired,
          content: (section as any).contentTemplate || '',
          fieldDefinitions: (section as any).fieldDefinitions ? JSON.parse(JSON.stringify((section as any).fieldDefinitions)) : null,
          completionStatus: 'NOT_STARTED',
          completionPercentage: 0,
        },
      });
    }

    // Increment template usage count
    await this.prisma.planTemplate.update({
      where: { id: data.templateId },
      data: { usageCount: { increment: 1 } },
    });

    return plan as Plan;
  }

  async update(data: UpdatePlan): Promise<Plan> {
    const { id, ...updates } = data;

    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...updates,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.plan.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    // Delete sections first, then plan
    await this.prisma.planSection.deleteMany({
      where: { planId: id },
    });
    await this.prisma.plan.delete({
      where: { id },
    });
  }

  // =============================================================================
  // VERSIONING
  // =============================================================================

  async createVersion(data: CreatePlanVersion): Promise<Plan> {
    const existing = await this.findById(data.planId);
    if (!existing) {
      throw new Error(`Plan ${data.planId} not found`);
    }

    const newVersion = bumpVersion(existing.version || '1.0.0', data.bumpType);

    // Mark existing as superseded
    await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'SUPERSEDED',
        updatedAt: new Date(),
      },
    });

    // Create new version
    const newPlan = await this.prisma.plan.create({
      data: {
        tenantId: existing.tenantId,
        planCode: existing.planCode,
        title: existing.title,
        description: existing.description,
        planType: existing.planType,
        createdFromTemplateId: existing.createdFromTemplateId,
        version: newVersion,
        status: 'DRAFT',
        owner: existing.owner,
        createdBy: data.createdBy,
        supersedes: data.planId,
        metadata: existing.metadata ? JSON.parse(JSON.stringify(existing.metadata)) : null,
      },
    });

    // Copy sections
    const sections = await this.getSections(data.planId);
    for (const section of sections) {
      await this.prisma.planSection.create({
        data: {
          planId: newPlan.id,
          sectionKey: section.sectionKey,
          title: section.title,
          description: section.description,
          orderIndex: section.orderIndex,
          parentSectionId: null,
          isRequired: section.isRequired,
          content: section.content,
          fieldValues: section.fieldValues ? JSON.parse(JSON.stringify(section.fieldValues)) : null,
          completionStatus: section.completionStatus,
          completionPercentage: section.completionPercentage,
        },
      });
    }

    return newPlan as Plan;
  }

  async findVersions(planId: string): Promise<Plan[]> {
    const plan = await this.findById(planId);
    if (!plan) return [];

    const versions = await this.prisma.plan.findMany({
      where: {
        tenantId: plan.tenantId,
        planCode: plan.planCode,
      },
      orderBy: { version: 'asc' },
    });

    return versions as Plan[];
  }

  async findLatestVersion(tenantId: string, planCode: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findFirst({
      where: { tenantId, planCode },
      orderBy: { version: 'desc' },
    });

    return plan as Plan | null;
  }

  // =============================================================================
  // SECTION MANAGEMENT
  // =============================================================================

  async getSections(planId: string): Promise<PlanSection[]> {
    const sections = await this.prisma.planSection.findMany({
      where: { planId },
      orderBy: { orderIndex: 'asc' },
    });

    return sections as PlanSection[];
  }

  async getSectionTree(planId: string): Promise<PlanSectionTree[]> {
    const sections = await this.getSections(planId);

    const rootSections = sections.filter((s: PlanSection) => !s.parentSectionId);
    const buildTree = (parentId: string | null): PlanSectionTree[] => {
      return sections
        .filter((s: PlanSection) => s.parentSectionId === parentId)
        .map((s: PlanSection) => ({
          ...s,
          children: buildTree(s.id),
        })) as PlanSectionTree[];
    };

    return rootSections.map((s: PlanSection) => ({
      ...s,
      children: buildTree(s.id),
    })) as PlanSectionTree[];
  }

  async getSection(sectionId: string): Promise<PlanSection | null> {
    const section = await this.prisma.planSection.findUnique({
      where: { id: sectionId },
    });

    return section as PlanSection | null;
  }

  async addSection(data: CreatePlanSection): Promise<PlanSection> {
    const section = await this.prisma.planSection.create({
      data: {
        ...data,
        fieldValues: data.fieldValues ? JSON.parse(JSON.stringify(data.fieldValues)) : null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return section as PlanSection;
  }

  async updateSection(data: UpdatePlanSection): Promise<PlanSection> {
    const { id, ...updates } = data;

    const section = await this.prisma.planSection.update({
      where: { id },
      data: {
        ...updates,
        fieldValues: updates.fieldValues ? JSON.parse(JSON.stringify(updates.fieldValues)) : undefined,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
        lastUpdated: new Date(),
      },
    });

    return section as PlanSection;
  }

  async updateSectionContent(data: UpdateSectionContent): Promise<PlanSection> {
    const section = await this.prisma.planSection.update({
      where: { id: data.sectionId },
      data: {
        content: data.content,
        updatedAt: new Date(),
      },
    });

    return section as PlanSection;
  }

  async updateSectionFields(data: UpdateSectionFields): Promise<PlanSection> {
    const section = await this.prisma.planSection.update({
      where: { id: data.sectionId },
      data: {
        fieldValues: JSON.parse(JSON.stringify(data.fieldValues)),
        updatedAt: new Date(),
      },
    });

    return section as PlanSection;
  }

  async markSectionComplete(data: MarkSectionComplete): Promise<PlanSection> {
    const section = await this.prisma.planSection.update({
      where: { id: data.sectionId },
      data: {
        completionStatus: 'COMPLETED',
        completionPercentage: 100,
        lastUpdated: new Date(),
      },
    });

    return section as PlanSection;
  }

  async reviewSection(data: ReviewSection): Promise<PlanSection> {
    const section = await this.prisma.planSection.update({
      where: { id: data.sectionId },
      data: {
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date(),
        reviewComments: data.reviewComments,
        updatedAt: new Date(),
      },
    });

    return section as PlanSection;
  }

  async deleteSection(sectionId: string): Promise<void> {
    await this.prisma.planSection.delete({
      where: { id: sectionId },
    });
  }

  async reorderSections(data: ReorderPlanSections): Promise<PlanSection[]> {
    for (const item of data.sectionOrders) {
      await this.prisma.planSection.update({
        where: { id: item.sectionId },
        data: {
          orderIndex: item.orderIndex,
          parentSectionId: item.parentSectionId || null,
        },
      });
    }

    return this.getSections(data.planId);
  }

  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================

  async submitForReview(data: SubmitForReview): Promise<Plan> {
    const plan = await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  async submitForApproval(data: SubmitForApproval): Promise<Plan> {
    const plan = await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'PENDING_APPROVAL',
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  async approve(data: ApprovePlan): Promise<Plan> {
    const plan = await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'APPROVED',
        approvedBy: data.approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  async publish(data: PublishPlan): Promise<Plan> {
    const plan = await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  async reject(data: RejectPlan): Promise<Plan> {
    const plan = await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'DRAFT',
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  async archive(data: ArchivePlan): Promise<Plan> {
    const plan = await this.prisma.plan.update({
      where: { id: data.planId },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });

    return plan as Plan;
  }

  // =============================================================================
  // DOCUMENT GENERATION
  // =============================================================================

  async generateDocument(data: GeneratePlanDocument): Promise<string> {
    // TODO: Implement document generation
    return '';
  }

  // =============================================================================
  // COMPLETION TRACKING
  // =============================================================================

  async calculateCompletion(planId: string): Promise<PlanCompletionStats> {
    const sections = await this.getSections(planId);

    const sectionsTotal = sections.length;
    const sectionsCompleted = sections.filter(
      (s: PlanSection) => s.completionStatus === 'COMPLETED'
    ).length;
    const requiredSectionsTotal = sections.filter((s: PlanSection) => s.isRequired).length;
    const requiredSectionsCompleted = sections.filter(
      (s: PlanSection) => s.isRequired && s.completionStatus === 'COMPLETED'
    ).length;

    const completionPercentage = sectionsTotal > 0
      ? Math.round((sectionsCompleted / sectionsTotal) * 100)
      : 0;

    return {
      planId,
      completionPercentage,
      sectionsCompleted,
      sectionsTotal,
      requiredSectionsCompleted,
      requiredSectionsTotal,
      lastUpdated: new Date(),
    } as PlanCompletionStats;
  }

  async getCompletionStats(planId: string): Promise<PlanCompletionStats> {
    return this.calculateCompletion(planId);
  }

  // =============================================================================
  // STATISTICS & REPORTING
  // =============================================================================

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.plan.groupBy({
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
    const result = await this.prisma.plan.groupBy({
      by: ['planType'],
      where: { tenantId },
      _count: { planType: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.planType] = item._count.planType;
      return acc;
    }, {} as Record<string, number>);
  }

  async search(tenantId: string, query: string): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans as Plan[];
  }

  async findByOwner(tenantId: string, owner: string): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      where: { tenantId, owner },
      orderBy: { createdAt: 'desc' },
    });

    return plans as Plan[];
  }

  async findByTemplate(templateId: string): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      where: { templateId },
      orderBy: { createdAt: 'desc' },
    });

    return plans as Plan[];
  }

  async findPendingApproval(tenantId: string): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      where: {
        tenantId,
        status: 'PENDING_APPROVAL',
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans as Plan[];
  }

  async findOverdue(tenantId: string): Promise<Plan[]> {
    const now = new Date();

    const plans = await this.prisma.plan.findMany({
      where: {
        tenantId,
        expirationDate: { lt: now },
        status: { not: 'ARCHIVED' },
      },
      orderBy: { expirationDate: 'asc' },
    });

    return plans as Plan[];
  }
}
