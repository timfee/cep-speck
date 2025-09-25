import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { validateDraft } from "@/lib/spec/validate";
import { createPromptWithValidation } from "@/lib/spec/prompt";
import { encodeStreamFrame } from "@/lib/spec/types";
import type { StreamFrame, Issue } from "@/lib/spec/types";
import specPack from "@/lib/spec/packs/prd-v1.json";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { spec } = await request.json();
  
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const errorFrame: StreamFrame = {
      type: "error",
      message: "Missing GOOGLE_GENERATIVE_AI_API_KEY",
      recoverable: false,
      code: "MISSING_API_KEY"
    };
    
    return new Response(encodeStreamFrame(errorFrame), {
      status: 400,
      headers: {
        'Content-Type': 'application/x-ndjson',
      },
    });
  }
  
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

        // Build prompt with validation constraints
        const enhancedPrompt = createPromptWithValidation(spec, specPack);
        
        // Stream the actual AI generation
        const model = google("gemini-2.0-flash-exp");
        
        const result = await streamText({
          model,
          prompt: enhancedPrompt,
          temperature: 0.3, // Lower temperature for more consistent output
        });

        let fullContent = '';

        // Stream partial results as they come in
        for await (const textPart of result.textStream) {
          fullContent += textPart;
          
          controller.enqueue(encoder.encode(encodeStreamFrame({
            type: "generation",
            content: fullContent,
            partial: true
          })));
        }

        // Phase 5: Validation
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "phase",
          phase: "validation",
          attempt: 1,
          message: "🔎 Validating content against requirements..."
        })));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Run validation using the modular validation system
        const validationIssues = await validateDraft(fullContent, specPack);

        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "validation",
          issues: validationIssues,
          passed: validationIssues.filter(i => i.severity === 'error').length === 0
        })));

        // Check if we need healing
        const hasErrors = validationIssues.some(issue => issue.severity === 'error');
        
        if (hasErrors && validationIssues.length > 0) {
          // Phase 6: Healing
          controller.enqueue(encoder.encode(encodeStreamFrame({
            type: "phase",
            phase: "healing",
            attempt: 1,
            message: "🩹 Refining content to address validation issues..."
          })));

          // Create healing instructions
          const healingInstructions = validationIssues
            .filter(issue => issue.severity === 'error')
            .map(issue => `Fix: ${issue.message}${issue.evidence ? ` (Evidence: ${issue.evidence})` : ''}`)
            .join('\n');

          controller.enqueue(encoder.encode(encodeStreamFrame({
            type: "healing",
            instructions: healingInstructions,
            changes: validationIssues.map(issue => ({
              section: issue.location?.section || 'general',
              change: issue.message,
              reason: issue.evidence || 'validation requirement'
            }))
          })));

          // Run healing generation
          const healingPrompt = `${enhancedPrompt}

IMPORTANT: The following issues were found in the previous version and MUST be fixed:

${healingInstructions}

Please generate an improved version that addresses all these validation issues while maintaining the quality and completeness of the content.`;

          const healingResult = await streamText({
            model,
            prompt: healingPrompt,
            temperature: 0.2, // Even lower temperature for healing
          });

          let healedContent = '';
          for await (const textPart of healingResult.textStream) {
            healedContent += textPart;
            
            controller.enqueue(encoder.encode(encodeStreamFrame({
              type: "generation",
              content: healedContent,
              partial: true
            })));
          }

          fullContent = healedContent;

          // Re-validate after healing
          const revalidationIssues = await validateDraft(fullContent, specPack);
          
          controller.enqueue(encoder.encode(encodeStreamFrame({
            type: "validation",
            issues: revalidationIssues,
            passed: revalidationIssues.filter(i => i.severity === 'error').length === 0
          })));
        }

        // Phase 6/7: Result
        controller.enqueue(encoder.encode(encodeStreamFrame({
          type: "result", 
          success: true,
          data: fullContent,
          issues: validationIssues,
          attempts: hasErrors ? 2 : 1
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