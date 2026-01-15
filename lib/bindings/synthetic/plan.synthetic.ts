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
} from '@/lib/contracts/plan-section.contract';
import { syntheticPlans, syntheticPlanSections } from '@/lib/data/synthetic/plans.data';
import { syntheticTemplateSections } from '@/lib/data/synthetic/plan-templates.data';
import { isDemoDataEnabled } from '@/lib/config/binding-config';

/**
 * SyntheticPlanProvider
 *
 * In-memory implementation of IPlanPort for demo purposes.
 * Zero external dependencies - instant demo-ready.
 *
 * Demo data is loaded only if ENABLE_DEMO_DATA=true in environment.
 */
export class SyntheticPlanProvider implements IPlanPort {
  private plans: Map<string, Plan>;
  private sections: Map<string, PlanSection>;

  constructor() {
    // Load synthetic data into memory only if demo data is enabled
    const demoEnabled = isDemoDataEnabled();
    this.plans = new Map(demoEnabled ? syntheticPlans.map((p) => [p.id, p]) : []);
    this.sections = new Map(demoEnabled ? syntheticPlanSections.map((s) => [s.id, s]) : []);
  }

  // =============================================================================
  // PLAN CRUD
  // =============================================================================

  async findAll(filters?: PlanFilters): Promise<Plan[]> {
    let results = Array.from(this.plans.values());

    if (!filters) return results;

    // Apply filters
    if (filters.tenantId) {
      results = results.filter((p) => p.tenantId === filters.tenantId);
    }

    if (filters.planType) {
      results = results.filter((p) => p.planType === filters.planType);
    }

    if (filters.status) {
      results = results.filter((p) => p.status === filters.status);
    }

    if (filters.owner) {
      results = results.filter((p) => p.owner === filters.owner);
    }

    if (filters.createdFromTemplateId) {
      results = results.filter((p) => p.createdFromTemplateId === filters.createdFromTemplateId);
    }

    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((p) => filters.tags!.some((tag) => p.tags?.includes(tag)));
    }

    if (filters.createdAfter) {
      results = results.filter((p) => p.createdAt >= filters.createdAfter!);
    }

