import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER']),
  tenantId: z.string().min(1),
});

// Synthetic users for demo mode
const syntheticUsers = [
  {
    id: 'demo-user-001',
    name: 'Todd LeBaron',
    email: 'todd@demo.com',
    role: 'SUPER_ADMIN',
    tenantId: 'demo-tenant-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    tenant: { name: 'Demo Organization', slug: 'demo' },
  },
  {
    id: 'demo-user-002',
    name: 'Sarah Chen',
    email: 'sarah@demo.com',
    role: 'ADMIN',
    tenantId: 'demo-tenant-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    tenant: { name: 'Demo Organization', slug: 'demo' },
  },
  {
    id: 'demo-user-003',
    name: 'Mike Johnson',
    email: 'mike@demo.com',
    role: 'MANAGER',
    tenantId: 'demo-tenant-001',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    tenant: { name: 'Demo Organization', slug: 'demo' },
  },
  {
    id: 'demo-user-004',
    name: 'Emily Davis',
    email: 'emily@demo.com',
    role: 'USER',
    tenantId: 'demo-tenant-001',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    tenant: { name: 'Demo Organization', slug: 'demo' },
  },
  {
    id: 'demo-user-005',
    name: 'Alex Kim',
    email: 'alex@demo.com',
    role: 'VIEWER',
    tenantId: 'demo-tenant-001',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    tenant: { name: 'Demo Organization', slug: 'demo' },
  },
];

// GET /api/admin/users - List all users (with optional tenant filter)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    const userTenantId = (session as any)?.user?.tenantId;
    const bindingMode = process.env.BINDING_MODE || 'synthetic';

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SUPER_ADMIN can see all users, ADMIN can only see their tenant's users
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search');

    // In synthetic mode, return synthetic users
    if (bindingMode === 'synthetic') {
      let users = [...syntheticUsers];

      // Filter by tenant for ADMIN
      if (role === 'ADMIN') {
        users = users.filter(u => u.tenantId === userTenantId);
      } else if (tenantId) {
        users = users.filter(u => u.tenantId === tenantId);
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        );
      }

      const stats = {
        total: users.length,
        byRole: users.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({ users, stats });
    }

    // Build where clause for database mode
    const where: any = {};

    // ADMIN can only see their own tenant
    if (role === 'ADMIN') {
      where.tenantId = userTenantId;
    } else if (tenantId) {
      where.tenantId = tenantId;
    }

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    // Get role counts for stats
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: role === 'ADMIN' ? { tenantId: userTenantId } : (tenantId ? { tenantId } : {}),
    });

    const stats = {
      total: users.length,
      byRole: Object.fromEntries(
        roleCounts.map((r: { role: string; _count: number }) => [r.role, r._count])
      ),
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    const userTenantId = (session as any)?.user?.tenantId;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN and ADMIN can create users
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = CreateUserSchema.parse(body);

    // ADMIN can only create users in their own tenant
    if (role === 'ADMIN' && data.tenantId !== userTenantId) {
      return NextResponse.json(
        { error: 'Cannot create users in other tenants' },
        { status: 403 }
      );
    }

    // ADMIN cannot create SUPER_ADMIN users
    if (role === 'ADMIN' && data.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot assign SUPER_ADMIN role' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        tenantId: data.tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
