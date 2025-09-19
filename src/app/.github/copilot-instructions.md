# Next.js App Directory Guidelines

This directory contains the Next.js 15 App Router implementation with TypeScript, providing the API endpoints and UI components for the CEP PRD generation system.

## Architecture Overview

- **Next.js 15** with App Router and Turbopack for fast development
- **API Routes**: Streaming NDJSON endpoints for real-time progress
- **UI Components**: React 19 with shadcn/ui design system
- **Styling**: Tailwind CSS 4 with Framer Motion animations

## Development Principles

- **Performance First**: Use streaming responses, optimize bundle size
- **Type Safety**: Strict TypeScript, no `any` types in production code
- **User Experience**: Progressive loading states, error boundaries, accessibility
- **API Design**: RESTful patterns, structured error responses, rate limiting awareness

## API Development (`api/`)

### Streaming Patterns

Use structured NDJSON streaming for long-running operations:

```typescript
// Pattern for streaming API responses
const stream = new ReadableStream({
  async start(controller) {
    // Emit progress frames
    safeEnqueue(encodeStreamFrame(createPhaseFrame("generating", 0, "Starting...")));
    
    try {
      // Long operation with progress updates
      const result = await longOperation();
      safeEnqueue(encodeStreamFrame(createResultFrame(result)));
    } catch (error) {
      safeEnqueue(encodeStreamFrame(createErrorFrame(error.message)));
    } finally {
      safeClose();
    }
  }
});
```

### Error Handling

- Use structured error responses with clear error codes
- Implement graceful degradation for API failures
- Log errors for debugging but don't expose internals
- Provide actionable error messages to users

## UI Development (`(prd)/`)

### Component Guidelines

- **Composition**: Prefer composition over inheritance
- **Accessibility**: Include proper ARIA labels and keyboard navigation
- **Responsive**: Design mobile-first with Tailwind breakpoints
- **Performance**: Lazy load heavy components, minimize re-renders

### State Management

- Use React 19 features (useOptimistic, useActionState) appropriately
- Keep state as close to usage as possible
- Use custom hooks for complex state logic
- Implement optimistic updates for better UX

### Styling Patterns

```typescript
// Use Tailwind with shadcn/ui conventions
import { cn } from "@/lib/utils";

const Button = ({ className, variant = "default", ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-md px-4 py-2",
      variant === "default" && "bg-primary text-primary-foreground",
      className
    )}
    {...props}
  />
);
```

## Integration with Spec System

- Use streaming for real-time validation progress
- Display validation issues with clear categorization
- Implement retry mechanisms for healing workflows
- Show competitive research and knowledge integration

## pnpm Development Workflow

```bash
# Start development server
pnpm dev

# Build and validate before commits
pnpm build
pnpm lint

# Environment setup
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env.local
```

## Testing Guidelines

- Test streaming endpoints with actual NDJSON parsing
- Validate error states and loading states
- Test accessibility with screen readers
- Ensure mobile responsiveness across devices