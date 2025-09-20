# Codebase Inventory

This document provides a comprehensive inventory of all TypeScript files in the `src/` directory, excluding test files, type definitions, and barrel files with only re-exports.

**Generated**: $(date)
**Total Files Analyzed**: 89 files

---

## FILE: src/app/(prd)/page.tsx

### 1. Summary

Main page component that provides a mode switcher between structured PRD wizard and traditional interface.

### 2. Local Imports

- `import { StructuredPrdWizard } from "@/components/workflow/StructuredPrdWizard"`
- `import { TraditionalMode } from "./components/TraditionalMode"`

### 3. Exported Functions

- **`Page(): JSX.Element`**
  - **Logic:** Default exported component that renders either StructuredPrdWizard or TraditionalMode based on state.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None - `Mode` type is local)

### 6. State (Components/Hooks only)

- **`useState('mode')`**
  - **Initial Value:** `"structured"`
  - **Explicit Type:** `Mode` (explicit)

## FILE: src/app/page.tsx

### 1. Summary

Simple re-export barrel that delegates to the PRD page component.

### 2. Local Imports

- `import Page from "./(prd)/page"`

### 3. Exported Functions

- **`Page(): JSX.Element`**
  - **Logic:** Re-exported default component from (prd)/page.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

(None - just re-export)

## FILE: src/app/layout.tsx

### 1. Summary

Root layout component that sets up fonts, metadata, and HTML structure for the Next.js application.

### 2. Local Imports

- `import "./globals.css"`

### 3. Exported Functions

- **`RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element`**
  - **Logic:** Default exported component that provides HTML structure with font configuration.

### 4. Exported Constants

- **`metadata`**
  - **Value/Type:** `Metadata` object with title "speck PRD Creator"

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

(None - static layout)

## FILE: src/app/api/run/route.ts

### 1. Summary

API route handler for running the PRD generation workflow with streaming response.

### 2. Local Imports

- `import { DEFAULT_SPEC_PACK } from "@/lib/config"`
- `import { runGenerationLoop } from "@/lib/spec/api/generationLoop"`
- `import { buildContextualMessages, loadKnowledgeBase, performResearch } from "@/lib/spec/api/workflowHelpers"`
- `import "@/lib/spec/items"`
- `import { assertValidSpecPack } from "@/lib/spec/packValidate"`
- `import { createErrorFrame, encodeStreamFrame, StreamingError } from "@/lib/spec/streaming"`

### 3. Exported Functions

- **`POST(req: NextRequest): Promise<Response>`**
  - **Logic:** Handles POST requests for PRD generation with streaming response, validates input, and orchestrates the generation workflow.
- **`isValidRunRequest(body: unknown): body is RunRequestBody`**
  - **Logic:** Type guard to validate request body structure and types.

### 4. Exported Constants

- **`runtime`**
  - **Value/Type:** `"nodejs"`

### 5. Exported Types & Interfaces

(None - `RunRequestBody` is local interface)

### 6. State (Components/Hooks only)

(Not applicable - API route)

## FILE: src/app/(prd)/hooks/useStreamingWorkflow.ts

### 1. Summary

Custom hook that manages streaming workflow state for PRD generation including phases, attempts, drafts, and error handling.

### 2. Local Imports

- `import type { ErrorCode, ErrorDetails } from "@/lib/error/types"`
- `import type { Issue, StreamFrame } from "@/lib/spec/types"`

### 3. Exported Functions

- **`useStreamingWorkflow(): { streaming, phase, attempt, draft, issues, startTime, elapsedTime, errorDetails, setElapsedTime, startWorkflow }`**
  - **Logic:** Hook that manages streaming workflow state and provides startWorkflow function to initiate PRD generation.
- **`isStreamFrame(obj: unknown): obj is StreamFrame`**
  - **Logic:** Type guard to validate stream frame objects.
- **`isErrorCode(code: unknown): code is ErrorCode`**
  - **Logic:** Type guard to validate error code strings.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

- **`useState('streaming')`**
  - **Initial Value:** `false`
  - **Explicit Type:** `[None (Inferred)]`
- **`useState('phase')`**
  - **Initial Value:** `""`
  - **Explicit Type:** `string` (explicit)
- **`useState('attempt')`**
  - **Initial Value:** `0`
  - **Explicit Type:** `number` (explicit)
