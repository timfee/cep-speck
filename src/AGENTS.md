# AI Agent Guide (`src`)

This guide provides context for the `src` directory. All code within this directory must adhere to the high-level standards defined in the [root `AGENTS.md` guide](../AGENTS.md).

## Directory Structure

The `src` directory contains the main application source code, organized as follows:

- `app/`: Next.js App Router pages and layouts. This is the entry point for all user-facing routes.
- `components/`: Shared and feature-specific React components.
- `lib/`: Utility functions, AI integrations, and other shared logic that is not a React component.
- `actions/`: Next.js Server Actions that handle backend logic and data mutations.
- `eslint-rules/`: Custom ESLint rules for maintaining code quality and consistency.
