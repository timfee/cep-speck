# Agents Module

This module implements the agentic workflow system for CEP PRD generation, combining mega-prompts with the existing validation registry system.

## Architecture

The agents module follows a hybrid approach:

- **Master prompts** provide rich domain knowledge and generation instructions
- **Existing validation rules** from `src/lib/spec/items/` are preserved via `buildSystemPrompt()`
- **Streaming AI integration** uses `getResilientAI()` for reliable generation

## Components

### Core Agent Types

- `Agent` - Basic agent interface
- `StreamingAgent` - Agent with streaming capabilities
- `AgentContext` - Input context for agent execution
- `AgentResult` - Agent execution result

### Drafter Agent

The `DrafterAgent` combines:

1. Master prompt from `guides/prompts/drafter-master.md`
2. Validation rules via `buildSystemPrompt(pack)`
3. Optional knowledge and research context

**Usage:**

```typescript
import { DrafterAgent, runDrafterAgent } from "@/lib/agents";

// Simple usage
const result = await runDrafterAgent(userInput, pack);

// Advanced usage
const drafter = new DrafterAgent({
  masterPromptPath: "custom/prompt.md",
  includeKnowledge: true,
  includeResearch: true,
});

const context = { userInput, pack, knowledgeContext, researchContext };
const streamResult = await drafter.executeStreaming(context);

// Convenience wrapper with additional context
await runDrafterAgent(userInput, pack, {
  knowledgeContext,
  researchContext,
  structuredSpec,
  outlinePayload,
});
```

### Prompt Loader

Utility for loading prompt files with caching:

```typescript
import { loadPrompt, clearPromptCache } from "@/lib/agents";

const content = await loadPrompt({
  path: "guides/prompts/drafter-master.md",
  cache: true,
  fallback: "Default prompt",
});
```

## Integration Points

### With Existing System

The Drafter agent **preserves** the existing architecture:

- Calls `buildSystemPrompt(pack)` to get all `toPrompt()` contributions
- Uses `getResilientAI().generateWithFallback()` for AI generation
- Maintains compatibility with validation items and SpecPack configuration

### Master Prompt Content

`guides/prompts/drafter-master.md` contains:

- CEP domain knowledge and context
- Voice and tone guidelines
- Anti-patterns and banned terms
- PRD structure requirements
- Technical realism guidelines
- Quantification requirements

## Testing

Manual testing can be performed with:

```typescript
import { demonstrateDrafterAgent } from "@/lib/agents/manual-test";
await demonstrateDrafterAgent();
```

## Quality Gates

- ✅ TypeScript compilation passes
- ✅ ESLint with minimal warnings only
- ✅ Integration with existing `buildSystemPrompt()`
- ✅ Compatible with `getResilientAI()`
- ✅ Fallback handling for missing prompt files

## Next Steps

Ready for Issue #3 - Evaluator and Refiner agent implementation.
