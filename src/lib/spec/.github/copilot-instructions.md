# Spec System Core Guidelines

This directory contains the core validation system for CEP PRD generation. It orchestrates modular validation items, prompt building, and healing workflows.

## Architecture Principles

- **Modular**: Each validation concern is a separate, composable module
- **Deterministic First**: All primary validation is deterministic and fast-failing
- **Self-Healing**: System can automatically retry with specific healing instructions
- **Streaming**: Support real-time progress updates via NDJSON streaming
- **Pack-Driven**: Configuration via JSON spec packs enables flexibility

## Key Responsibilities

- **`prompt.ts`**: System prompt composition from modular items
- **`validate.ts`**: Orchestrate validation across all registered items
- **`registry.ts`**: Item registration and discovery system
- **`types.ts`**: Shared TypeScript interfaces and types
- **`healing/`**: Healing instruction aggregation strategies
- **`packs/`**: JSON configuration files defining validation rules
- **`items/`**: Individual validation modules (see items/.github/copilot-instructions.md)

## Development Guidelines

### Adding New Core Features

1. **Maintain Backward Compatibility**: Existing packs and items should continue working
2. **Fail Fast**: Error on the first critical issue to save tokens and provide quick feedback
3. **Pure Functions**: All core functions should be deterministic and side-effect free
4. **Explicit Types**: Use specific TypeScript types, avoid `any` or overly broad unions

### Prompt System (`prompt.ts`)

- Keep `buildSystemPrompt()` concise and focused
- Aggregate item-specific rules via `toPrompt()` calls
- Append critical validation requirements block for governance
- Avoid duplicating item-specific rules in the static block

### Validation Orchestration (`validate.ts`)

- Validate pack structure before processing (`assertValidSpecPack`)
- Process items in priority order (errors before warnings)
- Return structured results with clear issue categorization
- Support both single-item and full-pack validation modes

### Type System (`types.ts`)

- Use discriminated unions for different validation concerns
- Keep interfaces focused and composable
- Document complex types with JSDoc comments
- Avoid circular dependencies between type definitions

## pnpm Usage

This project uses pnpm for package management:

```bash
# Install dependencies
pnpm install

# Development commands
pnpm dev      # Start development server
pnpm build    # Production build (required before commits)
pnpm lint     # ESLint validation (required before commits)
pnpm test     # Run test suite

# Never use npm or yarn - use pnpm exclusively
```

## Performance Considerations

- **Regex Optimization**: Precompile reused patterns, avoid backtracking
- **Early Exit**: Stop validation on first error-level issue
- **Minimal Parsing**: Use simple string operations over complex parsing
- **Token Efficiency**: Keep prompts concise to reduce AI API costs