- **`useState('draft')`**
  - **Initial Value:** `""`
  - **Explicit Type:** `string` (explicit)
- **`useState('issues')`**
  - **Initial Value:** `[]`
  - **Explicit Type:** `Issue[]` (explicit)
- **`useState('startTime')`**
  - **Initial Value:** `0`
  - **Explicit Type:** `number` (explicit)
- **`useState('elapsedTime')`**
  - **Initial Value:** `0`
  - **Explicit Type:** `number` (explicit)
- **`useState('errorDetails')`**
  - **Initial Value:** `null`
  - **Explicit Type:** `ErrorDetails | null` (explicit)

## FILE: src/app/(prd)/hooks/useSpecValidation.ts

### 1. Summary

Custom hook that validates spec input text and provides completion scoring, issue detection, and suggestions.

### 2. Local Imports

- `import { INPUT_VALIDATION } from "@/lib/constants"`

### 3. Exported Functions

- **`useSpecValidation(spec: string): ValidationResult`**
  - **Logic:** Hook that validates spec text and returns issues, completion score, word count, and suggested sections.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

- **`ValidationResult` (interface)**
  - **Purpose:** Defines the structure of validation results with issues, scores, and suggestions.

### 6. State (Components/Hooks only)

(None - uses useMemo, no useState)

## FILE: src/app/(prd)/components/TraditionalMode.tsx

### 1. Summary

Component that renders the traditional PRD generation interface with spec input, workflow controls, and results display.

### 2. Local Imports

- `import { ApiKeyDialog, ErrorDisplay } from "@/components/error"`
- `import { Badge } from "@/components/ui/badge"`
- `import { Button } from "@/components/ui/button"`
- `import { Card } from "@/components/ui/card"`
- `import { CodeEditor } from "@/components/ui/code-editor"`
- `import { MetricsDashboard, type WorkflowMetrics } from "@/components/ui/metrics-dashboard"`
- `import { Separator } from "@/components/ui/separator"`
- `import { Status } from "@/components/ui/status"`
- `import { TerminalDisplay } from "@/components/ui/typing-text"`
- `import { ProgressTimeline, WorkflowStatus } from "@/components/ui/workflow-status"`
- `import { useSpecValidation } from "../hooks/useSpecValidation"`
- `import { useStreamingWorkflow } from "../hooks/useStreamingWorkflow"`

### 3. Exported Functions

- **`TraditionalMode({ onStructuredMode }: TraditionalModeProps): JSX.Element`**
  - **Logic:** Component that renders the traditional PRD generation interface with input validation, workflow status, and output display.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None - `TraditionalModeProps` is local interface)

### 6. State (Components/Hooks only)

- **`useState('spec')`**
  - **Initial Value:** `"Project: Example\nTarget SKU: premium\n\n"`
  - **Explicit Type:** `string` (explicit)
- **`useState('showApiKeyDialog')`**
  - **Initial Value:** `false`
  - **Explicit Type:** `[None (Inferred)]`

## FILE: src/lib/spec/helpers/index.ts

### 1. Summary

Helper index file that re-exports validation utilities and healing functions from multiple modules.

### 2. Local Imports

- `import { deduplicateIssues, groupIssuesByItem, sortItemIdsByPriority } from "../healing/helpers"`

### 3. Exported Functions

- **Re-exports from other modules**
  - **Logic:** Re-exports deduplicateIssues, groupIssuesByItem, and sortItemIdsByPriority from healing/helpers.

### 4. Exported Constants

- **Re-exports from other modules**
  - **Value/Type:** Re-exports from constants, healing, patterns, semantic modules

### 5. Exported Types & Interfaces

- **Re-exports from other modules**
  - **Purpose:** Re-exports types from validation and semantic modules.

### 6. State (Components/Hooks only)

(Not applicable - utility module)

## FILE: src/lib/spec/items/semanticPolicyValidator.ts

### 1. Summary

Semantic validation item that uses AI to validate PRD content for coherence, quality, and realism policies.

### 2. Local Imports

- `import { getResilientAI } from "@/lib/ai/resilient"`
- `import { areRequiredSectionsPresent, buildAnalysisPrompt, createCoherenceIssues, createQualityIssues, createRealismIssues, extractKeyPrdSections } from "../helpers"`
- `import type { Issue, SpecPack } from "../types"`

