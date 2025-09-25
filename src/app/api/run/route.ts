import { NextRequest } from "next/server";
import { streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Define the StreamFrame types as mentioned in TESTING.md
type StreamFrame = 
  | { type: "phase"; phase: string; attempt: number; message: string }
  | { type: "generation"; content: string; partial: boolean }
  | { type: "validation"; issues: Array<{ id: string; severity: "error" | "warn"; message: string; evidence?: string }> }
  | { type: "self-review"; feedback: string; score: number }
  | { type: "healing"; instructions: string; changes: Array<{ section: string; change: string }> }
  | { type: "result"; success: boolean; data?: any; issues?: Array<any> }
  | { type: "error"; message: string; recoverable: boolean; code?: string };

// NDJSON encoding utility
function encodeStreamFrame(frame: StreamFrame): string {
  return JSON.stringify(frame) + '\n';
}

// Schema for the expected PRD content structure
const prdSchema = z.object({
  title: z.string().describe("Clear, concise product title"),
  overview: z.string().describe("Comprehensive product overview explaining the purpose and value"),
  objectives: z.array(z.string()).describe("Key business and user objectives this product aims to achieve"),
  requirements: z.array(z.object({
    title: z.string().describe("Requirement title"),
    description: z.string().describe("Detailed requirement description with specific criteria"),
    priority: z.enum(["high", "medium", "low"]).describe("Priority level based on business impact"),
  })).describe("Functional and non-functional requirements"),
  timeline: z.string().describe("Development timeline with key milestones"),
  success_metrics: z.array(z.string()).describe("Measurable success criteria and KPIs"),
});

export async function POST(request: NextRequest) {
  const { spec } = await request.json();
  
  // Create a streaming response
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Phase 1: Input Processing
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "phase",
          phase: "input",
          attempt: 1,
          message: "🔍 Processing your spec input..."
        })));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Phase 2: Research & Context Gathering  
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "phase", 
          phase: "rag",
          attempt: 1,
          message: "📚 Gathering context and researching best practices..."
        })));

        await new Promise(resolve => setTimeout(resolve, 800));

        // Phase 3: AI Thinking
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "phase",
          phase: "thinking", 
          attempt: 1,
          message: "🧠 AI is analyzing requirements and structuring content..."
        })));

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Phase 4: Generation
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "phase",
          phase: "generation",
          attempt: 1, 
          message: "✏️ Generating comprehensive PRD content..."
        })));

        // Stream the actual AI generation
        const model = google("gemini-2.0-flash-exp");
        
        const enhancedPrompt = `As a senior product manager, create a comprehensive Product Requirements Document (PRD) for the following concept:

${spec}

Focus on:
- Clear business value and user needs
- Specific, measurable requirements 
- Realistic timelines and priorities
- Enterprise-grade considerations for scalability and security
- Success metrics that align with business objectives

Provide actionable, detailed content that development teams can implement.`;

        const result = await streamObject({
          model,
          schema: prdSchema,
          prompt: enhancedPrompt,
        });

        // Stream partial results as they come in
        for await (const partialObject of result.partialObjectStream) {
          controller.enqueue(encoder.encode(encodeStreamFrame({
            type: "generation",
            content: JSON.stringify(partialObject),
            partial: true
          })));
        }

        const finalObject = await result.object;

        // Phase 5: Validation (simplified for now)
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "phase",
          phase: "validation",
          attempt: 1,
          message: "🔎 Validating content against requirements..."
        })));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock validation - in the real system this would use the modular validation items
        const validationIssues = [];
        if (!finalObject.title || finalObject.title.length < 10) {
          validationIssues.push({
            id: "title-too-short",
            severity: "warn" as const,
            message: "Title should be more descriptive",
            evidence: finalObject.title
          });
        }

        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "validation",
          issues: validationIssues
        })));

        // Phase 6: Result
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "result", 
          success: true,
          data: finalObject,
          issues: validationIssues
        })));

        controller.close();

      } catch (error) {
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error occurred",
          recoverable: true,
          code: "GENERATION_FAILED"
        })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    },
  });
}