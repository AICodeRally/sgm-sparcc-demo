import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER']).optional(),
  tenantId: z.string().min(1).optional(),
});

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    const userTenantId = (session as any)?.user?.tenantId;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ADMIN can only see users in their tenant
    if (role === 'ADMIN' && user.tenantId !== userTenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    const userTenantId = (session as any)?.user?.tenantId;
    const currentUserId = (session as any)?.user?.id;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = UpdateUserSchema.parse(body);

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ADMIN can only update users in their tenant
    if (role === 'ADMIN' && existingUser.tenantId !== userTenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent users from changing their own role
    if (id === currentUserId && data.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // ADMIN cannot assign SUPER_ADMIN role
    if (role === 'ADMIN' && data.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot assign SUPER_ADMIN role' },
        { status: 403 }
      );
    }

    // ADMIN cannot change tenant
    if (role === 'ADMIN' && data.tenantId && data.tenantId !== userTenantId) {
      return NextResponse.json(
        { error: 'Cannot move users to other tenants' },
        { status: 403 }
      );
    }

    // Cannot demote a SUPER_ADMIN unless you are SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    // If changing tenant, verify it exists
    if (data.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
      });
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.tenantId && { tenantId: data.tenantId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    const userTenantId = (session as any)?.user?.tenantId;
    const currentUserId = (session as any)?.user?.id;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === currentUserId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ADMIN can only delete users in their tenant
    if (role === 'ADMIN' && existingUser.tenantId !== userTenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot delete SUPER_ADMIN unless you are SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