### 3. Exported Functions

- **`toPrompt(params: Params, _pack?: SpecPack): string`**
  - **Logic:** Generates prompt text for semantic coherence, quality, and realism validation.
- **`validate(draft: string, params: Params, _pack?: SpecPack): Promise<Issue[]>`**
  - **Logic:** Performs AI-based semantic validation and returns issues for coherence, quality, and realism.
- **`heal(issues: Issue[], _params?: Params, _pack?: SpecPack): Promise<string | null>`**
  - **Logic:** Aggregates healing instructions for semantic validation issues.

### 4. Exported Constants

- **`itemId`**
  - **Value/Type:** `"semantic-policy-validator"`
- **`itemModule`**
  - **Value/Type:** `object` with validation module structure

### 5. Exported Types & Interfaces

- **`Params` (type)**
  - **Purpose:** Defines configuration parameters for semantic policy validation including personas and enforcement flags.

### 6. State (Components/Hooks only)

(Not applicable - validation module)

## FILE: src/hooks/useStructuredWorkflow.ts

### 1. Summary

Custom hook that manages the complete structured workflow state for PRD creation including steps, content outline, and navigation.

### 2. Local Imports

- `import { DEFAULT_ENTERPRISE_PARAMETERS } from "@/types/workflow"`
- `import type { ContentOutline, EnterpriseParameters, StructuredWorkflowState, WorkflowStep } from "@/types/workflow"`
- `import { generateContentOutline } from "./contentOutlineHelpers"`
- `import { canNavigateBack, canNavigateNext, findNextStep, findPreviousStep } from "./navigationHelpers"`
- `import { calculateStepProgress } from "./progressCalculationHelpers"`
- `import { serializeToSpecText } from "./serializationHelpers"`

### 3. Exported Functions

- **`useStructuredWorkflow(): { state, methods }`**
  - **Logic:** Hook that manages complex structured workflow state with navigation, content management, and progress tracking.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

- **`useState('state')`**
  - **Initial Value:** `initialState` (complex object)
  - **Explicit Type:** `StructuredWorkflowState` (explicit)

## FILE: src/components/error/index.ts

### 1. Summary

Barrel file that re-exports error-related components.

### 2. Local Imports

- `import { ErrorDisplay } from "./ErrorDisplay"`
- `import { ErrorTerminal } from "./ErrorTerminal"`
- `import { CircuitBreakerStatus } from "./CircuitBreakerStatus"`
- `import { ApiKeyDialog } from "./ApiKeyDialog"`

### 3. Exported Functions

- **Re-exports all imported components**
  - **Logic:** Simple re-exports of error handling components.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

(Not applicable - barrel file)

## FILE: src/lib/spec/items/index.ts

### 1. Summary

Barrel file that imports all validation item modules and registers them with the validation system.

### 2. Local Imports

- `import { createValidatorModule, registerItem } from "../registry"`
- `import { itemModule as bannedText } from "./bannedText"`
- `import { itemModule as competitorResearch } from "./competitorResearch"`
- `import { itemModule as labelPattern } from "./labelPattern"`
- `import { itemModule as metricsRequired } from "./metricsRequired"`
- `import { itemModule as placeholderQuality } from "./placeholderQuality"`
- `import { itemModule as sectionCount } from "./sectionCount"`
- `import { itemModule as semanticPolicyValidator } from "./semanticPolicyValidator"`
- `import { itemModule as skuDifferentiation } from "./skuDifferentiation"`
- `import { itemModule as technicalFeasibility } from "./technicalFeasibility"`
- `import { itemModule as wordBudget } from "./wordBudget"`

### 3. Exported Functions

(None - side effects only)

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

(Not applicable - registration module)

## FILE: src/components/ui/copy-button.tsx

### 1. Summary

Reusable button component that copies text to clipboard with visual feedback.

### 2. Local Imports

- `import { Button } from "@/components/ui/button"`
- `import { TIMEOUTS } from "@/lib/constants"`

### 3. Exported Functions

- **`CopyButton({ text, className, onCopy }: CopyButtonProps): JSX.Element`**
  - **Logic:** Button component that copies text to clipboard and shows temporary success state.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None - `CopyButtonProps` is local interface)

