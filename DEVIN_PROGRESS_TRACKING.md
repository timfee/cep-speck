# PRD Spec App — Progress Tracking

Last updated: 2025-09-18

Session: https://app.devin.ai/sessions/7277d848ac294eb4a90ef5eb081e2e02  
Branch: devin/1758222691-scaffold-prd-spec

## Project Requirements (v1)

- Stack
  - Next.js App Router under src/*
  - shadcn/ui components
  - vercel/ai SDK with @ai-sdk/google (Gemini 2.5 Pro)
- UX
  - Left panel: user inputs a spec idea
  - Right panel: streamed draft text, live phases, validation issues
- Backend flow (single route)
  - POST /api/run
  - Loop: generate → validate → heal (repeat until pass or maxAttempts)
  - Streaming output as NDJSON frames:
    - phase, tokens, draft, validation, result, error
- Spec model
  - Data-driven SpecPack JSON
  - Modular logic items (one file per item) exporting:
    - toPrompt(params, pack)
    - validate(draft, params, pack) → Issue[]
    - heal(issues, params, pack) → string | null
  - Healing aggregator builds one concise follow-up message per turn from all issues
- Env
  - GOOGLE_GENERATIVE_AI_API_KEY (server-side only)

## What’s Implemented

- App + UI (src only)
  - src/app/layout.tsx
  - src/app/page.tsx (re-exports PRD page)
  - src/app/(prd)/page.tsx (UI w/ shadcn, streaming reader)
  - shadcn components: src/components/ui/{button,textarea,card,badge,separator}.tsx
- AI model wiring
  - src/lib/ai/provider.ts (gemini-2.5-pro via @ai-sdk/google)
- Spec core
  - src/lib/spec/types.ts (SpecPack, SpecItemDef, Issue, ValidationReport, HealPolicy)
  - src/lib/spec/registry.ts (item registry + registration)
  - src/lib/spec/prompt.ts (system & user prompt builders)
  - src/lib/spec/validate.ts (validateAll orchestrator)
  - src/lib/spec/healing/aggregate.ts (aggregate issues into one follow-up)
  - src/lib/spec/items/index.ts (register all item modules)
- Items (initial set)
  - src/lib/spec/items/sectionCount.ts
  - src/lib/spec/items/labelPattern.ts
  - src/lib/spec/items/metricsRequired.ts
  - src/lib/spec/items/bannedText.ts
- SpecPack (data-driven)
  - src/lib/spec/packs/prd-v1.json
- Streaming route
  - src/app/api/run/route.ts
    - runtime = nodejs
    - Builds messages from SpecPack prompts
    - Streams tokens, validates, aggregates healing, loops until pass/maxAttempts
    - Emits NDJSON frames and handles missing API key

## Current Status

- App renders; /api/run streams tokens from Gemini with the provided API key.
- Validation and healing loop executes; UI shows phases, tokens, issues.
- Known issue (addressed in code + pack):
  - JS RegExp does not support inline PCRE flags `(?i)` from SpecPack.
  - Fixes:
    - Updated SpecPack to remove `(?i)` and keep pattern: `\\bensur(e|es|ing)\\b`
      - File: src/lib/spec/packs/prd-v1.json
    - Updated bannedText item to honor optional inline `(?i)` if present by translating to JS flags
      - File: src/lib/spec/items/bannedText.ts
- Note: The browser still showed a cached error overlay from the prior pattern at the time of the last screenshot; re-running should now proceed without the invalid-group error.

## What Remains

1) Verify the fix live
   - Restart dev if needed; click Run; confirm no regex error and that validation frames arrive.

2) UI polish
   - Make phase chips more prominent
   - Optionally surface the composed healing instruction text in the UI

3) Additional logic items (each as its own module)
   - Traceability IDs reuse across sections (§4, §6, §8)
   - FR-ID format check (e.g., `^FR-F\\d+\\.\\d+:`)
   - Word budget + compression hints
   - Annex placement/labels after #9
   - Acronym first-use expansion check
   - Coverage checks (features have FR blocks, personas appear in §2, etc.)

4) Docs
   - README with setup, run, SpecPack extension guide
   - Inline examples of adding new items and changing SpecPack behavior

5) Repo/PR
   - Add remote
   - Push branch: devin/1758222691-scaffold-prd-spec
   - Create PR with screenshots and run notes

## Local Run Instructions

- Prereqs
  - Node (via nvm), pnpm
  - .env.local: GOOGLE_GENERATIVE_AI_API_KEY=... (server-side only)
- Install and run
  - pnpm install
  - pnpm dev
  - http://localhost:3000
- Use
  - Enter a short spec idea (e.g., project name, SKU)
  - Click Run
  - Watch phases, streamed tokens, and validation issues

## File Map (key files)

- UI
  - src/app/(prd)/page.tsx
  - src/components/ui/*
- Spec core
  - src/lib/spec/types.ts
  - src/lib/spec/registry.ts
  - src/lib/spec/prompt.ts
  - src/lib/spec/validate.ts
  - src/lib/spec/healing/aggregate.ts
  - src/lib/spec/items/*
  - src/lib/spec/packs/prd-v1.json
- AI
  - src/lib/ai/provider.ts
- API
  - src/app/api/run/route.ts

## Known Issues / Decisions

- Regex flags: SpecPack must avoid PCRE inline flags in pattern strings. The item implementation will handle optional inline `(?i)` for robustness, but recommended approach is to omit flags in the JSON and let code apply flags.
- Runtime: Using nodejs (not edge) for simplicity with streaming; can revisit edge runtime later if desired.

## Next Session Pick-up Checklist

- [ ] Run pnpm dev and click Run to confirm regex error is gone.
- [ ] Capture a streaming run screenshot.
- [ ] Add README with quickstart + SpecPack guide.
- [ ] Implement 1–2 additional items (e.g., FR-ID validator, word budget).
- [ ] Push branch and open PR once remote is provided.
