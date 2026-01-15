import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import {
  PlanTemplateFiltersSchema,
  CreatePlanTemplateSchema,
} from '@/lib/contracts/plan-template.contract';
import { requireActor, getActorOrDemo } from '@/lib/security/actor';
import { requireTenantContext } from '@/lib/security/require-tenant';
import { requireRole } from '@/lib/security/roles';
import { isSecurityError } from '@/lib/security/errors';

/**
 * GET /api/plan-templates
 *
 * Query plan templates with optional filters.
 *
 * Query params:
 * - tenantId: Filter by tenant (default: demo-tenant-001)
 * - planType: Filter by plan type (COMPENSATION_PLAN | GOVERNANCE_PLAN | POLICY_CREATION_PLAN)
 * - status: Filter by status (DRAFT | ACTIVE | DEPRECATED | ARCHIVED)
 * - isSystemTemplate: Filter system templates (true | false)
 * - owner: Filter by owner
 * - search: Full-text search query
 * - tags: Comma-separated tags
 * - category: Filter by category
 */
export async function GET(request: NextRequest) {
  try {
    // Use demo actor fallback for unauthenticated access
    const actor = requireTenantContext(await getActorOrDemo());
    const searchParams = request.nextUrl.searchParams;

    // Parse tags from comma-separated string
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map((t) => t.trim()) : undefined;

    // Parse filters
    const filters = PlanTemplateFiltersSchema.parse({
      tenantId: actor.tenantId,
      planType: searchParams.get('planType') || undefined,
      status: searchParams.get('status') || undefined,
      isSystemTemplate: searchParams.get('isSystemTemplate')
        ? searchParams.get('isSystemTemplate') === 'true'
        : undefined,
      owner: searchParams.get('owner') || undefined,
      search: searchParams.get('search') || undefined,
      tags,
      category: searchParams.get('category') || undefined,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();

    const templates = await templateProvider.findAll(filters);

    // Get counts by status and type
    const tenantId = filters.tenantId || actor.tenantId;
    const countsByStatus = await templateProvider.countByStatus(tenantId);
    const countsByType = await templateProvider.countByType(tenantId);

    return NextResponse.json(
      {
        templates,
        meta: {
          total: templates.length,
          countsByStatus,
          countsByType,
          filters,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}

/**
 * POST /api/plan-templates
 *
 * Create a new plan template.
 *
 * Body: CreatePlanTemplate
 */
export async function POST(request: NextRequest) {
  try {
    const actor = requireTenantContext(await requireActor());
    requireRole(actor, ['SUPER_ADMIN', 'ADMIN', 'GOVERNANCE']);
    const body = await request.json();

    // Validate with Zod
    const data = CreatePlanTemplateSchema.parse({
      ...body,
      tenantId: actor.tenantId,
      owner: actor.userId,
      createdBy: actor.userId,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    const template = await templateProvider.create(data);

    // Create audit log
    await auditProvider.create({
      tenantId: template.tenantId,
      eventType: 'create',
      severity: 'info',
      message: `Plan template created: ${template.name}`,
      entityType: 'plan_template',
      entityId: template.id,
      entityName: template.name,
      actorId: actor.userId,
      actorName: actor.userId,
    });

    return NextResponse.json(
      {
        template,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}
