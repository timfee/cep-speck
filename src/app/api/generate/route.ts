import type { NextRequest } from 'next/server';

import { runDrafterAgent } from '@/lib/agents/drafter';
import { runEvaluatorAgent } from '@/lib/agents/evaluator';
import { runOutlinerAgent } from '@/lib/agents/outliner';
import { runRefinerAgent } from '@/lib/agents/refiner';
import type { GenerateRequest } from '@/lib/agents/types';

export const runtime = 'nodejs';

/**
 * Create a streaming response from a StreamTextResult
 */
function createStreamingResponse(streamResult: { textStream: AsyncIterable<string> }) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.textStream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'Transfer-Encoding': 'chunked',
    },
  });
}

/**
 * Handle outline generation phase
 */
async function handleOutlinePhase(body: GenerateRequest) {
  if (!body.brief || body.brief.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Brief is required for outline phase' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const outline = await runOutlinerAgent(body.brief);
  return new Response(JSON.stringify(outline), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle draft generation phase
 */
async function handleDraftPhase(body: GenerateRequest) {
  if (!body.outline) {
    return new Response(
      JSON.stringify({ error: 'Outline is required for draft phase' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const streamResult = await runDrafterAgent(body.outline);
  return createStreamingResponse(streamResult);
}

/**
 * Handle evaluation phase
 */
async function handleEvaluatePhase(body: GenerateRequest) {
  if (!body.draft || body.draft.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Draft is required for evaluate phase' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const issues = await runEvaluatorAgent(body.draft);
  return new Response(JSON.stringify(issues), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle refinement phase
 */
async function handleRefinePhase(body: GenerateRequest) {
  if (!body.draft || body.draft.trim().length === 0 || !body.report) {
    return new Response(
      JSON.stringify({ error: 'Draft and report are required for refine phase' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const streamResult = await runRefinerAgent(body.draft, body.report);
  return createStreamingResponse(streamResult);
}

/**
 * New agentic API endpoint that routes to appropriate agent based on phase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateRequest;
    const { phase } = body;

    // API key check
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY on server. Add it to .env.local and restart.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Route to appropriate agent based on phase
    switch (phase) {
      case 'outline':
        return await handleOutlinePhase(body);
      case 'draft':
        return await handleDraftPhase(body);
      case 'evaluate':
        return await handleEvaluatePhase(body);
      case 'refine':
        return await handleRefinePhase(body);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown phase: ${String(phase)}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}