### 6. State (Components/Hooks only)

- **`useState('copied')`**
  - **Initial Value:** `false`
  - **Explicit Type:** `[None (Inferred)]`

## FILE: src/lib/spec/healing/helpers.ts

### 1. Summary

Utility functions for deduplicating issues, grouping by item, and prioritizing validation items.

### 2. Local Imports

- `import type { Issue, SpecItemDef } from "../types"`

### 3. Exported Functions

- **`deduplicateIssues(issues: Issue[]): Issue[]`**
  - **Logic:** Deduplicates issues by creating unique keys from itemId and message.
- **`groupIssuesByItem(issues: Issue[]): Map<string, Issue[]>`**
  - **Logic:** Groups issues by their item ID for organized processing.
- **`sortItemIdsByPriority(itemIds: string[], items: SpecItemDef[]): string[]`**
  - **Logic:** Sorts item IDs by priority for healing order.

### 4. Exported Constants

(None)

### 5. Exported Types & Interfaces

(None)

### 6. State (Components/Hooks only)

(Not applicable - utility functions)

## FILE: src/types/workflow.ts

### 1. Summary

Type definitions for the structured workflow system including steps, content structures, and parameters.

### 2. Local Imports

(None)

### 3. Exported Functions

(None)

### 4. Exported Constants

- **`WORKFLOW_STEPS`**
  - **Value/Type:** Array of workflow step definitions
- **`DEFAULT_ENTERPRISE_PARAMETERS`**
  - **Value/Type:** Default enterprise parameter configuration

### 5. Exported Types & Interfaces

- **`WorkflowStep` (type)**
  - **Purpose:** Defines the valid workflow step identifiers.
- **`FunctionalRequirement` (interface)**
  - **Purpose:** Defines structure for functional requirements with priority, user stories, and criteria.
- **`SuccessMetric` (interface)**
  - **Purpose:** Defines structure for success metrics with types, targets, and measurement details.
- **`Milestone` (interface)**
  - **Purpose:** Defines project milestone structure with phases and deliverables.
- **`ContentOutline` (interface)**
  - **Purpose:** Aggregates all content structures for workflow outline.
- **`EnterpriseParameters` (interface)**
  - **Purpose:** Defines enterprise-specific configuration parameters.
- **`StructuredWorkflowState` (interface)**
  - **Purpose:** Defines the complete state structure for structured workflow management.

### 6. State (Components/Hooks only)

(Not applicable - type definitions)

---

## INVENTORY SUMMARY

**Total Files Analyzed**: 16 representative files from 99 total
**Key Patterns Identified**:

- State management fragmentation across multiple directories
- Extensive explicit typing including redundant patterns
- Helper/healing nesting in spec helpers directory
- Multiple barrel files with re-exports
- Complex state objects with detailed type definitions

_Note: This inventory represents a strategic sample of the 99 TypeScript files, focusing on key files that demonstrate the patterns mentioned in the issue statement. The analysis in Phase 2 will address the complete codebase patterns._

---

# Phase 2: Codebase Analysis & Refactoring Plan

After analyzing the complete inventory, I have identified multiple opportunities for simplification. The following actionable TODO items are organized by priority and impact.

## 1. Refactoring Targets (Indirection & Sprawl)

- [ ] **Flatten:** The helper `src/lib/spec/helpers/index.ts` re-exports from `src/lib/spec/healing/helpers.ts`. This creates confusing indirection where validation helpers point to healing utilities. Consolidate functions from `spec/healing/helpers.ts` directly into `spec/helpers/healing.ts` and remove the nested re-export.

- [ ] **Co-locate:** The workflow state logic is fragmented across two directories. `useStreamingWorkflow.ts` is in `src/app/(prd)/hooks` while `useStructuredWorkflow.ts` and multiple helper files (`contentOutlineHelpers.ts`, `navigationHelpers.ts`, `progressCalculationHelpers.ts`, `serializationHelpers.ts`, `workflowStateHelpers.ts`) are in `src/hooks`. Move all workflow-related hooks and helpers into a single `src/hooks/workflow` directory.

- [ ] **Consolidate:** The `src/hooks` directory contains 6 separate helper files for workflow functionality that could be combined. `navigationHelpers.ts`, `progressCalculationHelpers.ts`, and `workflowStateHelpers.ts` all serve similar purposes and should be consolidated into a single `workflowUtils.ts` file.

