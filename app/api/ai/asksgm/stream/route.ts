/**
 * AskSGM Streaming API
 * Server-Sent Events endpoint for real-time LLM responses
 *
 * Adapts the IntelligentSPM streaming pattern for SGM's governance context.
 * Uses AICR Gateway > Rally LLM > OpenAI fallback chain.
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

        try {
          // Send start event
          sendEvent({ type: 'start', data: { query: body.query } });

          // Try AICR Gateway first (has streaming support)
          if (isAICRGatewayConfigured()) {
            const client = getAICRGatewayClient();

            // Send context event
            sendEvent({ type: 'context', data: { source: 'aicr-gateway' } });

            // For now, get full response and send as chunks
            // TODO: Implement true streaming when Gateway supports it
            const response = await client.chat({
              messages: [{ role: 'user', content: body.query }],
              model: 'claude-sonnet-4',
              max_tokens: 2000,
            });

            // Simulate streaming by chunking the response
            const content = response.choices[0]?.message?.content || '';
            const chunkSize = 50;
            for (let i = 0; i < content.length; i += chunkSize) {
              const chunk = content.slice(i, i + chunkSize);
              sendEvent({ type: 'chunk', data: { content: chunk } });
              // Small delay for streaming effect
              await new Promise(r => setTimeout(r, 10));
            }

            sendEvent({ type: 'done', data: {
              totalTokens: response.usage?.total_tokens,
              source: 'aicr-gateway'
            }});
          } else if (isRallyLLMConfigured()) {
            // Fallback to Rally LLM
            const client = getRallyLLMClient();
            sendEvent({ type: 'context', data: { source: 'rally-llm' } });

            const response = await client.chat(
              [{ role: 'user', content: body.query }]
            );

            // Stream the response
            const content = response.content || '';
            const chunkSize = 50;
            for (let i = 0; i < content.length; i += chunkSize) {
              const chunk = content.slice(i, i + chunkSize);
              sendEvent({ type: 'chunk', data: { content: chunk } });
              await new Promise(r => setTimeout(r, 10));
            }

            sendEvent({ type: 'done', data: { source: 'rally-llm' }});
          } else if (process.env.ANTHROPIC_API_KEY) {
            // Fallback to direct Anthropic API
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
          } else {
            throw new Error('No LLM provider configured');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error('[AskSGM Stream] Error:', error);
          sendEvent({ type: 'error', data: { message } });
        } finally {
          controller.close();
        }
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
