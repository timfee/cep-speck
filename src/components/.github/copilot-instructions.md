# React Component Development Guidelines

This directory contains reusable React components built with shadcn/ui design system, following modern React 19 patterns.

## Component Architecture

- **shadcn/ui Foundation**: Built on Radix UI primitives with Tailwind styling
- **Composition Over Configuration**: Flexible, composable component APIs
- **Accessibility First**: WCAG 2.1 compliance, keyboard navigation, screen reader support
- **Performance Optimized**: Lazy loading, memo optimization, bundle splitting

## Development Principles

- **Idiomatic React**: Use React 19 features appropriately (useOptimistic, useActionState)
- **TypeScript Strict**: Explicit prop types, no implicit any, proper generics
- **Modern Patterns**: Custom hooks for logic, composition for UI
- **Not Over-engineered**: Simple, readable components over complex abstractions
- **Not Hacked Together**: Proper error boundaries, loading states, edge case handling

## Component Structure

```typescript
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define variants with class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## UI/UX Guidelines

### Design System Adherence

- Use shadcn/ui components as building blocks
- Follow consistent spacing (4, 8, 12, 16, 24px scale)
- Maintain color scheme coherence
- Implement proper focus states and interactions

### Responsive Design

- Mobile-first approach with Tailwind breakpoints
- Touch-friendly interactive elements (44px minimum)
- Readable typography across devices
- Appropriate information density per screen size

### Loading and Error States

```typescript
// Pattern for handling async states
const Component = () => {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  return (
    <div>
      {state === 'loading' && <Spinner />}
      {state === 'error' && <ErrorMessage />}
      {state === 'success' && <SuccessContent />}
    </div>
  );
};
```

## Component Categories

### `/ui` - Base Components
- Low-level, reusable primitives
- No business logic, pure presentation
- Extensive prop interfaces for flexibility
- Comprehensive TypeScript typing

### `/error` - Error Handling
- Error boundaries for graceful failure
- User-friendly error messages
- Development-time debugging aids
- Recovery action interfaces

### `/features` - Feature Components
- Business logic integration
- Domain-specific functionality
- Composed from ui primitives
- Connected to application state

## Testing Patterns

- Unit tests for component logic
- Visual regression tests for UI consistency
- Accessibility tests with axe-core
- Integration tests for user workflows

## Performance Optimization

- Lazy load heavy components with React.lazy()
- Memoize expensive calculations with useMemo()
- Optimize re-renders with React.memo()
- Bundle split by feature boundaries