import { getResilientAI } from "@/lib/ai/resilient";
import { readKnowledgeDirectory } from "@/lib/knowledge/reader";
import { performCompetitorResearch } from "@/lib/research/webSearch";
import { aggregateHealing } from "@/lib/spec/healing/aggregate";
import "@/lib/spec/items";
import packData from "@/lib/spec/packs/prd-v1.json";
import { assertValidSpecPack } from "@/lib/spec/packValidate";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/spec/prompt";
import { performSelfReview } from "@/lib/spec/selfReview";
import {
  createErrorFrame,
  createGenerationFrame,
  createPhaseFrame,
  createResultFrame,
  createStreamFrame,
  createValidationFrame,
  encodeStreamFrame,
  StreamingError,
  withErrorRecovery,
} from "@/lib/spec/streaming";
import type { SpecPack } from "@/lib/spec/types";
import { validateAll } from "@/lib/spec/validate";
import type { CoreMessage } from "ai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Type-cast the imported JSON to SpecPack once at module level
// TODO: This `as` cast is necessary due to TypeScript's JSON import limitations
// The pack is validated at runtime via assertValidSpecPack()
const pack: SpecPack = packData as SpecPack;

export async function POST(req: NextRequest) {
  const { specText, maxAttempts: maxOverride } = await req.json();
  const maxAttempts = Math.min(
    maxOverride ?? pack.healPolicy.maxAttempts ?? 3,
    5
  );

  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      let controllerClosed = false;
      
      const safeClose = () => {
        if (!controllerClosed) {
          controller.close();
          controllerClosed = true;
        }
      };
      
      const safeEnqueue = (frame: Uint8Array) => {
        if (!controllerClosed) {
          controller.enqueue(frame);
        }
      };
      
      try {
        // API key check
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          const errorFrame = createErrorFrame(
            "Missing GOOGLE_GENERATIVE_AI_API_KEY on server. Add it to .env.local and restart.",
            false, // Not recoverable without restart
            "MISSING_API_KEY"
          );
          safeEnqueue(encodeStreamFrame(errorFrame));
          safeClose();
          return;
        }

        // Validate pack structure
        try {
          await withErrorRecovery(async () => {
            assertValidSpecPack(pack);
          }, "SpecPack validation");
        } catch (error) {
          if (error instanceof StreamingError) {
            safeEnqueue(encodeStreamFrame(error.toStreamFrame()));
            safeClose();
            return;
          }
          throw error;
        }

        // Phase 1: Load knowledge
        safeEnqueue(
          encodeStreamFrame(
            createPhaseFrame("loading-knowledge", 0, "Loading knowledge base")
          )
        );

        const knowledgeFiles = await withErrorRecovery(
          () => readKnowledgeDirectory("./knowledge"),
          "Knowledge loading"
        );

        // Phase 2: Perform research
        safeEnqueue(
          encodeStreamFrame(
            createPhaseFrame(
              "performing-research",
              0,
              "Researching competitors"
            )
          )
        );

        const researchResult = await withErrorRecovery(
          () =>
            performCompetitorResearch([
              "Zscaler",
              "Island",
              "Talon",
              "Microsoft Edge for Business",
            ]),
          "Competitor research"
        );

        // Build context and messages
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

        const system = buildSystemPrompt(pack) + researchContext;
        const messages: CoreMessage[] = [
          { role: "system", content: system },
          { role: "user", content: buildUserPrompt(specText) },
        ];

        // Initialize resilient AI
        const ai = getResilientAI();

        // Main generate-validate-heal loop
        let attempt = 0;
        let finalDraft = "";
        let totalTokens = 0;

        while (attempt < maxAttempts) {
          attempt++;

          // Phase 3: Generate content
          safeEnqueue(
            encodeStreamFrame(
              createPhaseFrame(
                "generating",
                attempt,
                `Generating content (attempt ${attempt}/${maxAttempts})`
              )
            )
          );

          const result = await ai.generateWithFallback(messages);

          let draftContent = "";
          for await (const delta of result.textStream) {
            draftContent += delta;
            safeEnqueue(
              encodeStreamFrame(
                createGenerationFrame(delta, draftContent, ++totalTokens)
              )
            );
          }

          const draft = await result.text;
          finalDraft = draft;

          // Phase 4: Validate content
          const validationStartTime = Date.now();
          safeEnqueue(
            encodeStreamFrame(
              createPhaseFrame(
                "validating",
                attempt,
                "Running validation checks"
              )
            )
          );

          const report = validateAll(draft, pack);

          const validationDuration = Date.now() - validationStartTime;
          safeEnqueue(
            encodeStreamFrame(createValidationFrame(report, validationDuration))
          );

          if (report.ok) {
            finalDraft = draft;
            const totalDuration = Date.now() - startTime;

            safeEnqueue(
              encodeStreamFrame(
                createPhaseFrame("done", attempt, "Content generation complete")
              )
            );
            safeEnqueue(
              encodeStreamFrame(
                createResultFrame(true, finalDraft, attempt, totalDuration)
              )
            );
            break;
          }

          // Phase 5: AI self-review phase for filtering false positives
          const selfReviewStartTime = Date.now();
          safeEnqueue(
            encodeStreamFrame(
              createPhaseFrame(
                "self-reviewing",
                attempt,
                "Filtering validation issues"
              )
            )
          );

          let issuesToHeal = report.issues;
          try {
            const { confirmed, filtered } = await performSelfReview(
              draft,
              report.issues
            );

            const selfReviewDuration = Date.now() - selfReviewStartTime;
            safeEnqueue(
              encodeStreamFrame(
                createStreamFrame("self-review", {
                  confirmed,
                  filtered,
                  duration: selfReviewDuration,
                })
              )
            );

            // Use confirmed issues for healing
            if (confirmed.length === 0) {
              finalDraft = draft;
              const totalDuration = Date.now() - startTime;

              safeEnqueue(
                encodeStreamFrame(
                  createPhaseFrame(
                    "done",
                    attempt,
                    "Content approved after self-review"
                  )
                )
              );
              safeEnqueue(
                encodeStreamFrame(
                  createResultFrame(true, finalDraft, attempt, totalDuration)
                )
              );
              break;
            }

            issuesToHeal = confirmed;
          } catch (selfReviewError) {
            console.warn(
              "Self-review failed, proceeding with all issues:",
              selfReviewError
            );
            // Continue with original issues if self-review fails
          }

          // Phase 6: Healing phase
          safeEnqueue(
            encodeStreamFrame(
              createPhaseFrame(
                "healing",
                attempt,
                `Preparing healing instructions for ${issuesToHeal.length} issues`
              )
            )
          );
          const followup = aggregateHealing(issuesToHeal, pack);

          safeEnqueue(
            encodeStreamFrame(
              createStreamFrame("healing", {
                instruction: followup,
                issueCount: issuesToHeal.length,
                attempt,
              })
            )
          );

          messages.push({ role: "assistant", content: draft });
          messages.push({ role: "user", content: followup });
          finalDraft = draft;

          if (attempt === maxAttempts) {
            const totalDuration = Date.now() - startTime;
            safeEnqueue(
              encodeStreamFrame(
                createPhaseFrame(
                  "failed",
                  attempt,
                  `Max attempts reached (${maxAttempts})`
                )
              )
            );
            safeEnqueue(
              encodeStreamFrame(
                createResultFrame(false, finalDraft, attempt, totalDuration)
              )
            );
            break;
          }
        }

        safeClose();
      } catch (e: unknown) {
        const error =
          e instanceof StreamingError
            ? e
            : new StreamingError(
                e instanceof Error ? e.message : String(e),
                false, // Unexpected errors are not recoverable
                "UNEXPECTED_ERROR",
                e
              );

        safeEnqueue(encodeStreamFrame(error.toStreamFrame()));
        safeClose();
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
