# Library Code - AI Agent Guide

This directory contains core utility functions, AI integrations, and shared business logic.

## Files

- `ai.ts` - Google Gemini AI integration, model configuration, and API client setup
- `utils.ts` - General utility functions and helpers for the application
- `prompts/` - AI prompt templates for PRD generation workflows

## AI Integration

The `ai.ts` file configures Google Gemini models for:
- PRD content generation
- Outline creation
- Content validation and improvement

## Guidelines

- Keep AI configurations centralized in `ai.ts`
- Shared utilities should be pure functions when possible
- Type all exports for better IDE support and AI assistance