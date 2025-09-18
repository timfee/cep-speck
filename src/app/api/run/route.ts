import { geminiModel } from "@/lib/ai/provider";
import { readKnowledgeDirectory } from "@/lib/knowledge/reader";
import { performCompetitorResearch } from "@/lib/research/webSearch";
import { aggregateHealing } from "@/lib/spec/healing/aggregate";
import "@/lib/spec/items";
import pack from "@/lib/spec/packs/prd-v1.json";
import { assertValidSpecPack } from "@/lib/spec/packValidate";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/spec/prompt";
import type { SpecPack } from "@/lib/spec/types";
import { validateAll } from "@/lib/spec/validate";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function sseLine(obj: Record<string, unknown>) {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(req: NextRequest) {
  const { specText, maxAttempts: maxOverride } = await req.json();
  const maxAttempts = Math.min(
    maxOverride ?? (pack as SpecPack).healPolicy.maxAttempts ?? 3,
    5
  );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          controller.enqueue(
            sseLine({
              type: "error",
              message:
                "Missing GOOGLE_GENERATIVE_AI_API_KEY on server. Add it to .env.local and restart.",
            })
          );
          controller.close();
          return;
        }
        // Validate pack once (fail fast if structurally invalid)
        try {
          assertValidSpecPack(pack as SpecPack);
        } catch (e) {
          controller.enqueue(
            sseLine({ type: "error", message: (e as Error).message })
          );
          controller.close();
          return;
        }
        controller.enqueue(
          sseLine({ type: "phase", phase: "loading-knowledge", attempt: 0 })
        );
        const knowledgeFiles = await readKnowledgeDirectory("./knowledge");

        controller.enqueue(
          sseLine({ type: "phase", phase: "performing-research", attempt: 0 })
        );
        const researchResult = await performCompetitorResearch([
          "Zscaler",
          "Island",
          "Talon",
          "Microsoft Edge for Business",
        ]);

        let researchContext = "";
        if (knowledgeFiles.length > 0) {
          researchContext += `\n\nKnowledge Base Context:\n${knowledgeFiles
            .map((f) => `${f.path}:\n${f.content}`)
            .join("\n\n")}`;
        }

        if (researchResult.competitors.length > 0) {
          researchContext += `\n\nCompetitor Research Results:\n${researchResult.competitors
            .map(
              (c) =>
                `${c.vendor}:\n- Onboarding: ${c.onboardingDefaults}\n- Policy Templates: ${c.policyTemplates}\n- Enterprise Browser: ${c.enterpriseBrowser}\n- Data Protection: ${c.dataProtection}\n- Mobile Support: ${c.mobileSupport}`
            )
            .join("\n\n")}`;
        }

        if (researchResult.autoFilledFacts.length > 0) {
          researchContext += `\n\nAuto-filled Facts: ${researchResult.autoFilledFacts.join(
            ", "
          )}`;
        }

        const system = buildSystemPrompt(pack as SpecPack) + researchContext;
        const messages: {
          role: "system" | "user" | "assistant";
          content: string;
        }[] = [
          { role: "system", content: system },
          { role: "user", content: buildUserPrompt(specText) },
        ];

        let attempt = 0;
        let finalDraft = "";
        while (attempt < maxAttempts) {
          attempt++;
          controller.enqueue(
            sseLine({ type: "phase", phase: "generating", attempt })
          );

          const result = await streamText({
            model: geminiModel(),
            messages,
          });

          for await (const delta of result.textStream) {
            controller.enqueue(sseLine({ type: "tokens", delta }));
          }

          const draft = await result.text;
          controller.enqueue(sseLine({ type: "draft", draft }));

          controller.enqueue(
            sseLine({ type: "phase", phase: "validating", attempt })
          );
          const report = validateAll(draft, pack as SpecPack);
          controller.enqueue(sseLine({ type: "validation", report }));

          if (report.ok) {
            finalDraft = draft;
            controller.enqueue(
              sseLine({ type: "phase", phase: "done", attempt })
            );
            controller.enqueue(sseLine({ type: "result", draft: finalDraft }));
            break;
          }

          controller.enqueue(
            sseLine({ type: "phase", phase: "healing", attempt })
          );
          const followup = aggregateHealing(report.issues, pack as SpecPack);
          messages.push({ role: "assistant", content: draft });
          messages.push({ role: "user", content: followup });
          finalDraft = draft;

          if (attempt === maxAttempts) {
            controller.enqueue(
              sseLine({ type: "phase", phase: "failed", attempt })
            );
            controller.enqueue(sseLine({ type: "result", draft: finalDraft }));
            break;
          }
        }

        controller.close();
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        controller.enqueue(sseLine({ type: "error", message: errorMessage }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
