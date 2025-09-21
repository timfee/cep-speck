# Components Instructions

This directory contains React components for the CEP Spec Validation application.

## Component Organization

### Directory Structure

- `ui/` - Standard shadcn/ui components (badge, button, card, etc.)
- `error/` - Error handling domain components (error-display, circuit-breaker-status, etc.)
- `workflow/` - Business logic components (agentic-prd-wizard, outline-editor, phases/)

### Component Architecture

- Use **functional components** with TypeScript
- Implement **proper prop types** with interfaces
- Follow **shadcn/ui** patterns for consistency
- Use **modern React** patterns (hooks, context)
- **All component files use kebab-case naming**

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
"use client"; // Add for client components with interactivity

import { motion } from "framer-motion";
import { SomeIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ComponentNameProps {
  // Explicit prop types
  required: string;
  optional?: number;
  children?: React.ReactNode;
  className?: string; // Always include for style customization
}

export function ComponentName({
  required,
  optional = defaultValue,
  children,
  className
}: ComponentNameProps) {
  // Component implementation
  return (
    <div className={cn("base-tailwind-classes", className)}>
      {children}
    </div>
  );
}
```

### Modern Component Patterns

#### Motion Components

```typescript
// Use framer-motion for sophisticated animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="component-classes"
>
  Content
</motion.div>
```

#### Class Name Composition

```typescript
// Always use cn() utility for className merging
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  variant === "primary" && "primary-classes",
  disabled && "disabled-classes",
  className // User-provided className last
)}
```

#### TypeScript Patterns

```typescript
// Use proper typing for variants
type Variant = "default" | "primary" | "secondary" | "destructive";
type Size = "sm" | "md" | "lg";

interface ComponentProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
}

// Use discriminated unions for complex state
type StatusState =
  | { status: "loading"; progress?: number }
  | { status: "success"; data: string }
  | { status: "error"; error: string };
```

````

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
````

## Package Manager

- Use `pnpm` for all package operations
- Add UI dependencies with `pnpm add package-name`
- Use `pnpx` for component generation tools
