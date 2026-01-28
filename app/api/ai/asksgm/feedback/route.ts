/**
 * AskSGM Feedback API
 * Records thumbs up/down feedback for AI responses
 *
 * Stores feedback in the audit log for now.
 * Can be extended to update answer confidence or train models.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface FeedbackRequest {
  conversationId: string;
  messageIndex?: number;
  feedbackType: 'thumbs_up' | 'thumbs_down';
  feedbackText?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FeedbackRequest;

    // Validate required fields
    if (!body.conversationId || typeof body.conversationId !== 'string') {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    if (!body.feedbackType || !['thumbs_up', 'thumbs_down'].includes(body.feedbackType)) {
      return NextResponse.json(
        { error: 'feedbackType must be "thumbs_up" or "thumbs_down"' },
        { status: 400 }
      );
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      undefined;

    // Verify conversation exists
    const conversation = await prisma.governanceConversation.findUnique({
      where: { id: body.conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Log feedback to audit log
    const auditEntry = await prisma.auditLog.create({
      data: {
        tenantId: conversation.tenantId,
        userId: conversation.userId,
        action: 'AI_FEEDBACK',
        resource: 'GovernanceConversation',
        resourceId: body.conversationId,
        details: {
          feedbackType: body.feedbackType,
          feedbackText: body.feedbackText,
          messageIndex: body.messageIndex,
          ipAddress,
        },
      },
    });

    console.log(`[AskSGM Feedback] ${body.feedbackType} for conversation ${body.conversationId}`);

    return NextResponse.json({
      success: true,
      feedbackId: auditEntry.id,
    });
  } catch (error) {
    console.error('[AskSGM Feedback API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check feedback status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Missing conversationId parameter' },
      { status: 400 }
    );
  }

  const feedback = await prisma.auditLog.findFirst({
    where: {
      resourceId: conversationId,
      action: 'AI_FEEDBACK',
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    hasFeedback: !!feedback,
    feedbackType: feedback ? (feedback.details as any)?.feedbackType : null,
  });
}
