import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { sendInviteEmail } from '@/lib/email/resend';
import crypto from 'crypto';
import { z } from 'zod';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).default('USER'),
  name: z.string().min(1).max(200).optional(),
});

/**
 * POST /api/auth/invite
 * Admin invites a user to their tenant via email.
 * Creates user record (inactive, no password) and sends registration link.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;
    const tenantId = (session as any)?.user?.tenantId;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN and ADMIN can invite users
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = InviteSchema.parse(body);

    // ADMIN cannot invite SUPER_ADMIN
    if (role === 'ADMIN' && data.role === 'ADMIN') {
      // Allow ADMIN to invite other ADMINs - only block SUPER_ADMIN
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Get tenant info for the invitation email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Generate invite token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Create user (inactive, no password - will be set on registration)
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name || data.email.split('@')[0],
        role: data.role,
        tenantId: tenantId,
        isActive: false, // Activated when they complete registration
      },
    });

    // Store invite token as a password reset token (same mechanism)
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for invites
      },
    });

    // Build registration URL with invite token
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/auth/register?token=${rawToken}&email=${encodeURIComponent(data.email)}`;

    // Send invite email
    await sendInviteEmail(data.email, inviteUrl, tenant.name);

    return NextResponse.json(
      {
        message: 'Invitation sent',
        userId: user.id,
        email: data.email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error sending invite:', error);
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
  }
}
