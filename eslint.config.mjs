import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import unicorn from "eslint-plugin-unicorn";
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
      "import": importPlugin,
      "promise": promisePlugin,
      "unicorn": unicorn,
      "custom": customRules,
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
      "@typescript-eslint/no-explicit-any": ["error", {
        fixToUnknown: true,
        ignoreRestArgs: false,
      }],

      // ============ RULE 3: Import Order ============
      "import/order": ["error", {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "type",
        ],
        pathGroups: [
          {
            pattern: "@/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@/lib/spec/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@/lib/spec/items/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "@/lib/spec/helpers/**",
            group: "internal",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["type"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      }],

      // ============ RULE 4: No Floating Promises ============
      "@typescript-eslint/no-floating-promises": ["error", {
        ignoreVoid: false,
        ignoreIIFE: false,
        checkThenables: true,
      }],

      // ============ RULE 5: React Hooks Exhaustive Deps ============
      "react-hooks/exhaustive-deps": ["error", {
        additionalHooks: "(useSpecValidation|useCallback|useMemo)",
        enableDangerousAutofixThisMayCauseInfiniteLoops: false,
      }],

      // ============ RULE 6: Consistent Type Imports ============
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: "type-imports",
        fixStyle: "separate-type-imports",
        disallowTypeAnnotations: true,
      }],

      // ============ RULE 7: No Magic Numbers & Prefer Const ============
      "no-magic-numbers": ["error", {
        ignore: [0, 1, -1, 2, 100, 1000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false,
      }],
      "prefer-const": ["error", {
        destructuring: "all",
        ignoreReadBeforeAssign: false,
      }],

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
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["*/items/*", "!*/items", "!*/items/index"],
            message: "Import from the items barrel file (index.ts) instead of individual files",
          },
          {
            group: ["*/helpers/*", "!*/helpers", "!*/helpers/index"],
            message: "Import from the helpers barrel file (index.ts) instead of individual files",
          },
          {
            group: ["*/spec/*/*", "!*/spec/*/index", "!*/spec/types", "!*/spec/registry", "!*/spec/streaming"],
            message: "Use module barrel exports or explicitly allowed files",
          },
        ],
      }],

      // ============ RULE 10: Nullish Coalescing & Optional Chain ============
      "@typescript-eslint/prefer-nullish-coalescing": ["error", {
        ignoreConditionalTests: false,
        ignoreTernaryTests: false,
        ignoreMixedLogicalExpressions: false,
      }],
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

      // Additional helpful rules
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-unnecessary-condition": ["error", {
        allowConstantLoopConditions: false,
      }],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": ["error", {
        checksVoidReturn: {
          attributes: false,
        },
      }],
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
    },
  },
  {
    files: ["**/types.ts", "**/spec/types.ts", "**/spec/registry.ts", "**/spec/selfReview.ts", "**/spec/validate.ts", "**/spec/helpers/**/*.ts", "**/spec/__tests__/**/*.ts"],
    rules: {
      "custom/consistent-error-handling-pattern": "off",
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
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/tests/**/*.ts", "**/__tests__/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-magic-numbers": "off",
      "custom/consistent-error-handling-pattern": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
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
      "no-magic-numbers": ["error", {
        ignore: [0, 1, -1, 2, 3, 5, 10, 100, 200, 201, 400, 401, 403, 404, 500, 1000, 2000, 3000, 5000, 8000, 10000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false,
      }],
    },
  },
  {
    files: ["**/hooks/**", "**/components/**"],
    rules: {
      "custom/consistent-error-handling-pattern": "off",
      // Stricter rules for components but allow UI-specific numeric values
      "no-magic-numbers": ["error", {
        ignore: [0, 1, -1, 2, 4, 8, 10, 12, 16, 20, 24, 32, 48, 64, 100, 200, 300, 400, 500, 1000, 1200, 1400, 1800],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false,
      }],
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
    ],
  },
];

export default eslintConfig;
