# Components Instructions

This directory contains React components for the CEP Spec Validation application.

## Component Development Guidelines

### Component Architecture

- Use **functional components** with TypeScript
- Implement **proper prop types** with interfaces
- Follow **shadcn/ui** patterns for consistency
- Use **modern React** patterns (hooks, context)

### TypeScript Standards

- Define explicit prop interfaces
- Use proper typing for event handlers
- Leverage type inference where appropriate
- Avoid `any` types - use proper typing

### Styling Guidelines

- Use **Tailwind CSS** classes for styling
- Follow existing design system patterns
- Maintain responsive design principles
- Use shadcn/ui components when available

### Component Structure Pattern

```typescript
import type { ComponentProps } from "react";

interface ComponentNameProps {
  // Explicit prop types
  required: string;
  optional?: number;
  children?: React.ReactNode;
}

export function ComponentName({
  required,
  optional = defaultValue,
  children
}: ComponentNameProps) {
  // Component implementation
  return (
    <div className="tailwind-classes">
      {children}
    </div>
  );
}
```

### State Management

- Use `useState` for local component state
- Use `useEffect` for side effects with proper cleanup
- Implement custom hooks for reusable logic
- Consider React Context for shared state

### Error Handling

- Implement error boundaries where appropriate
- Handle loading and error states gracefully
- Provide meaningful user feedback
- Use TypeScript for compile-time error prevention

### Performance Considerations

- Use `React.memo()` for expensive components
- Implement proper dependency arrays in hooks
- Avoid unnecessary re-renders
- Use `useCallback` and `useMemo` judiciously

### Accessibility

- Include proper ARIA attributes
- Ensure keyboard navigation support
- Maintain semantic HTML structure
- Test with screen readers when applicable

## UI-Specific Rules

- Magic numbers are allowed for UI spacing and dimensions
- Common values: 0, 1, 2, 4, 8, 10, 12, 16, 20, 24, 32, 48, 64, 100, etc.
- Focus on user experience over strict code metrics
- Maintain visual consistency with existing components

## Testing Components

```bash
# Run development server
pnpm dev

# Test components in browser
# Navigate to http://localhost:3000
# Verify UI functionality and responsiveness
```

## Package Manager

- Use `pnpm` for all package operations
- Add UI dependencies with `pnpm add package-name`
- Use `pnpx` for component generation tools
