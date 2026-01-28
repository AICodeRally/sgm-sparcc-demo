/**
 * AskSGM Session Management API
 * Handles conversation session operations
 *
 * Uses GovernanceConversation model for session tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'crypto';

/**
 * POST - Create a new conversation session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Create a new governance conversation
    const conversation = await prisma.governanceConversation.create({
      data: {
        tenantId: body.tenantId || 'default',
        aicrConversationId: randomUUID(), // Generate a unique ID
        userId: body.userId,
        contextSnapshot: body.context || null,
        messageCount: 0,
      },
    });

    return NextResponse.json({
      sessionId: conversation.id,
      conversationId: conversation.aicrConversationId,
      createdAt: conversation.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('[AskSGM Session API] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear/end a session
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Soft delete - just mark as ended by setting endedAt
    await prisma.governanceConversation.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
        // Note: Add endedAt field to schema if needed
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AskSGM Session API] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get session details or stats
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const action = request.nextUrl.searchParams.get('action');

    // Get stats for all sessions
    if (action === 'stats') {
      const totalCount = await prisma.governanceConversation.count();
      const recentCount = await prisma.governanceConversation.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return NextResponse.json({
        totalSessions: totalCount,
        sessionsLast24h: recentCount,
      });
    }

    // Get specific session
    if (sessionId) {
      const conversation = await prisma.governanceConversation.findUnique({
        where: { id: sessionId },
        include: {
          review: {
            select: { id: true, planName: true, coverageIndex: true },
          },
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        sessionId: conversation.id,
        conversationId: conversation.aicrConversationId,
        messageCount: conversation.messageCount,
        context: conversation.contextSnapshot,
        review: conversation.review,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      });
    }

    // Default: return recent sessions
    const sessions = await prisma.governanceConversation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        aicrConversationId: true,
        messageCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[AskSGM Session API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get session info' },
      { status: 500 }
    );
  }
}
