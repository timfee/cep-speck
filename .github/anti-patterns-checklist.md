# Anti-Patterns Checklist for Codebase Cleanup

This checklist documents the anti-patterns identified during the codebase cleanup process and serves as a reference for ongoing maintenance.

## 🎯 Primary Anti-Patterns Identified

### 1. **Indirection Used by Only One File**

- **Problem**: Files that create abstractions consumed by a single file
- **Solution**: Inline the functionality or group with related abstractions
- **Examples**:
  - Re-export only barrel files (index.ts with single export)
  - Single-use wrapper functions
  - Unnecessary abstraction layers

### 2. **Directories with 1-2 Files**

- **Problem**: Over-organization creating empty directory hierarchies
- **Solution**: Consolidate into parent directories unless justified by domain
- **Examples**:
  - `./lib/ai/__tests__` (1 file) → Move to `./lib/ai/`
  - `./lib/workflow/__tests__` (1 file) → Move to `./lib/workflow/`
  - Exception: API routes (`./app/api/content-outline`) are valid

### 3. **Multiple Functions with Identical/Similar Parameters**

- **Problem**: Code duplication across similar function signatures
- **Solution**: Create shared utilities or consolidate implementations
- **Examples**:
  - Progress calculation functions
  - Validation helpers with same patterns
  - State management utilities

### 4. **Nesting Folders with Generic Names**

- **Problem**: Generic directory names like `util`, `lib`, `helpers` without clear purpose
- **Solution**: Use specific, domain-focused names or consolidate
- **Examples**:
  - `lib/utils/helpers/validation/` → `lib/validation/`
  - `utils/misc/random/` → consolidate into main utils

### 5. **Sprawling Co-located Files**

- **Problem**: Similar functionality scattered across multiple subdirectories
- **Solution**: Centralize related functionality
- **Examples**:
  - Hooks in multiple subdirectories → `./hooks/`
  - Components scattered → `./components/`

## 🚀 Additional Anti-Patterns Discovered

### 6. **Files That Only Re-Export Other Files**

- **Problem**: Barrel files that add no value and increase complexity
- **Solution**: Use direct imports instead of indirection
- **Detection**: Files with only `export { ... } from ...` statements
- **Exceptions**: Core library entry points with side effects

### 7. **Shims and Compatibility Layers**

- **Problem**: Outdated compatibility code that can be removed
- **Solution**: Remove when target environments no longer need them
- **Examples**:
  - Legacy API wrappers
  - Polyfills for modern environments
  - Deprecated patterns

### 8. **Functions Similar But Slightly Different**

- **Problem**: Near-duplicate implementations that could be unified
- **Solution**: Extract common functionality with configuration options
- **Examples**:
  - Progress calculation variations
  - Similar validation patterns
  - State update functions

### 9. **Excessive File Count (>30 TS/TSX files)**

- **Problem**: Cognitive overload from too many small files
- **Solution**: Consolidate related functionality into meaningful modules
- **Target**: Keep under 30 TypeScript files in `src/` (excluding tests)

### 10. **Unnecessary Complexity Layers**

- **Problem**: Over-engineered solutions for simple problems
- **Solution**: Prefer simple, direct solutions
- **Examples**:
  - Complex state management for simple UI
  - Over-abstracted APIs
  - Unnecessary design patterns

## 📋 Remediation Checklist

### Before Starting Cleanup

- [ ] Run full test suite to establish baseline
- [ ] Document current file count and structure
- [ ] Identify core functionality that must be preserved
- [ ] Set up automated linting and testing

### During Cleanup Process

- [ ] Check each file for single-use abstractions
- [ ] Consolidate directories with <3 files
- [ ] Remove duplicate function implementations
- [ ] Eliminate unnecessary re-export files
- [ ] Merge similar utility functions
- [ ] Update all import references after moves
- [ ] Verify no circular dependencies introduced

### After Each Major Change

- [ ] Run linting: `pnpm lint`
- [ ] Run tests: `pnpm test`
- [ ] Build application: `pnpm build`
- [ ] Manual smoke testing of core flows
- [ ] Update documentation if needed

## 🎯 Success Criteria

### File Organization

- [ ] **Under 30 TS/TSX files** in `src/` directory (excluding tests)
- [ ] **No directories with <3 files** (unless domain-justified)
- [ ] **No barrel files** that only re-export
- [ ] **Clear directory purpose** - avoid generic names

### Code Quality

- [ ] **No duplicate functions** with identical logic
- [ ] **All imports working** after consolidation
- [ ] **Tests passing** after changes
- [ ] **Linting clean** with no warnings

### Architecture

- [ ] **Single responsibility** - each file has clear purpose
- [ ] **Minimal nesting** - prefer flat over deep hierarchies
- [ ] **Direct imports** - avoid unnecessary indirection
- [ ] **Idiomatic patterns** - follow React/Next.js best practices

## 🔍 Detection Scripts

### Find Single-File Directories

```bash
find src -type d -exec sh -c 'echo $(find "$0" -maxdepth 1 -name "*.ts" -o -name "*.tsx" | wc -l) $0' {} \; | awk '$1 < 3 && NF > 1'
```

### Find Re-Export Only Files

```bash
grep -l "^export.*from" src/**/*.ts | xargs grep -L "^[^e]"
```

### Count TypeScript Files

```bash
find src -name "*.ts" -o -name "*.tsx" | wc -l
```

### Find Duplicate Function Names

```bash
grep -r "^export.*function\|^function" src --include="*.ts" --include="*.tsx" | cut -d: -f2 | sort | uniq -d
```

## 📈 Maintenance

This checklist should be reviewed:

- **Before major refactoring** efforts
- **After adding significant new features**
- **During quarterly code reviews**
- **When file count approaches limits**

Update this document when new anti-patterns are discovered or remediation strategies prove ineffective.
