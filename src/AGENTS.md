# Source Code Structure - AI Agent Guide

This directory contains the main source code for the PRD Generation application.

## Directory Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components organized by function
- `lib/` - Utility functions, AI integrations, and shared logic
- `actions/` - Server Actions for AI generation workflows
- `eslint-rules/` - Custom ESLint rules for code quality

## Key Files

- `lib/ai.ts` - AI service integrations and configuration
- `lib/utils.ts` - Utility functions and helpers
- `actions/generate-*.ts` - Server Actions for PRD generation workflow

## Development Guidelines

- Follow Next.js 15 App Router patterns
- Use Server Components by default, Client Components only when necessary
- Server Actions for AI generation to keep API keys secure
- Type-safe with TypeScript throughout