# CEP Spec Validation App

A Next.js application that uses AI to generate and validate Chrome Enterprise Premium (CEP) Product Requirements Documents with a self-healing validation loop using Google Gemini and modular validation system.

**ALWAYS reference these instructions first and fallback to search or bash commands ONLY when you encounter unexpected information that does not match the info here.**

## Development Philosophy & Code Style

### Core Principles

- **Idiomatic**: Write modern, clean TypeScript/React code that follows established patterns
- **DRY**: Eliminate duplication through shared utilities and composable modules
- **Not Over-engineered**: Prefer simple, readable solutions over complex abstractions
- **Not Hacked Together**: Proper error handling, TypeScript types, and structured architecture
- **Deterministic First**: Primary validation logic must be predictable and fast-failing
- **Progressive Enhancement**: Build resilient UIs that work without JavaScript

### TypeScript Standards

- Use strict mode with explicit types (no `any` in production code)
- Prefer interfaces over type aliases for object shapes
- Use discriminated unions for state management
- Implement proper generic constraints and utility types
- Document complex types with JSDoc comments

### React Patterns

- Use React 19 features appropriately (useOptimistic, useActionState)
- Implement custom hooks for reusable stateful logic
- Prefer composition over inheritance for component design
- Use error boundaries for graceful failure recovery
- Optimize performance with React.memo() and useMemo() when needed

## Deterministic vs Probabilistic Guidance

### Deterministic Layer (Always Applied First)

**All validation items must be deterministic and reproducible:**

- Pure functions with no side effects, network calls, or randomness
- Consistent results given the same input across all environments
- Fast-failing on error-severity issues to save computational resources
- Regex patterns that avoid backtracking and performance issues
- Clear, actionable error messages with specific evidence

```typescript
// Example: Deterministic validation
export function validate(draft: string, params: Params): Issue[] {
  const issues: Issue[] = [];

  // Deterministic pattern matching
  if (!METRIC_PATTERN.test(draft)) {
    issues.push({
      id: "missing-metrics",
      severity: "error",
      message: "Missing required metric format",
      evidence: draft.substring(0, 50) + "...",
    });
  }

  return issues;
}
```

### Probabilistic Layer (AI-Assisted, Secondary)

**Use AI assistance for nuanced judgment calls:**

- Style and voice consistency evaluation
- Competitive research accuracy assessment
- Feasibility and realism heuristics
- Executive summary coherence and impact
- Cross-section consistency and traceability

```typescript
// Example: AI-assisted evaluation (planned feature)
export async function aiReview(issues: Issue[], draft: string): Promise<FilteredIssues> {
  // Use lightweight model to confirm/discard borderline issues
  // Never introduce new issues - only filter existing ones
  // Fallback to deterministic issues if AI parsing fails
}
```

### Balance Guidelines

- **Start Deterministic**: Always run deterministic validation first
- **Augment with AI**: Use AI to refine and contextualize findings
- **Preserve Intent**: AI should enhance, not replace, explicit validation rules
- **Fail Gracefully**: If AI layer fails, deterministic results remain valid
- **Stay Auditable**: All decisions should be explainable and debuggable

## Working Effectively

### Prerequisites & Environment Setup

- **Node.js 20+** (tested with v20.19.5) - use system Node.js, no need for nvm
- **Package Manager**: This project exclusively uses pnpm (enforced via preinstall script)
- **Environment Variables**: Create `.env.local` with:
  ```
  GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
  ```

### Copilot Environment Setup

This repository includes a **`copilot-setup-steps.yml`** file that configures the GitHub Copilot agent environment with:

- **Automated pnpm installation** and dependency setup
- **Code formatting** with Prettier for consistent style
- **Package.json sorting** for organized structure
- **Type checking** and linting validation
- **Build verification** to ensure compilation works

The setup file enables Copilot agents to automatically configure the development environment with all necessary tools and validation steps.

### Bootstrap, Build, and Test

