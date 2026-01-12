import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/dashboard
 * Fetch aggregate dashboard metrics for client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantSlug } = await params;

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { clientEngagement: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Validate access (user's tenant OR consultant access)
    const hasAccess =
      session.user.tenantId === tenant.id ||
      session.user.role === 'SUPER_ADMIN' ||
      session.user.role === 'ADMIN';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate tenant tier
    if (tenant.tier !== 'BETA' && tenant.tier !== 'PRODUCTION') {
      return NextResponse.json(
        { error: 'Client dashboard only available for BETA/PRODUCTION tiers' },
        { status: 403 }
      );
    }

    // Fetch engagement data
    const engagement = tenant.clientEngagement;

    if (!engagement) {
      return NextResponse.json(
        { error: 'No client engagement found for this tenant' },
        { status: 404 }
      );
    }

    // Fetch plan analyses
    const plans = await prisma.clientPlanAnalysis.findMany({
      where: { engagementId: engagement.id },
    });

    // Fetch gaps
    const gaps = await prisma.clientGapAnalysis.findMany({
      where: { engagementId: engagement.id },
    });

    // Calculate metrics
    const totalPlans = plans.length;
    const criticalGaps = gaps.filter((g: any) => g.severity === 'CRITICAL').length;
    const avgRiskScore =
      plans.length > 0
        ? Math.round(
            plans.reduce((sum: number, p: any) => sum + p.riskScore, 0) / plans.length
          )
        : 0;
    const totalCoverage =
      plans.length > 0
        ? Math.round(
            plans.reduce((sum: number, p: any) => {
              const total = p.coverageFull + p.coverageLimited + p.coverageNo;
              return sum + (total > 0 ? ((p.coverageFull + p.coverageLimited * 0.5) / total) * 100 : 0);
            }, 0) / plans.length
          )
        : 0;

    // Top high-risk plans
    const topPlans = plans
      .sort((a: any, b: any) => b.riskScore - a.riskScore)
      .slice(0, 2)
      .map((p: any) => ({
        planCode: p.planCode,
        planName: p.planName,
        planType: p.planType,
        businessUnit: p.businessUnit,
        coverageFull: p.coverageFull,
        coverageLimited: p.coverageLimited,
        coverageNo: p.coverageNo,
        riskScore: p.riskScore,
      }));

    // Critical gaps
    const criticalGapsList = gaps
      .filter((g: any) => g.severity === 'CRITICAL' || g.severity === 'HIGH')
      .slice(0, 3)
      .map((g: any) => ({
        id: g.id,
        planCode: g.planCode,
        policyArea: g.policyArea,
        gapDescription: g.gapDescription,
        severity: g.severity,
        status: g.status,
        bhgPolicyRef: g.bhgPolicyRef,
        assignedTo: g.assignedTo,
        dueDate: g.dueDate?.toISOString(),
      }));

    // Response
    return NextResponse.json({
      tenantName: tenant.name,
      brandingConfig: engagement.brandingConfig || {},
      metrics: [
        { label: 'Plans Analyzed', value: totalPlans, colorClass: 'border-[color:var(--color-accent-border)]' },
        { label: 'Critical Gaps', value: criticalGaps, colorClass: 'border-[color:var(--color-error-border)]' },
        {
          label: 'Avg Risk Score',
          value: avgRiskScore,
          subtext: avgRiskScore >= 75 ? 'Critical' : avgRiskScore >= 50 ? 'High' : 'Medium',
          colorClass: 'border-[color:var(--color-warning-border)]',
        },
        {
          label: 'Coverage',
          value: `${totalCoverage}%`,
          colorClass: 'border-[color:var(--color-success-border)]',
        },
      ],
      topPlans,
      criticalGaps: criticalGapsList,
      engagementStatus: {
        type: engagement.type,
        status: engagement.status,
        startDate: engagement.startDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Dashboard API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
