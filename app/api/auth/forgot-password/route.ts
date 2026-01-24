import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { sendPasswordResetEmail } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { message: 'If that email exists, a reset link has been sent' },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && user.isActive && user.password) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt,
        },
      });

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    return NextResponse.json(
      { message: 'If that email exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'If that email exists, a reset link has been sent' },
      { status: 200 }
    );
  }
}