**CRITICAL TIMING**: All commands complete quickly. Set appropriate timeouts and NEVER CANCEL.

**ALWAYS USE PNPM**: This project exclusively uses pnpm for package management. Never use npm or yarn.

- **Install pnpm globally first**:

  ```bash
  npm install -g pnpm  # One-time global install
  ```

- **Install dependencies** (8.1s validated, preferred):

  ```bash
  pnpm install  # NEVER CANCEL, set timeout to 5+ minutes
  ```

- **Lint the code** (2.7s validated) - NEVER CANCEL, set timeout to 2+ minutes:

  ```bash
  pnpm lint
  ```

- **Format the code** with Prettier:

  ```bash
  pnpm format         # Format all files
  pnpm format:check   # Check formatting without writing
  ```

- **Sort package.json** for consistent structure:

  ```bash
  pnpm sort-package-json
  ```

- **Type check** without building:

  ```bash
  pnpm type-check
  ```

- **Build the application** (26.7s validated) - NEVER CANCEL, set timeout to 10+ minutes:

  ```bash
  pnpm build
  ```

- **Run development server**:

  ```bash
  pnpm dev
  ```

  - Accesses: http://localhost:3000
  - Ready in ~1 second (validated)
  - Requires API key for full functionality

- **Run production server** (KNOWN ISSUE):

  ```bash
  npm run start
  # OR
  pnpm start
  ```

  - **ISSUE**: Production server currently fails with "routesManifest.dataRoutes is not iterable" error
  - Use development server for testing: `pnpm dev`

## Validation

### Manual Testing Requirements

**ALWAYS manually validate any changes by running complete user scenarios**:

1. **Start the development server**: `pnpm dev`
2. **Navigate to http://localhost:3000**
3. **Test basic UI functionality**:
   - Enter spec text in left panel (e.g., "Project: Example\nTarget SKU: premium")
   - Click "Run" button
   - Verify phase indicators work (🔄 Generating, 🔍 Validating, 🩹 Healing, ✅ Complete, ❌ Error)
4. **Test complete generate-validate-heal workflow**:
   - Application will generate a comprehensive PRD document
   - Validation system will identify issues (banned text, word count, etc.)
   - Self-healing will trigger (attempt counter increases)
   - Multiple iterations will refine the document
   - **Validated behavior**: Complete workflow takes 30-60 seconds total
5. **Verify validation issues display**:
   - Check "Issues" section shows specific validation failures
   - Common issues: banned text patterns, word budget exceeded, missing metrics attributes
