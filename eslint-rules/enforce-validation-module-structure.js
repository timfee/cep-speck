module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce validation module structure for spec items",
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const fileName = context.getFilename();

        // Only check files in src/lib/spec/items/
        if (
          !fileName.includes("src/lib/spec/items/") ||
          fileName.endsWith("index.ts") ||
          fileName.includes("test")
        ) {
          return;
        }

        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();

        // Check for required exports
        const requiredPatterns = [
          {
            pattern: /export\s+const\s+itemId\s*=\s*["'][\w-]+["']/,
            name: "itemId",
          },
          { pattern: /export\s+type\s+Params\s*=/, name: "Params type" },
          { pattern: /function\s+toPrompt/, name: "toPrompt function" },
          { pattern: /function\s+validate/, name: "validate function" },
          { pattern: /function\s+heal/, name: "heal function" },
          {
            pattern: /export\s+const\s+itemModule\s*=/,
            name: "itemModule export",
          },
        ];

        requiredPatterns.forEach(({ pattern, name }) => {
          if (!pattern.test(text)) {
            context.report({
              node,
              message: `Validation module missing required export: ${name}`,
            });
          }
        });

        // Check function signatures
        const toPromptMatch = text.match(/function\s+toPrompt\s*\(([^)]*)\)/);
        if (
          toPromptMatch &&
          !toPromptMatch[1].includes("params") &&
          !toPromptMatch[1].includes("pack")
        ) {
          context.report({
            node,
            message:
              "toPrompt function must have signature: (params: Params, pack?: SpecPack) => string",
          });
        }

        // Check function signatures and async requirement
        const validateMatch = text.match(
          /(async\s+)?function\s+validate\s*\(([^)]*)\)/
        );
        if (validateMatch) {
          if (!validateMatch[1]) {
            context.report({
              node,
              message:
                "validate function must be async: async function validate(...) => Promise<Issue[]>",
            });
          }
          if (!validateMatch[2].includes("draft")) {
            context.report({
              node,
              message:
                "validate function must have signature: async (draft: string, params: Params, pack?: SpecPack) => Promise<Issue[]>",
            });
          }
        }

        const healMatch = text.match(
          /(async\s+)?function\s+heal\s*\(([^)]*)\)/
        );
        if (healMatch) {
          if (!healMatch[1]) {
            context.report({
              node,
              message:
                "heal function must be async: async function heal(...) => Promise<string | null>",
            });
          }
          if (!healMatch[2].includes("issues")) {
            context.report({
              node,
              message:
                "heal function must have signature: async (issues: Issue[], params?: Params, pack?: SpecPack) => Promise<string | null>",
            });
          }
        }

        // Check itemModule structure
        if (text.includes("export const itemModule")) {
          const moduleMatch = text.match(
            /export\s+const\s+itemModule\s*=\s*\{([^}]+)\}/
          );
          if (moduleMatch) {
            const moduleContent = moduleMatch[1];
            const requiredProps = ["itemId", "toPrompt", "validate", "heal"];
            requiredProps.forEach((prop) => {
              if (!moduleContent.includes(prop)) {
                context.report({
                  node,
                  message: `itemModule must include property: ${prop}`,
                });
              }
            });
          }
        }
      },
    };
  },
};