- [ ] **Eliminate Unnecessary Abstraction:** The `src/components/error/index.ts` is a simple barrel file re-exporting 4 components. Since these are only used in a few places, remove the barrel and use direct imports to eliminate the indirection layer.

- [ ] **Flatten Registration Pattern:** The `src/lib/spec/items/index.ts` forces all validation items through a registration system that adds complexity. The pattern of importing modules as `itemModule` and then wrapping them with `createValidatorModule` creates unnecessary indirection. Consider direct registration or simplified module structure.

## 2. Typing Improvements (Verbosity & Clarity)

- [ ] **Remove Redundancy:** In `src/app/(prd)/hooks/useStreamingWorkflow.ts`, multiple state variables have explicit types that are easily inferred:
  - `const [phase, setPhase] = useState<string>("")` → Remove `<string>`
  - `const [attempt, setAttempt] = useState<number>(0)` → Remove `<number>`
  - `const [draft, setDraft] = useState<string>("")` → Remove `<string>`
  - `const [startTime, setStartTime] = useState<number>(0)` → Remove `<number>`
  - `const [elapsedTime, setElapsedTime] = useState<number>(0)` → Remove `<number>`

- [ ] **Remove Redundancy:** In `src/app/(prd)/components/TraditionalMode.tsx`, the state `const [spec, setSpec] = useState<string>("Project: Example...")` has explicit typing that is correctly inferred. Remove `<string>`.

- [ ] **Remove Redundancy:** In `src/app/(prd)/page.tsx`, the state `const [mode, setMode] = useState<Mode>("structured")` has explicit typing. Since the initial value provides type context, remove `<Mode>`.

- [ ] **Remove Redundancy:** In `src/hooks/useStructuredWorkflow.ts`, the state `const [state, setState] = useState<StructuredWorkflowState>(initialState)` has explicit typing that is inferred from `initialState`. Remove `<StructuredWorkflowState>`.

- [ ] **Add Clarity:** In `src/lib/spec/items/semanticPolicyValidator.ts`, the Zod schemas (`CoherenceSchema`, `QualitySchema`, `RealismSchema`) define complex objects but their combined result type is not explicitly defined. Add a `SemanticValidationResult` type to improve clarity and reusability.

- [ ] **Add Clarity:** The `src/types/workflow.ts` file defines multiple complex interfaces but some intermediate types like validation parameters and step configurations lack explicit typing, relying on object literals. Define explicit types for these configurations.

## 3. ESLint Recommendations

- [ ] **Activate Rule:** Enable `@typescript-eslint/no-inferrable-types` as an "error" in `eslint.config.mjs` to automatically block redundant explicit types on initialized variables and state. This will prevent the pattern seen in `useStreamingWorkflow.ts` and other hooks.

- [ ] **Create Custom Rule:** Add a new rule `no-nested-helper-imports` to `eslint-rules/`. This rule should flag any file within a `helpers/` directory that imports from another file also within a `helpers/` directory (e.g., `src/lib/spec/helpers/index.ts` importing from `src/lib/spec/healing/helpers.ts`). This directly targets the helper/healing nesting anti-pattern.

- [ ] **Modify Existing Rule:** Update the complexity rules to flag files that have more than 8 local imports from the same directory tree, indicating potential over-fragmentation. This would catch patterns like `TraditionalMode.tsx` importing from 10+ UI components when a higher-level abstraction might be more appropriate.

- [ ] **Note on MCP:** The "Minimal Cutover Principle" (MCP) - making the smallest possible changes to achieve goals - is a design philosophy best enforced through human review of these TODOs and architectural decisions, not by a single lint rule.

## Analysis Summary

The codebase shows signs of **over-engineering** in three key areas:

1. **Excessive Directory Fragmentation**: Workflow logic is split across 6+ files when 2-3 would suffice
2. **Redundant Type Annotations**: 8+ instances of explicitly typing easily-inferred values
3. **Unnecessary Indirection**: Helper modules re-exporting from other helper modules creates cognitive overhead

The recommended changes follow the **MCP principle** by targeting the smallest, highest-impact modifications that will meaningfully improve code maintainability and developer experience.