6. **Test with API key** (if available):
   - Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`
   - Run complete generate-validate-heal workflow
   - Verify draft content appears in right panel with competitive research
   - Verify validation issues display correctly
7. **Test without API key**:
   - Should show "❌ Error" with "Missing GOOGLE_GENERATIVE_AI_API_KEY" message

### Pre-commit Validation

Always run before committing changes:

```bash
pnpm lint    # Must pass (2.7s)
pnpm build   # Must pass (26.7s)
```

Both must pass successfully or CI will fail.

**Note**: Production server (`pnpm start`) currently has a known issue. Use development server for all testing.

## Architecture Overview

### Core Concept

**Modular validation system** where each validation rule is a self-contained module with three functions:

- `toPrompt(params, pack)` - Contributes to initial AI prompt
- `validate(draft, params, pack)` - Validates generated content
- `heal(issues, params, pack)` - Provides healing instructions for retry

## Application Functionality

### Validated Capabilities

**The application successfully**:

- Generates comprehensive PRD documents using Google Gemini AI
- Performs competitive research with real data (Zscaler, Island, Talon, Microsoft Edge)
- Implements self-healing validation loop with multiple validation attempts
- Shows real-time phase indicators and streaming content
- Validates against 8 modular validation rules:
  - **bannedText**: Prevents buzzwords and forbidden terms
  - **competitorResearch**: Ensures competitive analysis
  - **crossSectionConsistency**: Validates section consistency
  - **executiveQuality**: Ensures executive summary quality
  - **labelPattern**: Validates section numbering format
  - **metricsRequired**: Validates metrics have units/timeframe/SoT
  - **sectionCount**: Ensures minimum section count
  - **wordBudget**: Enforces word count limits (1800 words max)
- Provides detailed validation issue reporting with specific error messages

### Expected Workflow Timing

- **Phase 1: Generate** - AI creates initial content (10-20 seconds)
- **Phase 2: Validate** - Modular rules check content (1-2 seconds)
- **Phase 3: Heal** - If issues found, retry with healing instructions (10-20 seconds per attempt)
- **Total Time**: 30-60 seconds for complete workflow with 2-3 attempts typical

### Self-Healing Validation Loop

1. **Generate** - AI creates initial content using Gemini
2. **Validate** - All modular validation items check the content
3. **Heal** - If issues found, aggregate healing instructions and retry
4. **Repeat** - Continue until validation passes or max attempts reached (3)

### Key Files & Directories

**Core Architecture**:

- `src/lib/spec/types.ts` - TypeScript interfaces for validation system
- `src/lib/spec/registry.ts` - Item registration system
- `src/lib/spec/items/` - Individual validation modules (8 total)
- `src/lib/spec/packs/prd-v1.json` - SpecPack configuration with rules
- `src/lib/spec/prompt.ts` - System prompt building from modular items
- `src/lib/spec/validate.ts` - Validation orchestration
- `src/lib/spec/healing/aggregate.ts` - Healing instruction aggregation

**AI Integration**:

- `src/lib/ai/provider.ts` - Gemini model configuration
- `src/lib/knowledge/` - Knowledge base files for context
- `src/lib/research/` - Web research capabilities

**API & UI**:

- `src/app/api/run/route.ts` - Main API endpoint with streaming NDJSON
- `src/app/(prd)/page.tsx` - Main UI component with real-time updates

**Configuration**:

- `package.json` - Dependencies and scripts
- `eslint.config.mjs` - ESLint configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

## Common Tasks

### Adding New Validation Items

1. **Create module** in `src/lib/spec/items/yourItem.ts`:

   ```typescript
   import type { SpecPack, Issue } from "../types";

   export const itemId = "your-item";
   export type Params = {
     /* your parameters */
   };

   export function toPrompt(params: Params, pack?: SpecPack): string {
     return `Your validation requirement for the AI...`;
   }

   export function validate(draft: string, params: Params, pack?: SpecPack): Issue[] {
     // Check content and return issues
     return [];
   }

   export function heal(issues: Issue[], params?: Params, pack?: SpecPack): string | null {
     // Return healing instructions
     return null;
   }
   ```

2. **Register the item** in `src/lib/spec/items/index.ts`
3. **Add to SpecPack** in `src/lib/spec/packs/prd-v1.json`
4. **Test thoroughly** with complete workflow

### Modifying Existing Validation Rules

- **Update the specific module** in `src/lib/spec/items/`
- **Adjust SpecPack parameters** in `src/lib/spec/packs/prd-v1.json` if needed
- **Always test with complete generate-validate-heal cycle**

### Debugging Validation Issues

- **Check browser console** for errors during development
- **Review API response** in Network tab for `/api/run` endpoint
- **Examine validation issues** in right panel of UI
- **Test individual validation items** by modifying SpecPack temporarily

## Technology Stack Details

- **Next.js 15.5.3** with App Router and TypeScript
- **React 19** with React DOM 19
- **Turbopack** for fast builds and development
- **shadcn/ui** components for consistent design system
- **Vercel AI SDK** v5.0.46 with Google Gemini 2.5 Pro via @ai-sdk/google
- **Streaming NDJSON** for real-time progress updates
- **ESLint 9** with Next.js configuration
- **Tailwind CSS 4** for styling

## Expected Command Timings

Use these timings to set appropriate timeouts and avoid premature cancellation:

| Command     | npm    | pnpm   | Timeout Recommendation |
| ----------- | ------ | ------ | ---------------------- |
| install     | ~13.2s | ~8.1s  | 5+ minutes             |
| lint        | ~2.7s  | ~2.7s  | 2+ minutes             |
| build       | ~26.7s | ~26.7s | 10+ minutes            |
| dev startup | ~1s    | ~1s    | 2+ minutes             |

**NEVER CANCEL these commands** - they complete quickly but may occasionally take longer on different systems.

## Troubleshooting

### Common Issues

- **"Missing GOOGLE_GENERATIVE_AI_API_KEY"**: Add API key to `.env.local`
- **Build failures**: Run `pnpm lint` first to catch TypeScript/ESLint errors
- **Dev server won't start**: Check if port 3000 is available
- **Module not found errors**: Run `pnpm install` to ensure dependencies are up to date
- **Production server fails**: Known issue with "routesManifest.dataRoutes is not iterable" error. Use `pnpm dev` for testing.

### Environment Files

- `.env.local` - Local development environment variables (not committed)
- `.env` - Shared environment variables (if exists, committed)

### File Structure Summary

```
src/
  app/
    (prd)/page.tsx        # Main UI component
    api/run/route.ts      # Streaming API endpoint
  components/ui/          # shadcn/ui components
  lib/
    ai/provider.ts        # Gemini configuration
    knowledge/            # Knowledge base files
    research/             # Web search capabilities
    spec/
      items/              # 8 validation modules:
        bannedText.ts     # Prevents buzzwords and forbidden terms
        competitorResearch.ts # Ensures competitive analysis
        crossSectionConsistency.ts # Validates section consistency
        executiveQuality.ts # Ensures executive summary quality
        labelPattern.ts   # Validates section numbering format
        metricsRequired.ts # Validates metrics have units/timeframe/SoT
        sectionCount.ts   # Ensures minimum section count
        wordBudget.ts     # Enforces word count limits
      packs/              # SpecPack JSON configurations
      healing/            # Healing aggregation
      prompt.ts           # System prompt builder
      registry.ts         # Item registration
      types.ts            # TypeScript interfaces
      validate.ts         # Validation orchestration
