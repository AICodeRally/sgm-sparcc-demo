import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  try {
    // Read Authorization header (Bearer token)
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify JWT
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Fetch user from DB by userId from token
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        tenant: true,
      },
    });

    // If user not found or not active, return 401
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          tier: user.tenant.tier,
        },
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
