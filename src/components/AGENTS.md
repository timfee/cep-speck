# AI Agent Guide (`src/components`)

This guide provides context for the `src/components` directory. All components must adhere to the standards in the [root `AGENTS.md` guide](../../AGENTS.md).

## Component Structure

- **`ui/`**: Contains reusable, general-purpose UI components based on `shadcn/ui`. These should be stateless and highly composable.
- **Feature Components (`*.tsx`)**: Higher-level components that compose UI elements and implement specific features for the wizard workflow (e.g., `prd-wizard.tsx`, `steps.tsx`).

## Key Guidelines

- **Server Components First**: Default to Server Components. Only use the `"use client"` directive for components requiring interactivity or browser APIs.
- **Composition**: Build complex components by composing smaller, single-purpose ones.
- **Accessibility**: Ensure all components are accessible, using semantic HTML and ARIA attributes where necessary.
