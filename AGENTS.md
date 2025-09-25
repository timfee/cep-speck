# AI Agent Collaboration Guide (Root)

Comprehensive guidance for collaborating with AI assistants (GitHub Copilot, Google Gemini, and other AI agents) in this repository. This document establishes conventions so outputs are predictable, reviewable, and high-quality.

This is the primary, high-level guide. Subdirectories may contain their own `AGENTS.md` with more specific, cascading details.

---

## 1. Project Overview & Purpose

This project generates and validates Product Requirement Documents (PRDs) for Chrome Enterprise Premium (CEP). The application is a full-stack, modern web app built on Next.js.

AI agents are used to:
- Draft structured PRDs aligned to internal style.
- Apply layered validation (structure, metrics, traceability, realism).
- Heal / auto-remediate issues when safe.
- Accelerate competitive research and metric articulation.

**Out of Scope:**
- Inventing unverifiable market data.
- Replacing critical human product judgment.

---

## 2. Technology Stack & Coding Conventions

Adherence to these technical guidelines is mandatory for all contributions.

### 2.1. Technology Stack
- **Framework**: Next.js 15+ with the App Router
- **Language**: TypeScript (Strict Mode)
- **UI Library**: React
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks (`useState`, `useReducer`, `useContext`)
- **Backend Logic**: Next.js Server Actions
- **Schema Validation**: Zod
- **AI Integration**: Vercel AI SDK

### 2.2. Core Coding Principles
- **DRY (Don't Repeat Yourself)**: Encapsulate and reuse logic.
- **Idiomatic Code**: Write code that aligns with established framework and library conventions.
- **Clarity and Readability**: Prioritize human-readable code.

### 2.3. React & Next.js Best Practices
- **Server Components First**: Default all new components to Server Components. Only use Client Components (`"use client"`) for interactivity or browser-only APIs. Keep Client Components as small and focused as possible.
- **Server Actions for Mutations**: Handle all backend logic, data mutations, and secret management through Server Actions. Use the `useTransition` hook in client-side calls to manage loading states.
- **Component Design**: Use functional components with hooks. Favor composition over inheritance.

### 2.4. TypeScript & JSDoc/TSDoc
- **Strict Typing**: Avoid `any`. Define clear, descriptive types and interfaces.
- **JSDoc/TSDoc Comments**: All exported functions, types, and complex logic must have clear JSDoc/TSDoc comments explaining their purpose, parameters, and return values.

---

## 3. Project-Specific Concepts (PRD Generation)

- **Spec Pack**: Configuration for validation items (`src/lib/spec/packs/*`).
- **Validation Item**: A module implementing `toPrompt` and `validate` functions (`src/lib/spec/items/`).
- **Issue**: A structured validation finding.
- **System Prompt**: An aggregated instruction block for the AI.

---

## 4. Key Policies
- **Deterministic Validation**: The system uses a strictly deterministic first-pass validation. Validators must be pure functions.
- **Privacy & Safety**: Do not commit confidential data. Use structured placeholders like `[PM_INPUT_NEEDED: ...]`.
- **PR Workflow**: Use `feat/<item-id>` or `chore/prompt-rules` for branch names. Ensure PRs are linked to an issue.