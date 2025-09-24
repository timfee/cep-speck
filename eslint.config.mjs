import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import { dirname } from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";
import customRules from "./eslint-rules/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      promise: promisePlugin,
      unicorn: unicorn,
      sonarjs: sonarjs,
      custom: customRules,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // ============ RULE 1: No Unnecessary Type Assertions ============
      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      // ============ RULE 2: No Explicit Any ============
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: true,
          ignoreRestArgs: false,
        },
      ],

      // ============ RULE 3: Import Order ============
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: [],
          "newlines-between": "always-and-inside-groups",
          consolidateIslands: "inside-groups",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          warnOnUnassignedImports: false,
        },
      ],

      // ============ RULE 4: No Floating Promises ============
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          ignoreVoid: false,
          ignoreIIFE: false,
          checkThenables: true,
        },
      ],

      // ============ RULE 5: React Hooks Exhaustive Deps ============
      "react-hooks/exhaustive-deps": [
        "error",
        {
          additionalHooks: "(useSpecValidation|useCallback|useMemo)",
          enableDangerousAutofixThisMayCauseInfiniteLoops: false,
        },
      ],

      // ============ RULE 6: Consistent Type Imports ============
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: true,
        },
      ],

      // ============ RULE 7: No Magic Numbers & Prefer Const ============
      "no-magic-numbers": [
        "error",
        {
          ignore: [0, 1, -1, 2, 100, 1000],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      "prefer-const": [
        "error",
        {
          destructuring: "all",
          ignoreReadBeforeAssign: false,
        },
      ],

      // ============ RULE 8: Naming Convention ============
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^[A-Z]",
            match: true,
          },
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          types: ["string", "number"],
          format: ["UPPER_CASE", "camelCase"],
        },
        {
          selector: "parameter",
          modifiers: ["unused"],
          format: ["camelCase"],
          leadingUnderscore: "require",
        },
      ],

      // ============ RULE 9: No Restricted Imports (Barrel Files) ============
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/spec/helpers", "*/spec/helpers/index"],
              message:
                "Import helper utilities directly from their source modules instead of the helpers barrel",
            },
            {
              group: ["*/spec/items", "*/spec/items/index"],
              message:
                "Import validator items directly from their source modules instead of the items barrel",
            },
            {
              group: [
                "*/spec/*/*",
                "!*/spec/helpers/*",
                "!*/spec/items/*",
                "!*/spec/types",
                "!*/spec/registry",
                "!*/spec/streaming",
              ],
              message: "Use concrete module paths under spec or explicitly allowed files",
            },
          ],
        },
      ],

      // ============ RULE 10: Nullish Coalescing & Optional Chain ============
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {
          ignoreConditionalTests: false,
          ignoreTernaryTests: false,
          ignoreMixedLogicalExpressions: false,
        },
      ],
      "@typescript-eslint/prefer-optional-chain": "error",

      // ============ RULE 11: Enforce Validation Module Structure ============
      "custom/enforce-validation-module-structure": "error",

      // ============ RULE 12: Stream Frame Factory Usage ============
      "custom/stream-frame-factory-usage": "error",

      // ============ RULE 13: Consistent Error Handling Pattern ============
      "custom/consistent-error-handling-pattern": "error",

      // ============ RULE 14: Enforce Helper Usage ============
      "custom/enforce-helper-usage": "error",

      // ============ RULE 15: Spec Pack JSON Validation ============
      "custom/spec-pack-json-validation": "error",

      // ============ RULE 16: No Hardcoded AI Models ============
      "custom/no-hardcoded-ai-models": "error",

      // ============ RULE 17: No Swallowed Errors ============
      "custom/no-swallowed-errors": "error",

      // ============ RULE 18: Filename Convention - Kebab Case ============
      "unicorn/filename-case": [
        "error", // Enforced: All files must be kebab-case
        {
          case: "kebabCase",
        },
      ],

      // ============ RULE 19: No VoidUnused Helper ============
      "custom/no-void-unused-helper": "error",

      // Additional helpful rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: false,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "promise/prefer-await-to-then": "error",
      "unicorn/no-array-reduce": "error",
      "unicorn/no-array-for-each": "error",

      // ============ ADDITIONAL STRICT RULES ============
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/strict-boolean-expressions": "warn",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "no-case-declarations": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-for-of": "error",

      // ============ COMPLEXITY RULES ============
      complexity: ["error", 15],
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },
  {
    files: [
      "**/types.ts",
      "**/spec/types.ts",
      "**/spec/registry.ts",
      "**/spec/selfReview.ts",
      "**/spec/validate.ts",
      "**/spec/helpers/**/*.ts",
      "**/spec/test-utils/**/*.ts",
    ],
    rules: {
      "custom/consistent-error-handling-pattern": "off",
    },
  },
  {
    files: ["**/spec/items/**/*.ts"],
    rules: {
      // Validator modules must implement async interface for consistency,
      // even if individual functions don't use await
      "@typescript-eslint/require-await": "off",
    },
  },
  {
    files: ["**/components/ui/**/*.tsx", "**/components/ui/**/*.ts"],
    rules: {
      "no-magic-numbers": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/tests/**/*.ts",
      "**/__tests__/**/*.ts",
      "**/test-utils/**/*.ts",
      "**/agents/*.test.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-magic-numbers": "off",
      "custom/consistent-error-handling-pattern": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
    },
  },
  {
    files: ["**/page.tsx", "**/layout.tsx", "**/route.ts"],
    rules: {
      "custom/consistent-error-handling-pattern": "off",
      // Allow magic numbers in route handlers for HTTP status codes, timeouts, etc.
      "no-magic-numbers": [
        "error",
        {
          ignore: [
            0, 1, -1, 2, 3, 5, 10, 100, 200, 201, 400, 401, 403, 404, 500, 1000,
            2000, 3000, 5000, 8000, 10000,
          ],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
    },
  },
  {
    files: ["**/hooks/**", "**/components/**"],
    rules: {
      "custom/consistent-error-handling-pattern": "off",
      // Stricter rules for components but allow UI-specific numeric values
      "no-magic-numbers": [
        "error",
        {
          ignore: [
            0, 1, -1, 2, 4, 8, 10, 12, 16, 20, 24, 32, 48, 64, 100, 200, 300,
            400, 500, 1000, 1200, 1400, 1800,
          ],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
    },
  },
  {
    files: ["benchmarks/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "no-magic-numbers": "off",
      "promise/prefer-await-to-then": "off",
    },
  },
  {
    // Temporary override for refactoring - convert unsafe operations to warnings
    files: [
      "**/forms/**/*.tsx", 
      "**/lib/workflow/**/*.ts", 
      "**/components/workflow/**/*.tsx"
    ],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
    },
  },
  {
    files: ["**/workflow/**/*.ts", "**/workflow/**/*.tsx"],
    rules: {
      "custom/consistent-error-handling-pattern": "off",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "no-magic-numbers": [
        "error",
        {
          ignore: [
            0, 1, -1, 2, 4, 8, 10, 12, 16, 20, 24, 32, 48, 64, 100, 200, 300,
            400, 500, 1000, 1200, 1400, 1800,
          ],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "custom/consistent-error-handling-pattern": "off",
      "no-magic-numbers": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "eslint-rules/**",
      "scripts/**",
    ],
  },
];

export default eslintConfig;
