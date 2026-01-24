import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Validation schema for updating a tenant
const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tier: z.enum(['DEMO', 'BETA', 'PRODUCTION']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  features: z.record(z.string(), z.boolean()).optional(),
  settings: z.record(z.string(), z.any()).optional(),
});

// Synthetic tenant for demo mode
const syntheticTenant = {
  id: 'demo-tenant-001',
  name: 'Demo Organization',
  slug: 'demo',
  tier: 'DEMO',
  status: 'ACTIVE',
  features: {
    askSgm: true,
    policies: true,
    documents: true,
    plans: true,
    governance: true,
    analytics: false,
  },
  settings: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  _count: { users: 5 },
};

// GET /api/admin/tenants/[id] - Get a specific tenant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session as any)?.user?.role;
    const userTenantId = (session as any)?.user?.tenantId;
    const { id } = await params;

    // SUPER_ADMIN can get any tenant, ADMIN can only get their own
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (role === 'ADMIN' && id !== userTenantId) {
      return NextResponse.json(
        { error: 'Cannot access other tenants' },
        { status: 403 }
      );
    }

    const bindingMode = process.env.BINDING_MODE || 'synthetic';

    // In synthetic mode, return mock data
    if (bindingMode === 'synthetic') {
      if (id === 'demo-tenant-001' || id === userTenantId) {
        return NextResponse.json(syntheticTenant);
      }
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

// PATCH /api/admin/tenants/[id] - Update a tenant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session as any)?.user?.role;
    const { id } = await params;

    // Only SUPER_ADMIN can update tenants
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Reject attempts to change the slug
    if ('slug' in body) {
      return NextResponse.json(
        { error: 'Cannot change tenant slug after creation' },
        { status: 400 }
      );
    }

    const data = UpdateTenantSchema.parse(body);

    const bindingMode = process.env.BINDING_MODE || 'synthetic';

    // In synthetic mode, return mock updated tenant
    if (bindingMode === 'synthetic') {
      const updatedTenant = {
        ...syntheticTenant,
        ...data,
        id,
        updatedAt: new Date(),
      };
      return NextResponse.json(updatedTenant);
    }

    // Verify tenant exists
    const existing = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.tier !== undefined && { tier: data.tier }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.features !== undefined && { features: data.features }),
        ...(data.settings !== undefined && { settings: data.settings }),
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// DELETE /api/admin/tenants/[id] - Soft delete (archive) a tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session as any)?.user?.role;
    const { id } = await params;

    // Only SUPER_ADMIN can delete tenants
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bindingMode = process.env.BINDING_MODE || 'synthetic';

    // In synthetic mode, return success
    if (bindingMode === 'synthetic') {
      return NextResponse.json({
        message: 'Tenant archived successfully',
        id,
        status: 'ARCHIVED',
      });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check for active users
    const activeUserCount = await prisma.user.count({
      where: {
        tenantId: id,
        isActive: true,
      },
    });

    if (activeUserCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot archive tenant with active users. Deactivate all users first.',
          activeUsers: activeUserCount,
        },
        { status: 409 }
      );
    }

    // Soft delete: set status to ARCHIVED
    const archivedTenant = await prisma.tenant.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({
      message: 'Tenant archived successfully',
      id: archivedTenant.id,
      status: archivedTenant.status,
    });
  } catch (error) {
    console.error('Error archiving tenant:', error);
    return NextResponse.json({ error: 'Failed to archive tenant' }, { status: 500 });
  }
}
