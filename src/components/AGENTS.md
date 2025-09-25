# React Components - AI Agent Guide

This directory contains the React components that make up the PRD generation interface.

## Structure

- `ui/` - Reusable UI components (shadcn/ui based)
- `*.tsx` - Feature-specific components for the wizard workflow

## Key Components

- `prd-wizard.tsx` - Main wizard interface for PRD generation
- `wizard.tsx` - Core wizard navigation and state management
- `steps.tsx` - Individual step components for the workflow
- `ai-progress-modal.tsx` - AI generation progress display

## UI Components (`ui/`)

Standardized components from shadcn/ui providing:
- Consistent styling with Tailwind CSS
- Accessibility features
- Type-safe props

## Guidelines

- Use Server Components by default (components in this directory are client-side)
- Follow shadcn/ui patterns for new UI components  
- Keep business logic in Server Actions when possible
- Ensure accessibility and responsive design