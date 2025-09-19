module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce usage of centralized helper functions",
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    const helperPatterns = {
      extractSection:
        /function\s+extract\w*Section|const\s+extract\w*Section\s*=/,
      extractMetrics:
        /function\s+extract\w*Metrics|const\s+extract\w*Metrics\s*=/,
      extractBulletPoints:
        /function\s+extract\w*Bullet|const\s+extract\w*Bullet\s*=/,
      buildHealing: /function\s+build\w*Healing|const\s+build\w*Healing\s*=/,
      createWordBoundaryRegex:
        /function\s+create\w*Boundary|const\s+create\w*Boundary\s*=/,
      createFlexibleRegex:
        /function\s+create\w*Regex|const\s+create\w*Regex\s*=/,
      doesMetricReferenceFeature:
        /function\s+\w*MetricReference|const\s+\w*MetricReference\s*=/,
    };

    const helperImports = new Map();

    return {
      ImportDeclaration(node) {
        if (node.source.value.includes("/helpers")) {
          node.specifiers.forEach((spec) => {
            if (spec.imported) {
              helperImports.set(spec.imported.name, true);
            }
          });
        }
      },

      FunctionDeclaration(node) {
        const functionName = node.id?.name || "";
        const sourceCode = context.getSourceCode();
        const functionText = sourceCode.getText(node);
        const fileName = context.getFilename();

        // Skip if this is the helpers file itself
        if (fileName.includes("/helpers/")) {
          return;
        }

        // Check for duplicate helper implementations
        Object.entries(helperPatterns).forEach(([helperName, pattern]) => {
          if (pattern.test(functionText) && !helperImports.has(helperName)) {
            context.report({
              node,
              message: `Use imported ${helperName} from @/lib/spec/helpers instead of implementing locally`,
              fix(fixer) {
                // Add import if not present
                const importStatement = `import { ${helperName} } from "@/lib/spec/helpers";\n`;
                const firstImport = node.parent.body.find(
                  (n) => n.type === "ImportDeclaration"
                );
                if (firstImport) {
                  return fixer.insertTextBefore(firstImport, importStatement);
                }
                return null;
              },
            });
          }
        });
      },

      // Check for common extraction patterns that should use helpers
      CallExpression(node) {
        const callee = node.callee;
        const fileName = context.getFilename();

        // Skip helpers file
        if (fileName.includes("/helpers/")) {
          return;
        }

        // Check for regex operations that should use helpers
        if (callee.type === "MemberExpression") {
          const object = callee.object;
          const property = callee.property;

          // Pattern: draft.match(/regex/)
          if (
            property.name === "match" &&
            node.arguments[0]?.type === "Literal"
          ) {
            const regexPattern = node.arguments[0].value;

            if (
              regexPattern &&
              regexPattern.toString().includes("^#\\s+\\d+\\.")
            ) {
              context.report({
                node,
                message: "Use extractSection helper for section extraction",
              });
            }

            if (regexPattern && regexPattern.toString().includes("^[-*]\\s+")) {
              context.report({
                node,
                message:
                  "Use extractBulletPoints helper for bullet point extraction",
              });
            }
          }
        }
      },

      // Check for regex literal patterns
      Literal(node) {
        if (node.regex && typeof node.value === "object") {
          const pattern = node.regex.pattern;
          const fileName = context.getFilename();

          // Skip helpers file
          if (fileName.includes("/helpers/")) {
            return;
          }

          // Common patterns that should use helpers
          if (pattern.includes("\\b") && pattern.includes("\\b")) {
            context.report({
              node,
              message:
                "Use createWordBoundaryRegex helper for word boundary patterns",
            });
          }

          if (pattern.startsWith("(?i)")) {
            context.report({
              node,
              message:
                "Use createFlexibleRegex helper for case-insensitive patterns",
            });
          }
        }
      },
    };
  },
};
