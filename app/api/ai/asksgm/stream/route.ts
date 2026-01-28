/**
 * AskSGM Streaming API
 * Server-Sent Events endpoint for real-time LLM responses
 *
 * Adapts the IntelligentSPM streaming pattern for SGM's governance context.
 * Uses AICR Gateway > Rally LLM > Anthropic Direct fallback chain.
 */

import { NextRequest } from 'next/server';
import { getAICRGatewayClient, isAICRGatewayConfigured } from '@/lib/aicr';
import { getRallyLLMClient, isRallyLLMConfigured } from '@/lib/ai/rally-llm-client';

interface StreamEvent {
  type: 'start' | 'chunk' | 'context' | 'done' | 'error';
  data: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.query || typeof body.query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendEvent = (event: StreamEvent) => {
          controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`));
        };

        // Send start event
        sendEvent({ type: 'start', data: { query: body.query } });

        let success = false;

        // Priority 1: Try AICR Gateway
        if (!success && isAICRGatewayConfigured()) {
          try {
            const client = getAICRGatewayClient();
            sendEvent({ type: 'context', data: { source: 'aicr-gateway' } });

            const response = await client.chat({
              messages: [{ role: 'user', content: body.query }],
              model: 'claude-sonnet-4',
              max_tokens: 2000,
            });

            const content = response.choices[0]?.message?.content || '';
            const chunkSize = 50;
            for (let i = 0; i < content.length; i += chunkSize) {
              const chunk = content.slice(i, i + chunkSize);
              sendEvent({ type: 'chunk', data: { content: chunk } });
              await new Promise(r => setTimeout(r, 10));
            }

            sendEvent({ type: 'done', data: {
              totalTokens: response.usage?.total_tokens,
              source: 'aicr-gateway'
            }});
            success = true;
          } catch (gatewayError) {
            console.warn('[AskSGM Stream] AICR Gateway failed, trying fallback:', gatewayError);
          }
        }

        // Priority 2: Try Rally LLM
        if (!success && isRallyLLMConfigured()) {
          try {
            const client = getRallyLLMClient();
            sendEvent({ type: 'context', data: { source: 'rally-llm' } });

            const response = await client.chat(
              [{ role: 'user', content: body.query }]
            );

            const content = response.content || '';
            const chunkSize = 50;
            for (let i = 0; i < content.length; i += chunkSize) {
              const chunk = content.slice(i, i + chunkSize);
              sendEvent({ type: 'chunk', data: { content: chunk } });
              await new Promise(r => setTimeout(r, 10));
            }

            sendEvent({ type: 'done', data: { source: 'rally-llm' }});
            success = true;
          } catch (rallyError) {
            console.warn('[AskSGM Stream] Rally LLM failed, trying fallback:', rallyError);
          }
        }

        // Priority 3: Try direct Anthropic API
        if (!success && process.env.ANTHROPIC_API_KEY) {
          try {
            sendEvent({ type: 'context', data: { source: 'anthropic-direct' } });

            const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{ role: 'user', content: body.query }],
              }),
            });

            if (!anthropicResponse.ok) {
              throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
            }

            const data = await anthropicResponse.json() as {
              content: Array<{ type: string; text: string }>;
              usage?: { input_tokens: number; output_tokens: number };
            };
            const content = data.content?.[0]?.text || '';
            const chunkSize = 50;
            for (let i = 0; i < content.length; i += chunkSize) {
              const chunk = content.slice(i, i + chunkSize);
              sendEvent({ type: 'chunk', data: { content: chunk } });
              await new Promise(r => setTimeout(r, 10));
            }

            sendEvent({ type: 'done', data: {
              totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
              source: 'anthropic-direct'
            }});
            success = true;
          } catch (anthropicError) {
            console.error('[AskSGM Stream] Anthropic API failed:', anthropicError);
            const message = anthropicError instanceof Error ? anthropicError.message : 'Unknown error';
            sendEvent({ type: 'error', data: { message } });
          }
        }

        // No provider succeeded
        if (!success) {
          sendEvent({ type: 'error', data: { message: 'No LLM provider available' } });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[AskSGM Stream API] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Stream request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
