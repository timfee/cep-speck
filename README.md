# CEP Spec Validation App

A Next.js application that uses AI to generate and validate Chrome Enterprise Premium (CEP) Product Requirements Documents with a self-healing validation loop.

## Architecture

This application implements the original vision of **modular spec components** where each validation rule is a self-contained module with three key functions:

- **`toPrompt(params, pack)`** - Contributes to the initial AI prompt
- **`validate(draft, params, pack)`** - Validates the generated content  
- **`heal(issues, params, pack)`** - Provides healing instructions when validation fails

The core concept is to **define validation logic once** so you don't need to adjust AI prompts, code, and linters separately every time you make a change. Each validation item is completely modular and self-contained.

## Self-Healing Validation Loop

The application implements a sophisticated **generate-validate-heal cycle**:

1. **Generate** - AI creates initial content using Gemini
2. **Validate** - All modular validation items check the content
3. **Heal** - If issues found, aggregate healing instructions and retry
4. **Repeat** - Continue until validation passes or max attempts reached

This ensures high-quality output through deterministic validation with AI-powered healing.

## Quick Start

### Prerequisites
- Node.js (via nvm recommended)
- npm or pnpm package manager

### Setup
```bash
npm install
```

### Environment
Create `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Run
```bash
npm run dev
```
Open http://localhost:3000

## Usage

1. **Enter a spec idea** in the left panel (project name, core problem, target SKU, etc.)
2. **Click "Run"** to start the generate-validate-heal cycle
3. **Watch the phases**:
   - 🔄 **Generating** - AI creates initial content
   - 🔍 **Validating** - Modular rules check the content
   - 🩹 **Healing** - System provides follow-up prompts to fix issues
   - ✅ **Complete** - Validation passes or max attempts reached

The right panel shows the streaming draft and any validation issues in real-time.

## Adding New Validation Items

The modular architecture makes it easy to add new validation rules. Create a new file in `src/lib/spec/items/yourItem.ts`:

```typescript
import type { SpecPack, Issue } from '../types';

export const itemId = 'your-item';
export type Params = { /* your parameters */ };

export function toPrompt(params: Params, pack?: SpecPack): string {
  // Return string to include in the initial AI prompt
  return `Your validation requirement for the AI to follow...`;
}

export function validate(draft: string, params: Params, pack?: SpecPack): Issue[] {
  // Check the generated content and return issues
  const issues: Issue[] = [];
  
  if (/* some condition fails */) {
    issues.push({
      id: 'your-issue-id',
      itemId,
      severity: 'error', // or 'warn'
      message: 'Description of what went wrong',
      evidence: 'Specific text that caused the issue'
    });
  }
  
  return issues;
}

export function heal(issues: Issue[], params?: Params, pack?: SpecPack): string | null {
  if (!issues.length) return null;
  // Return healing instruction for the AI
  return `Fix the issues by doing X, Y, and Z...`;
}
```

Then register it in `src/lib/spec/items/index.ts`:

```typescript
import * as yourItem from './yourItem';

// Add to the array
[sectionCount, metricsRequired, bannedText, labelPattern, wordBudget, yourItem].forEach(...)
```

Finally, add it to your SpecPack configuration in `src/lib/spec/packs/prd-v1.json`:

```json
{
  "id": "your-item",
  "kind": "policy",
  "priority": 50,
  "severity": "error",
  "params": { /* your parameters */ }
}
```

## Current Validation Items

- **Section Count** - Ensures exactly 9 sections with proper headers
- **Label Pattern** - Validates section headers follow "# {n}. {title}" format
- **Metrics Required** - Checks metrics include units, timeframes, and Source of Truth
- **Banned Text** - Prevents use of banned terms (exact matches and regex patterns)
- **Word Budget** - Enforces target word count with compression suggestions
- **Competitor Research** - Validates competitive analysis in TL;DR and citations

## SpecPack Configuration

The `src/lib/spec/packs/prd-v1.json` file defines:

- **Validation items** - Which rules to apply and their parameters
- **Heal policy** - Max attempts, ordering, grouping strategy
- **Composition** - Section structure and labeling patterns  
- **Globals** - Shared data like banned terms and lexicon

## Web Research & Knowledge Integration

The application now supports:

### Web Research Capabilities
- **Competitor Analysis** - Automated research on enterprise browser vendors
- **Substantiated Claims** - Web-sourced facts with citations
- **Fresh Sources** - Configurable recency requirements (default: 365 days)
- **Citation Management** - Automatic footnote generation

### Knowledge Directory Integration
- **Hierarchical Structure** - Recursive reading of `./knowledge/*` directories
- **Multiple Formats** - Support for `.md` and `.txt` files
- **Search Capabilities** - Content and path-based knowledge search
- **Graceful Degradation** - Works without knowledge directory present

### Research Workflow
1. **Knowledge Loading** - Reads local knowledge files if available
2. **Web Research** - Performs competitor analysis using browser tools
3. **Context Integration** - Combines knowledge and research into system prompt
4. **Validation** - Ensures competitive analysis and citations are present
5. **Auto-Fill Logging** - Tracks researched facts vs. PM input needed

## Key Files

### Core Architecture
- `src/lib/spec/types.ts` - TypeScript interfaces
- `src/lib/spec/registry.ts` - Item registration system
- `src/lib/spec/items/` - Individual validation modules
- `src/lib/spec/packs/prd-v1.json` - SpecPack configuration

### AI Integration  
- `src/lib/ai/provider.ts` - Gemini model configuration
- `src/lib/spec/prompt.ts` - Prompt building from modular items
- `src/lib/spec/validate.ts` - Validation orchestration
- `src/lib/spec/healing/aggregate.ts` - Healing instruction aggregation

### API & UI
- `src/app/api/run/route.ts` - Main API endpoint with streaming NDJSON
- `src/app/(prd)/page.tsx` - Main UI component with real-time updates

## Technology Stack

- **Next.js 15** with App Router and TypeScript
- **shadcn/ui** components for consistent design
- **Vercel AI SDK** with Google Gemini for text generation
- **Streaming NDJSON** for real-time progress updates
- **Modular validation system** for maintainable rules

## Development

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

### Testing Changes
1. Start the dev server: `npm run dev`
2. Test the complete generate-validate-heal workflow
3. Verify new validation items work as expected
4. Check that phase indicators and UI updates work properly

## Original Vision

This application fulfills the original vision of:

> "I want to define these concepts in code one single time, so I don't need to adjust the AI text prompt, then code, then linter, etc., every time I make a change."

The modular architecture with `toPrompt()`, `validate()`, and `heal()` functions ensures that each validation rule is defined once and automatically contributes to:
- Initial AI prompts
- Content validation  
- Healing instructions
- Streaming progress updates

This eliminates the need to maintain separate prompt text, validation code, and linting rules for each requirement.