    if (filters.createdBefore) {
      results = results.filter((p) => p.createdAt <= filters.createdBefore!);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.planCode.toLowerCase().includes(query)
      );
    }

    // Sort by lastUpdated descending
    return results.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  async findById(id: string): Promise<Plan | null> {
    return this.plans.get(id) || null;
  }

  async findByCode(tenantId: string, code: string): Promise<Plan | null> {
    return (
      Array.from(this.plans.values()).find(
        (p) => p.tenantId === tenantId && p.planCode === code
      ) || null
    );
  }

  async create(data: CreatePlan): Promise<Plan> {
    const plan: Plan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
      lastUpdated: new Date(),
      completionPercentage: 0,
      sectionsCompleted: 0,
      sectionsTotal: 0,
      dataType: data.dataType || 'demo',
      demoMetadata: data.demoMetadata || { year: new Date().getFullYear(), bu: 'SPARCC', division: 'Sales', category: 'Sample Data' },
    };

    this.plans.set(plan.id, plan);
    return plan;
  }

  async createFromTemplate(data: CreatePlanFromTemplate): Promise<Plan> {
    // Auto-generate plan code if not provided
    const planCode = data.planCode || `PLAN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create plan from template
    const plan: Plan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: data.tenantId,
      planCode,
      title: data.title,
      description: data.description,
      planType: 'COMPENSATION_PLAN', // Would get from template
      category: data.category,
      tags: data.tags || [],
      version: '1.0.0',
      status: 'DRAFT',
      createdFromTemplateId: data.templateId,
      templateSnapshot: {},
      owner: data.owner,
      createdBy: data.createdBy,
      updatedBy: undefined,
      approvalWorkflowId: undefined,
      createdAt: new Date(),
      lastUpdated: new Date(),
      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      publishedAt: undefined,
      documentId: undefined,
      supersedes: undefined,
      supersededBy: undefined,
      completionPercentage: 0,
      sectionsCompleted: 0,
      sectionsTotal: 0,
      metadata: data.metadata || {},
      dataType: 'demo', // Plans created from templates in synthetic mode are demo data
      demoMetadata: { year: new Date().getFullYear(), bu: 'SPARCC', division: 'Sales', category: 'Sample Data' },
    };

    this.plans.set(plan.id, plan);

    // Copy sections from template
    const templateSections = Array.from(syntheticTemplateSections.values()).filter(
      (s) => s.templateId === data.templateId
    );

    // Create a map of wizard section content by sectionKey
    const wizardSectionContent = new Map<string, string>();
    if (data.sections) {
      for (const wizardSection of data.sections) {
        wizardSectionContent.set(wizardSection.sectionKey, wizardSection.content || '');
      }
    }

    let sectionsTotal = 0;
    let sectionsCompleted = 0;

    for (const templateSection of templateSections) {
      // Skip if custom sections specified and this section not included
      if (data.customSections && !data.customSections.includes(templateSection.id)) {
        continue;
      }

      // Get wizard content if provided
      const wizardContent = wizardSectionContent.get(templateSection.sectionKey);
      const hasContent = wizardContent && wizardContent.trim().length > 0;

      const planSection: PlanSection = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        planId: plan.id,
        parentSectionId: templateSection.parentSectionId,
        sectionKey: templateSection.sectionKey,
        title: templateSection.title,
        description: templateSection.description,
        orderIndex: templateSection.orderIndex,
        level: templateSection.level,
        isRequired: templateSection.isRequired,
        content: wizardContent || templateSection.contentTemplate || '',
        fieldValues: [],
        aiAgentRoles: templateSection.aiAgentRoles || [],
        completionStatus: hasContent ? 'COMPLETED' : 'NOT_STARTED',
        completionPercentage: hasContent ? 100 : 0,
        reviewedBy: undefined,
        reviewedAt: undefined,
        reviewComments: undefined,
        createdAt: new Date(),
        lastUpdated: new Date(),
        metadata: {},
      };

      this.sections.set(planSection.id, planSection);
      sectionsTotal++;
      if (hasContent) sectionsCompleted++;
    }

    // Update plan with section count and completion
    plan.sectionsTotal = sectionsTotal;
    plan.sectionsCompleted = sectionsCompleted;
    plan.completionPercentage = sectionsTotal > 0 ? Math.round((sectionsCompleted / sectionsTotal) * 100) : 0;
    this.plans.set(plan.id, plan);

    return plan;
  }

  async update(data: UpdatePlan): Promise<Plan> {
    const existing = this.plans.get(data.id);
    if (!existing) {
      throw new Error(`Plan not found: ${data.id}`);
    }

    const updated: Plan = {
      ...existing,
      ...data,
      lastUpdated: new Date(),
    };

    this.plans.set(updated.id, updated);
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const plan = this.plans.get(id);
    if (!plan) {
      throw new Error(`Plan not found: ${id}`);
    }

    // Soft delete - set status to ARCHIVED
    await this.update({
      id,
      status: 'ARCHIVED',
      updatedBy: deletedBy,
    });
  }

  async hardDelete(id: string): Promise<void> {
    // Delete all sections first
    const sections = await this.getSections(id);
    for (const section of sections) {
      this.sections.delete(section.id);
    }

    // Delete plan
    this.plans.delete(id);
  }

  // =============================================================================
  // VERSIONING
  // =============================================================================

  async createVersion(data: CreatePlanVersion): Promise<Plan> {
    const existing = await this.findById(data.planId);
    if (!existing) {
      throw new Error(`Plan not found: ${data.planId}`);
    }

    // Parse version and bump
    const [major, minor, patch] = existing.version.split('.').map(Number);
    let newVersion: string;

    switch (data.bumpType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    // Create new version
    const newPlan: Plan = {
      ...existing,
      ...data.changes,
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: newVersion,
      status: 'DRAFT',
      createdAt: new Date(),
      lastUpdated: new Date(),
      createdBy: data.createdBy,
      updatedBy: undefined,
      supersedes: existing.id,
      completionPercentage: 0,
      sectionsCompleted: 0,
    };

    this.plans.set(newPlan.id, newPlan);

    // Mark old version as superseded
    existing.supersededBy = newPlan.id;
    existing.status = 'SUPERSEDED';
    this.plans.set(existing.id, existing);

    return newPlan;
  }

  async findVersions(planId: string): Promise<Plan[]> {
    const plan = await this.findById(planId);
    if (!plan) return [];

    // Find all plans with same code (different versions)
    return Array.from(this.plans.values())
      .filter((p) => p.planCode === plan.planCode)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findLatestVersion(tenantId: string, planCode: string): Promise<Plan | null> {
    const versions = Array.from(this.plans.values())
      .filter((p) => p.tenantId === tenantId && p.planCode === planCode)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return versions[0] || null;
  }

  // =============================================================================
  // SECTION MANAGEMENT
  // =============================================================================

  async getSections(planId: string): Promise<PlanSection[]> {
    return Array.from(this.sections.values())
      .filter((s) => s.planId === planId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getSectionTree(planId: string): Promise<PlanSectionTree[]> {
    const sections = await this.getSections(planId);

    // Build tree structure
    const buildTree = (parentId: string | undefined): PlanSectionTree[] => {
      return sections
        .filter((s) => s.parentSectionId === parentId)
        .map((s) => ({
          ...s,
          children: buildTree(s.id),
        }));
    };

    return buildTree(undefined);
  }

  async getSection(sectionId: string): Promise<PlanSection | null> {
    return this.sections.get(sectionId) || null;
  }

  async addSection(data: CreatePlanSection): Promise<PlanSection> {
    const section: PlanSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      completionPercentage: 0,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    this.sections.set(section.id, section);

    // Update plan section count
    const plan = await this.findById(data.planId);
    if (plan) {
      plan.sectionsTotal += 1;
      this.plans.set(plan.id, plan);
    }

    return section;
  }

  async updateSection(data: UpdatePlanSection): Promise<PlanSection> {
    const existing = this.sections.get(data.id);
    if (!existing) {
      throw new Error(`Section not found: ${data.id}`);
    }

    const updated: PlanSection = {
      ...existing,
      ...data,
      lastUpdated: new Date(),
    };

    this.sections.set(updated.id, updated);
    return updated;
  }

  async updateSectionContent(data: UpdateSectionContent): Promise<PlanSection> {
    const section = await this.getSection(data.sectionId);
    if (!section) {
      throw new Error(`Section not found: ${data.sectionId}`);
    }

    section.content = data.content;
    section.lastUpdated = new Date();

    // Auto-complete if requested and content is not empty
    if (data.autoComplete && data.content.trim().length > 0) {
      section.completionStatus = 'COMPLETED';
      section.completionPercentage = 100;
    }

    this.sections.set(section.id, section);

    // Recalculate plan completion
    await this.calculateCompletion(section.planId);

    return section;
  }

  async updateSectionFields(data: UpdateSectionFields): Promise<PlanSection> {
    const section = await this.getSection(data.sectionId);
    if (!section) {
      throw new Error(`Section not found: ${data.sectionId}`);
    }

    section.fieldValues = data.fieldValues;
    section.lastUpdated = new Date();

    // Auto-complete if requested
    if (data.autoComplete) {
      section.completionStatus = 'COMPLETED';
      section.completionPercentage = 100;
    }

    this.sections.set(section.id, section);

    // Recalculate plan completion
    await this.calculateCompletion(section.planId);

    return section;
  }

  async markSectionComplete(data: MarkSectionComplete): Promise<PlanSection> {
    const section = await this.getSection(data.sectionId);
    if (!section) {
      throw new Error(`Section not found: ${data.sectionId}`);
    }

    section.completionStatus = 'COMPLETED';
    section.completionPercentage = 100;
    section.lastUpdated = new Date();

    this.sections.set(section.id, section);

    // Recalculate plan completion
    await this.calculateCompletion(section.planId);

    return section;
  }

  async reviewSection(data: ReviewSection): Promise<PlanSection> {
    const section = await this.getSection(data.sectionId);
    if (!section) {
      throw new Error(`Section not found: ${data.sectionId}`);
    }

    section.reviewedBy = data.reviewedBy;
    section.reviewedAt = new Date();
    section.reviewComments = data.reviewComments;
    section.completionStatus = data.approved ? 'APPROVED' : 'UNDER_REVIEW';
    section.lastUpdated = new Date();

    this.sections.set(section.id, section);
    return section;
  }

  async deleteSection(sectionId: string): Promise<void> {
    const section = await this.getSection(sectionId);
    if (!section) return;

    this.sections.delete(sectionId);

    // Update plan section counts
    const plan = await this.findById(section.planId);
    if (plan) {
      plan.sectionsTotal = Math.max(0, plan.sectionsTotal - 1);
      await this.calculateCompletion(plan.id);
    }
  }

  async reorderSections(data: ReorderPlanSections): Promise<PlanSection[]> {
    // Update order indices
    for (const order of data.sectionOrders) {
      const section = this.sections.get(order.sectionId);
      if (section) {
        section.orderIndex = order.orderIndex;
        if (order.parentSectionId !== undefined) {
          section.parentSectionId = order.parentSectionId;
        }
        section.lastUpdated = new Date();
        this.sections.set(section.id, section);
      }
    }

    return this.getSections(data.planId);
  }

  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================

  async submitForReview(data: SubmitForReview): Promise<Plan> {
    return this.update({
      id: data.planId,
      status: 'UNDER_REVIEW',
      updatedBy: data.submittedBy,
    });
  }

  async submitForApproval(data: SubmitForApproval): Promise<Plan> {
    return this.update({
      id: data.planId,
      status: 'PENDING_APPROVAL',
      approvalWorkflowId: data.workflowId,
      updatedBy: data.submittedBy,
    });
  }

  async approve(data: ApprovePlan): Promise<Plan> {
    return this.update({
      id: data.planId,
      status: 'APPROVED',
      updatedBy: data.approvedBy,
    });
  }

  async publish(data: PublishPlan): Promise<Plan> {
    const plan = await this.update({
      id: data.planId,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      updatedBy: data.publishedBy,
    });

    // In real implementation, would generate document here
    return plan;
  }

  async reject(data: RejectPlan): Promise<Plan> {
    return this.update({
      id: data.planId,
      status: 'DRAFT',
      updatedBy: data.rejectedBy,
      metadata: { rejectionReason: data.reason },
    });
  }

  async archive(data: ArchivePlan): Promise<Plan> {
    return this.update({
      id: data.planId,
      status: 'ARCHIVED',
      updatedBy: data.archivedBy,
    });
  }

  // =============================================================================
  // DOCUMENT GENERATION
  // =============================================================================

  async generateDocument(data: GeneratePlanDocument): Promise<string> {
    // In real implementation, would generate PDF/DOCX
    // For now, return a mock document ID
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update plan with document reference
    await this.update({
      id: data.planId,
      documentId,
    });

    return documentId;
  }

  // =============================================================================
  // COMPLETION TRACKING
  // =============================================================================

  async calculateCompletion(planId: string): Promise<PlanCompletionStats> {
    const plan = await this.findById(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const sections = await this.getSections(planId);
    const completedSections = sections.filter((s) => s.completionStatus === 'COMPLETED').length;
    const requiredSections = sections.filter((s) => s.isRequired);
    const requiredCompleted = requiredSections.filter((s) => s.completionStatus === 'COMPLETED').length;

    const completionPercentage = sections.length > 0
      ? Math.round((completedSections / sections.length) * 100)
      : 0;

    // Update plan
    plan.completionPercentage = completionPercentage;
    plan.sectionsCompleted = completedSections;
    plan.sectionsTotal = sections.length;
    plan.lastUpdated = new Date();
    this.plans.set(plan.id, plan);

    return {
      planId: plan.id,
      completionPercentage,
      sectionsCompleted: completedSections,
      sectionsTotal: sections.length,
      requiredSectionsCompleted: requiredCompleted,
      requiredSectionsTotal: requiredSections.length,
      lastUpdated: new Date(),
    };
  }

  async getCompletionStats(planId: string): Promise<PlanCompletionStats> {
    return this.calculateCompletion(planId);
  }

  // =============================================================================
  // STATISTICS & REPORTING
  // =============================================================================

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const plans = await this.findAll({ tenantId });
    const counts: Record<string, number> = {};

    for (const plan of plans) {
      counts[plan.status] = (counts[plan.status] || 0) + 1;
    }

    return counts;
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const plans = await this.findAll({ tenantId });
    const counts: Record<string, number> = {};

    for (const plan of plans) {
      counts[plan.planType] = (counts[plan.planType] || 0) + 1;
    }

    return counts;
  }

  async search(tenantId: string, query: string): Promise<Plan[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findByOwner(tenantId: string, owner: string): Promise<Plan[]> {
    return this.findAll({ tenantId, owner });
  }

  async findByTemplate(templateId: string): Promise<Plan[]> {
    return this.findAll({ createdFromTemplateId: templateId });
  }

  async findPendingApproval(tenantId: string): Promise<Plan[]> {
    return this.findAll({ tenantId, status: 'PENDING_APPROVAL' });
  }

  async findOverdue(tenantId: string): Promise<Plan[]> {
    const now = new Date();
    const allPlans = await this.findAll({ tenantId });

    return allPlans.filter((p) => {
      // Check if plan has expired
      if (p.expirationDate && p.expirationDate < now) {
        return true;
      }
      return false;
    });
  }
}
