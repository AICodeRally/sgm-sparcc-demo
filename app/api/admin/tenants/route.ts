import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Default features for new tenants
const DEFAULT_FEATURES = {
  askSgm: true,
  policies: true,
  documents: true,
  plans: true,
  governance: true,
  analytics: false,
};

// Validation schema for creating a tenant
const CreateTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens only'
    ),
  tier: z.enum(['DEMO', 'BETA', 'PRODUCTION']),
  features: z.record(z.string(), z.boolean()).optional(),
});

// Synthetic tenants for demo mode
const syntheticTenants = [
  {
    id: 'demo-tenant-001',
    name: 'Demo Organization',
    slug: 'demo',
    tier: 'DEMO',
    status: 'ACTIVE',
    features: DEFAULT_FEATURES,
    settings: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    _count: { users: 5 },
  },
  {
    id: 'demo-tenant-002',
    name: 'Beta Corp',
    slug: 'beta-corp',
    tier: 'BETA',
    status: 'ACTIVE',
    features: { ...DEFAULT_FEATURES, analytics: false },
    settings: {},
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    _count: { users: 12 },
  },
  {
    id: 'demo-tenant-003',
    name: 'Enterprise Inc',
    slug: 'enterprise-inc',
    tier: 'PRODUCTION',
    status: 'ACTIVE',
    features: { ...DEFAULT_FEATURES, analytics: true },
    settings: { branding: { primaryColor: '#2563eb' } },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    _count: { users: 48 },
  },
];

// GET /api/admin/tenants - List all tenants
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session as any)?.user?.role;

    // Only SUPER_ADMIN can list all tenants
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const bindingMode = process.env.BINDING_MODE || 'synthetic';

    // In synthetic mode, return synthetic tenants
    if (bindingMode === 'synthetic') {
      let tenants = [...syntheticTenants];

      if (search) {
        const searchLower = search.toLowerCase();
        tenants = tenants.filter(
          (t) =>
            t.name.toLowerCase().includes(searchLower) ||
            t.slug.toLowerCase().includes(searchLower)
        );
      }

      return NextResponse.json({
        tenants,
        total: tenants.length,
      });
    }

    // Build where clause for database mode
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      tenants,
      total: tenants.length,
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/admin/tenants - Create a new tenant
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session as any)?.user?.role;

    // Only SUPER_ADMIN can create tenants
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = CreateTenantSchema.parse(body);

    const bindingMode = process.env.BINDING_MODE || 'synthetic';

    // In synthetic mode, return a mock created tenant
    if (bindingMode === 'synthetic') {
      const newTenant = {
        id: `tenant-${Date.now()}`,
        name: data.name,
        slug: data.slug,
        tier: data.tier,
        status: 'ACTIVE',
        features: data.features ?? DEFAULT_FEATURES,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 0 },
      };

      return NextResponse.json(newTenant, { status: 201 });
    }

    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A tenant with this slug already exists' },
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        tier: data.tier,
        status: 'ACTIVE',
        features: data.features ?? DEFAULT_FEATURES,
        settings: {},
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating tenant:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
