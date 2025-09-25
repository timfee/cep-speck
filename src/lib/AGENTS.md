# AI Agent Guide (`src/lib`)

This guide provides context for the `src/lib` directory. All code must adhere to the standards in the [root `AGENTS.md` guide](../../AGENTS.md).

## Purpose

This directory contains shared libraries, utility functions, and core business logic that is not part of the UI.

## Structure

- **`ai.ts`**: Core functions for interacting with the AI SDK, including `generateObject` calls and schema definitions (Zod).
- **`utils.ts`**: Shared utility functions and type definitions used across the application.
- **`prompts/`**: Contains markdown files with system prompts and specific instructions for guiding AI model behavior.