```

## Quick Reference Commands

```bash
# Fresh setup
npm install -g pnpm
pnpm install
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env.local

# Development workflow
pnpm lint               # ESLint validation (required before commits)
pnpm format             # Prettier code formatting
pnpm format:check       # Check formatting without writing
pnpm sort-package-json  # Sort package.json structure
pnpm type-check         # TypeScript validation without building
pnpm build              # Test production build
pnpm dev                # Start development server

# Testing validation
# 1. Navigate to http://localhost:3000
# 2. Enter spec: "Project: Test\nTarget SKU: premium"
# 3. Click Run and verify complete workflow
```

## Cascading Copilot Instructions

This repository uses **cascading directory-specific copilot instructions** for targeted guidance:

- **Root** (`.github/copilot-instructions.md`): General project guidance, development philosophy
- **`src/lib/spec/`**: Core validation system architecture and patterns
- **`src/lib/spec/items/`**: Specific guidance for validation item development
- **`src/app/`**: Next.js API and routing patterns, streaming implementations
- **`src/components/`**: React component development with shadcn/ui

**When working in a specific directory, GitHub Copilot will automatically apply the most specific instructions for that area, cascading up to more general guidance.**

### Directory-Specific Focus Areas

- **Validation Items** (`src/lib/spec/items/`): Deterministic validation logic, healing functions
- **Core Spec System** (`src/lib/spec/`): System orchestration, prompt building, type definitions
- **API Endpoints** (`src/app/api/`): Streaming NDJSON, error handling, AI integration
- **UI Components** (`src/components/`): React patterns, accessibility, responsive design

This approach ensures you get contextually relevant guidance whether you're implementing validation logic, building UI components, or working on API endpoints.
