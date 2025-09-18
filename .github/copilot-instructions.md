# CEP Spec Validation App

A Next.js application that uses AI to generate and validate Chrome Enterprise Premium (CEP) Product Requirements Documents with a self-healing validation loop using Google Gemini and modular validation system.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites & Environment Setup
- **Node.js 20+** (tested with v20.19.5) - use system Node.js, no need for nvm
- **Package Manager**: Both npm and pnpm work. pnpm is preferred (project includes pnpm-lock.yaml)
- **Environment Variables**: Create `.env.local` with:
  ```
  GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
  ```

### Bootstrap, Build, and Test
**CRITICAL TIMING**: All commands complete quickly. Set appropriate timeouts and NEVER CANCEL.

- **Install dependencies**:
  ```bash
  # Option 1: npm (12 seconds) - NEVER CANCEL, set timeout to 5+ minutes
  npm install
  
  # Option 2: pnpm (8 seconds, preferred) - NEVER CANCEL, set timeout to 5+ minutes  
  npm install -g pnpm
  pnpm install
  ```

- **Lint the code** (5 seconds max) - NEVER CANCEL, set timeout to 2+ minutes:
  ```bash
  npm run lint
  # OR
  pnpm lint
  ```

- **Build the application** (30 seconds) - NEVER CANCEL, set timeout to 10+ minutes:
  ```bash
  npm run build
  # OR  
  pnpm build
  ```

- **Run development server**:
  ```bash
  npm run dev
  # OR
  pnpm dev
  ```
  - Accesses: http://localhost:3000
  - Ready in ~1 second
  - Requires API key for full functionality

- **Run production server**:
  ```bash
  npm run start
  # OR
  pnpm start
  ```

## Validation

### Manual Testing Requirements
**ALWAYS manually validate any changes by running complete user scenarios**:

1. **Start the development server**: `pnpm dev`
2. **Navigate to http://localhost:3000**
3. **Test basic UI functionality**:
   - Enter spec text in left panel (e.g., "Project: Example\nTarget SKU: premium")
   - Click "Run" button
   - Verify phase indicators work (🔄 Generating, 🔍 Validating, 🩹 Healing, ✅ Complete, ❌ Error)
4. **Test with API key** (if available):
   - Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`
   - Run complete generate-validate-heal workflow
   - Verify draft content appears in right panel
   - Verify validation issues display correctly
5. **Test without API key**:
   - Should show "❌ Error" with "Missing GOOGLE_GENERATIVE_AI_API_KEY" message

### Pre-commit Validation
Always run before committing changes:
```bash
pnpm lint
pnpm build
```
Both must pass successfully or CI will fail.

## Architecture Overview

### Core Concept
**Modular validation system** where each validation rule is a self-contained module with three functions:
- `toPrompt(params, pack)` - Contributes to initial AI prompt
- `validate(draft, params, pack)` - Validates generated content  
- `heal(issues, params, pack)` - Provides healing instructions for retry

### Self-Healing Validation Loop
1. **Generate** - AI creates initial content using Gemini
2. **Validate** - All modular validation items check the content
3. **Heal** - If issues found, aggregate healing instructions and retry  
4. **Repeat** - Continue until validation passes or max attempts reached (3)

### Key Files & Directories

**Core Architecture**:
- `src/lib/spec/types.ts` - TypeScript interfaces for validation system
- `src/lib/spec/registry.ts` - Item registration system
- `src/lib/spec/items/` - Individual validation modules (9 total)
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
   import type { SpecPack, Issue } from '../types';
   
   export const itemId = 'your-item';
   export type Params = { /* your parameters */ };
   
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

| Command | npm | pnpm | Timeout Recommendation |
|---------|-----|------|----------------------|
| install | ~12s | ~8s | 5+ minutes |
| lint | ~2.5s | ~4.5s | 2+ minutes |
| build | ~26s | ~30s | 10+ minutes |
| dev startup | ~1s | ~1s | 2+ minutes |

**NEVER CANCEL these commands** - they complete quickly but may occasionally take longer on different systems.

## Troubleshooting

### Common Issues
- **"Missing GOOGLE_GENERATIVE_AI_API_KEY"**: Add API key to `.env.local`
- **Build failures**: Run `pnpm lint` first to catch TypeScript/ESLint errors
- **Dev server won't start**: Check if port 3000 is available
- **Module not found errors**: Run `pnpm install` to ensure dependencies are up to date

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
      items/              # 9 validation modules
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
pnpm lint    # Always run before committing
pnpm build   # Test production build
pnpm dev     # Start development server

# Testing validation
# 1. Navigate to http://localhost:3000
# 2. Enter spec: "Project: Test\nTarget SKU: premium"  
# 3. Click Run and verify complete workflow
```