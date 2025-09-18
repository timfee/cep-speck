# PRD Spec App — Progress Tracking & Architectural Assessment

Last updated: 2025-09-18 (post-registry refactor)

## 🚨 CRITICAL CODEBASE ASSESSMENT (September 2025)

## Status

PHASE 1 (Registry & Validators) COMPLETE – Remaining: Streaming & AI Resilience

### Executive Summary for Next AI Agent

This codebase shows clear signs of **multiple LLM sessions with piecemeal development**. While functionally working, it has accumulated significant technical debt that blocks scalable development. The core issues stem from prioritizing feature velocity over architectural quality.

**PREVIOUS IMMEDIATE CONCERNS (September 2025) & CURRENT STATE:**

- Type-unsafe registry system with 20+ `as` casts → ✅ Replaced by generic `ValidatorModule<P>` registry; single erased boundary; zero external casts.
- Inconsistent validation item interfaces across 14+ modules → ✅ All items standardized to `(params, pack?)` signatures; object-export `itemModule` pattern.
- Basic streaming protocol lacking structure and error recovery → ⏳ Not yet addressed (next major phase).
- Single-point-of-failure AI dependency with no resilience → ⏳ Pending multi-provider abstraction design.
- Growing maintenance burden from architectural shortcuts → ⬆️ Reduced for validation subsystem; still present in streaming & AI layers.

### Required Architectural Changes

#### 1. Type-Safe Registry System (CRITICAL PRIORITY) — COMPLETE

Implemented a generic registry:

```typescript
export interface ValidatorModule<Params = void> {
  itemId: string;
  toPrompt: (params: Params, pack?: SpecPack) => string;
  validate: (draft: string, params: Params, pack?: SpecPack) => Issue[];
  heal: (issues: Issue[], params: Params, pack?: SpecPack) => string | null;
}
```

Key outcomes:

- All validator modules converted to `itemModule` object export.
- Registration via `registerItem(createValidatorModule(itemModule))` – no repeated casts.
- Centralized erased map boundary (`Record<string, ValidatorModule<unknown>>`) isolates unsafeness.
- Invocation helpers `invokeItemToPrompt/Validate/Heal` eliminate scattered dynamic dispatch logic.
- Eliminated legacy ad-hoc registration logic & 20+ unsafe assertions.

#### 2. Structured Streaming Protocol (HIGH PRIORITY)

**Current Problem**: Basic NDJSON with inconsistent data structures

```typescript
// TARGET: Properly structured streaming types
type StreamFrame =
  | {
      type: "phase";
      data: { phase: Phase; attempt: number; timestamp: number };
    }
  | { type: "generation"; data: { delta: string; total: string } }
  | { type: "validation"; data: { issues: Issue[]; passed: boolean } }
  | { type: "self-review"; data: { confirmed: Issue[]; filtered: Issue[] } }
  | { type: "error"; data: { message: string; recoverable: boolean } };
```

#### 3. AI Provider Resilience (HIGH PRIORITY)

**Current Problem**: Single Gemini dependency with no fallbacks

```typescript
// TARGET: Multi-provider resilience
interface AIProvider {
  generate(prompt: string): Promise<string>;
  generateStructured<T>(prompt: string, schema: Schema<T>): Promise<T>;
}

class ResilientAI {
  async generateWithFallback(prompt: string): Promise<string> {
    // Retry logic, circuit breaker, graceful degradation
  }
}
```

---

## Project Requirements (VERIFIED WORKING)

✅ **Stack**: Next.js App Router, shadcn/ui, vercel/ai SDK with Gemini 2.5 Pro
✅ **UX**: Left panel input, right panel streaming with live phases  
✅ **Backend**: POST /api/run with generate→validate→heal loop
⚠️ **Streaming**: Basic NDJSON working but needs structure improvements
⚠️ **Spec model**: SpecPack JSON works but modular items need type safety
✅ **Environment**: GOOGLE_GENERATIVE_AI_API_KEY working

## What's Actually Working (Despite Architecture Issues)

✅ **Core functionality intact** - App generates PRDs end-to-end successfully
✅ **Validation system functional** - All 14+ validators working correctly  
✅ **Healing loop operational** - Self-correction attempts work as designed
✅ **UI responsive** - Real-time streaming and phase indicators working
✅ **Zero lint warnings** - Recent cleanup session achieved this
✅ **Build passes** - TypeScript compilation successful despite type issues
✅ **Self-review layer** - AI validation filtering recently implemented

### Critical Files Status After Phase 1

#### 🔴 CRITICAL (Remaining)

- **`src/app/api/run/route.ts`** – Still uses unstructured NDJSON; needs typed frames & recovery.
- **Streaming consumers in `page.tsx`** – Will need adaptation once structured frames introduced.

#### 🟡 IMPROVED

