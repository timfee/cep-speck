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

✅ **Fully functional application** - App renders and /api/run streams tokens from Gemini successfully
✅ **Generate-validate-heal cycle working** - Complete workflow executes with proper phase transitions
✅ **Regex fix verified** - No JavaScript RegExp errors; bannedText validation works properly
✅ **TypeScript errors resolved** - Registry system properly handles modular item signatures
✅ **Modular architecture implemented** - Each validation item is self-contained with toPrompt(), validate(), heal()
✅ **Word budget validation added** - New modular item enforces target/hard cap with compression healing
✅ **Enhanced UI** - Prominent phase indicators with colors and emoji, better visual feedback
✅ **Comprehensive documentation** - README clearly explains modular architecture and original vision
✅ **FR-X mandates removed** - No longer enforcing cryptic FR-F format requirements per user request

The application successfully fulfills the original vision of modular spec components with self-healing validation.

## What's Completed (Latest Session)

✅ **Verified the regex fix works** - Application runs without JavaScript RegExp errors
✅ **Fixed TypeScript signature mismatches** - Registry system now properly handles different parameter signatures
✅ **Removed FR-X style mandates** - No longer enforcing cryptic FR-F format requirements per user feedback
✅ **Implemented word budget validation** - New modular item with target/hard cap limits and compression healing
✅ **Made phase indicators more prominent** - Enhanced UI with larger badges, colors, and emoji indicators
✅ **Created comprehensive README** - Detailed documentation explaining modular architecture and original vision
✅ **Updated progress tracking** - Reflects current state and completed work

## What Remains (Optional Future Enhancements)

1) Additional validation items (each as its own module)
   - Traceability IDs reuse across sections (§4, §6, §8)
   - Annex placement/labels after #9  
   - Acronym first-use expansion check
   - Coverage checks (features have FR blocks, personas appear in §2, etc.)

2) UI enhancements
   - Surface the composed healing instruction text in the UI
   - Add progress indicators or animations for active phases

3) Advanced features
   - Multiple SpecPack support
   - Custom validation item templates
   - Export/import SpecPack configurations

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

## Completed Checklist

- [x] Run npm dev and click Run to confirm regex error is gone.
- [x] Capture streaming run screenshots and verify functionality.
- [x] Add comprehensive README with quickstart + SpecPack guide + modular architecture explanation.
- [x] Implement word budget validation item (skipped FR-ID per user request to remove FR-X mandates).
- [x] Fix TypeScript signature mismatches in registry system.
- [x] Enhance UI with prominent phase indicators and better visual feedback.
- [x] Update progress tracking to reflect completed work.
- [x] Ready for testing and potential PR creation.

## Current Session Focus: L7+ Quality Enhancement

### 🚧 Latest Enhancements (This Session)
- **L7+ Executive Quality Validation**: Added comprehensive executiveQuality.ts validator targeting Google PM-level standards
- **Enhanced Banned Text Patterns**: Expanded prd-v1.json with 10+ new regex patterns catching AI-isms, sensationalist language, cutesy headings, empty business speak
- **Gemini-Powered Research**: Enhanced competitor research to use Gemini's built-in web search capabilities with citations
- **Quality Theater Prevention**: Added detection for NPS, satisfaction scores, invented metrics, and meaningless quality indicators
- **Heuristic Surfacing**: Implemented validation to encourage stating reasoning directly vs hiding behind gameable metrics
- **System Prompt Enhancement**: Updated prompt.ts to embody L7+ Google PM thinking: precise, factual, executive-level

### 🎯 Banned Text Patterns Added
- **Sensationalist Language**: revolutionary, game-changing, breakthrough, cutting-edge, world-class, industry-leading
- **Empty Business Speak**: solidify our future, strengthen our position, unlock value, maximize potential, optimize synergies
- **Cutesy/Punchy Headings**: not just another, think again, here's the thing, plot twist, spoiler alert, game on
- **Quality Theater Metrics**: NPS, Net Promoter Score, satisfaction score, happiness index, engagement score
- **Over-Explanation**: as mentioned, it should be noted, to put it simply, what this means is, the implication is
- **Verbose Transitions**: moreover, furthermore, at the end of the day, going forward, needless to say
- **Corporate Buzzwords**: deep dive, circle back, low-hanging fruit, paradigm shift, think outside the box
- **Superlative Overuse**: amazing, incredible, fantastic, phenomenal, outstanding, exceptional

### 🔧 Technical Improvements
- **TypeScript Clean**: Fixed all lint warnings about unused parameters in executiveQuality.ts
- **Modular Architecture**: Maintained toPrompt(), validate(), heal() pattern for all new validators
- **Deterministic Priority**: Regex patterns provide fast, reliable validation before Gemini evaluation
- **Same-Thread Context**: Gemini self-evaluation maintains conversation context for better validation

### 🎯 Next Session Priorities
1. **Real-World Testing**: Generate multiple PRDs and assess L7+ quality effectiveness against actual AI outputs
2. **Pattern Refinement**: Test banned text patterns and refine based on effectiveness
3. **Knowledge Directory**: Populate ./knowledge/ with sample files and test integration
4. **Advanced Metrics**: Enhance detection of invented baselines, unrealistic targets, and quality theater

## Session Summary

Implemented comprehensive L7+ quality validation system with enhanced banned text patterns targeting common AI-generated content issues. Added executiveQuality validator with sophisticated quality checks, enhanced competitor research with Gemini integration, and strengthened system prompts for Google PM-level output. Focus on dense, on-point PRDs without quality theater or over-explanation. All changes ready for commit and testing.
  
- 2025-09-18: Fixed TypeScript registration mismatch for executiveQuality in src/lib/spec/items/index.ts (toPrompt now zero-arg; heal now issues-only).  
- 2025-09-18: Added knowledge seeds under ./knowledge (cep/policy-templates.md, enterprise-browsers/vendors.md, mobile/android-enterprise.md) to influence research context.  
- 2025-09-18: Strengthened bannedText heading pattern to anchor additional cutesy phrases in headers; added explicit anchored variant to avoid body false-positives.  
- 2025-09-18: Expanded executiveQuality metrics unit whitelist to reduce false positives (added s/sec/seconds, qps, rps, rpm, req/s).
