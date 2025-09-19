# CEP Spec Validation App

A Next.js application that uses AI to generate and validate Chrome Enterprise Premium (CEP) Product Requirements Documents with a self-healing validation loop using Google Gemini and modular validation system.

**ALWAYS reference these instructions first and fallback to search or bash commands ONLY when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites & Environment Setup

- **Node.js 20+** (tested with v20.19.5) - use system Node.js, no need for nvm
- **Package Manager**: **ALWAYS use pnpm exclusively** - this project is configured for pnpm workflows
- **Environment Variables**: Create `.env.local` with:
  ```
  GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
  ```

### Pre-Installation Environment Setup (CRITICAL)

**Before running any commands, ALWAYS ensure pnpm is available:**

```bash
# Step 1: Install pnpm globally if not available
npm install -g pnpm

# Step 2: Verify pnpm version
pnpm --version  # Should be 10.x or higher
```

**NEVER use npm for package management in this repository. Use pnpm exclusively for all operations.**

### Bootstrap, Build, and Test

**CRITICAL TIMING**: All commands complete quickly. Set appropriate timeouts and NEVER CANCEL.

- **Install dependencies** (8.1s validated) - NEVER CANCEL, set timeout to 5+ minutes:

  ```bash
  pnpm install
  ```

- **Lint the code** (2.7s validated) - NEVER CANCEL, set timeout to 2+ minutes:

  ```bash
  pnpm lint
  ```

- **Format the code** (recommended before committing):

  ```bash
  pnpm format      # Apply formatting
  pnpm format:check # Check formatting without changes
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
pnpm format  # Apply formatting (recommended)
```

All must pass successfully or CI will fail.

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

   export function validate(
     draft: string,
     params: Params,
     pack?: SpecPack
   ): Issue[] {
     // Check content and return issues
     return [];
   }

   export function heal(
     issues: Issue[],
     params?: Params,
     pack?: SpecPack
   ): string | null {
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
# Fresh setup (CRITICAL: Always use pnpm)
npm install -g pnpm  # Only if pnpm not available
pnpm install
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env.local

# Development workflow
pnpm lint    # Always run before committing
pnpm build   # Test production build
pnpm format  # Apply code formatting (prettier)
pnpm dev     # Start development server

# Testing validation
# 1. Navigate to http://localhost:3000
# 2. Enter spec: "Project: Test\nTarget SKU: premium"
# 3. Click Run and verify complete workflow
```

## Package Manager Policy

**CRITICAL**: This repository EXCLUSIVELY uses pnpm. Never use npm or yarn for dependency management:

- ✅ `pnpm install` - Install dependencies
- ✅ `pnpm add package` - Add dependency
- ✅ `pnpm remove package` - Remove dependency
- ✅ `pnpm run script` - Run script
- ✅ `pnpx command` - Run package executables

- ❌ `npm install` - Do not use
- ❌ `yarn add` - Do not use
- ❌ `npx command` - Use `pnpx` instead

**Rationale**: pnpm provides faster installs, deterministic lockfiles, and better disk space efficiency. The project is configured specifically for pnpm workflows.

## Code Style & Quality Guidelines

### Development Style Principles

- **Idiomatic TypeScript**: Write natural, readable TypeScript following modern patterns
- **Modern practices**: Use latest language features appropriately (optional chaining, nullish coalescing, etc.)
- **DRY principle**: Avoid repetition but don't over-abstract; maintain readability
- **Not over-engineered**: Simple, direct solutions over complex architectures
- **Not hacked together**: Clean, maintainable code with proper error handling

### Final Workflow Step

**ALWAYS complete your work with formatting:**

```bash
# Final step before committing any changes
pnpm format
```

This ensures consistent code style across the entire repository. The formatting step should be the LAST action before committing code changes.