- **`src/lib/spec/registry.ts`** – ✅ Refactored; generic & type-safe externally.
- **`src/lib/spec/items/index.ts`** – ✅ Simplified; no casts; clear sequential registration.

#### 🟡 IMPORTANT (Next Targets)

- **`src/lib/spec/validate.ts`** – Works; can be simplified further once streaming structured.
- **`src/lib/spec/healing/aggregate.ts`** – Functional; could accept typed healing strategy metadata.
- **`src/lib/spec/selfReview.ts`** – Recently simplified params; candidate for structured result metadata.

#### 🟢 STABLE

- **Validator item modules** – Uniform interface; maintainable.
- **`src/lib/spec/types.ts`** – Well-defined interfaces; good foundation.
- **`src/app/(prd)/page.tsx`** – UI logic clean and maintainable.
- **`src/lib/ai/provider.ts`** – Simple and working correctly.

## Implementation Strategy for Next Session

### Phase 1: Registry Architecture — Delivered

Delivered Scope:

1. Designed & implemented generic registry system.
2. Standardized validator interfaces across all active items (14 modules).
3. Eliminated external type assertions (casts isolated internally only once).
4. Preserved existing runtime behavior (generate→validate→heal untouched logically).
5. Normalized optional `pack` usage (tolerant of modules not needing global context).

### Phase 2: Streaming Enhancement (Days 3-4)

1. **Design structured streaming protocol** with comprehensive error types
2. **Implement proper error recovery** and user-facing fallback mechanisms
3. **Add request correlation** and detailed progress tracking
4. **Enhance UI components** to handle structured response data

### Phase 3: AI Resilience (Days 5-6)

1. **Abstract AI provider interface** enabling multi-provider architecture
2. **Implement retry logic** with exponential backoff and circuit breakers
3. **Add graceful degradation** for different failure scenarios
4. **Create monitoring hooks** for AI provider health and performance

### Phase 4: Integration & Testing (Day 7)

1. **Comprehensive integration testing** of new architecture
2. **Performance benchmarking** against current implementation
3. **Migration documentation** for future development patterns
4. **Rollback procedures** if critical issues discovered

## Success Criteria for Architectural Rewrite (Progress)

- [x] **Zero scattered type assertions** in validation system (single internal boundary only)
- [x] **Strongly typed registry** with generics & helper invokers
- [ ] **Structured streaming** with comprehensive error recovery
- [ ] **Multi-provider AI** with production-grade resilience
- [x] **Existing functionality preserved** (no behavior regression observed during compilation/lint cycle)
- [ ] **Performance maintained/improved** (defer measurement until streaming refactor)
- [x] **Developer experience improved** (uniform module contract; reduced boilerplate; clearer registration)

## Development Context for Next AI Agent

### Codebase Characteristics

- **72 TypeScript files** across modular architecture
- **14+ validation items** with inconsistent interfaces
- **Functional but fragile** streaming implementation
- **Working end-to-end** but not production-ready
- **High technical debt** from rapid feature development

### Required AI Agent Capabilities

- **System-level architectural thinking** across entire codebase
- **Advanced TypeScript expertise** including complex generics
- **Streaming protocol design** experience and best practices
- **Production resilience patterns** for AI-dependent systems
- **Refactoring expertise** while preserving functionality
- **Strong testing methodology** for complex system changes

### Risk Mitigation Strategy

- **Feature flags** for incremental architecture rollout
- **Comprehensive test suite** before any major changes
- **Detailed rollback plan** if critical issues emerge
- **Performance monitoring** throughout migration process

---

## Historical Development Sessions

### Session 1: Core Implementation

- Initial modular validator architecture
- Basic streaming NDJSON implementation
- Registry system with type shortcuts

### Session 2: Feature Expansion

- Added 10+ additional validation items
- Enhanced banned text patterns
- Competitor research integration

### Session 3: Quality Improvements

- Self-review layer implementation
- Type cast reduction attempts
- ESLint warning elimination

### Session 4: Registry Refactor Execution

- Implemented generic validator registry & invoke helpers
- Standardized all item module signatures `(params, pack?)`
- Removed unused self-review parameter clutter
- Eliminated 20+ unsafe casts in `items/index.ts`
- Added eslint-suppression only where necessary (unused params) keeping code clean

**CONCLUSION**: Next session requires senior architect-level AI agent with explicit mandate to prioritize long-term architectural quality over short-term feature delivery.

---

## Quick Start Instructions (Still Working)

```bash
# Prerequisites: Node.js, pnpm, .env.local with GOOGLE_GENERATIVE_AI_API_KEY
pnpm install
pnpm dev
# Visit http://localhost:3000
# Enter spec idea, click Run, watch streaming phases
```

**Note**: Despite architectural concerns, the application remains fully functional for testing and development purposes.
