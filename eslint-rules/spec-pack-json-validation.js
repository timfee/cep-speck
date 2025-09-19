const fs = require("fs");
const path = require("path");

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Validate SpecPack JSON structure",
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const fileName = context.getFilename();

    // Only check JSON files in the packs directory
    if (!fileName.includes("/spec/packs/") || !fileName.endsWith(".json")) {
      return {};
    }

    return {
      Program(node) {
        try {
          const fileContent = fs.readFileSync(fileName, "utf8");
          const pack = JSON.parse(fileContent);

          // Validate required top-level fields
          const requiredFields = ["id", "items", "healPolicy"];
          requiredFields.forEach((field) => {
            if (!pack[field]) {
              context.report({
                node,
                message: `SpecPack missing required field: ${field}`,
              });
            }
          });

          // Validate healPolicy structure
          if (pack.healPolicy) {
            if (typeof pack.healPolicy.maxAttempts !== "number") {
              context.report({
                node,
                message: "healPolicy.maxAttempts must be a number",
              });
            }

            const validOrders = ["by-priority", "by-severity-then-priority"];
            if (!validOrders.includes(pack.healPolicy.order)) {
              context.report({
                node,
                message: `healPolicy.order must be one of: ${validOrders.join(", ")}`,
              });
            }
          }

          // Validate items array
          if (Array.isArray(pack.items)) {
            const seenIds = new Set();

            pack.items.forEach((item, index) => {
              // Check for duplicate IDs
              if (seenIds.has(item.id)) {
                context.report({
                  node,
                  message: `Duplicate item ID: ${item.id}`,
                });
              } else {
                seenIds.add(item.id);
              }

              // Validate required item fields
              const requiredItemFields = [
                "id",
                "kind",
                "priority",
                "severity",
                "params",
              ];
              requiredItemFields.forEach((field) => {
                if (item[field] === undefined) {
                  context.report({
                    node,
                    message: `Item ${index} missing required field: ${field}`,
                  });
                }
              });

              // Validate kind values
              const validKinds = ["structure", "style", "linter", "policy"];
              if (item.kind && !validKinds.includes(item.kind)) {
                context.report({
                  node,
                  message: `Item ${item.id} has invalid kind: ${item.kind}. Must be one of: ${validKinds.join(", ")}`,
                });
              }

              // Validate severity values
              const validSeverities = ["error", "warn"];
              if (item.severity && !validSeverities.includes(item.severity)) {
                context.report({
                  node,
                  message: `Item ${item.id} has invalid severity: ${item.severity}. Must be one of: ${validSeverities.join(", ")}`,
                });
              }

              // Validate priority is a number
              if (
                typeof item.priority !== "number" ||
                item.priority < 0 ||
                item.priority > 100
              ) {
                context.report({
                  node,
                  message: `Item ${item.id} has invalid priority: ${item.priority}. Must be a number between 0 and 100`,
                });
              }
            });

            // Check that all referenced item IDs exist
            // This would check globals.bannedText references, etc.
            if (pack.globals?.bannedText?.itemRefs) {
              pack.globals.bannedText.itemRefs.forEach((ref) => {
                if (!seenIds.has(ref)) {
                  context.report({
                    node,
                    message: `Referenced item ID does not exist: ${ref}`,
                  });
                }
              });
            }
          }

          // Validate composition if present
          if (pack.composition) {
            if (
              pack.composition.labelPattern &&
              typeof pack.composition.labelPattern !== "string"
            ) {
              context.report({
                node,
                message: "composition.labelPattern must be a string",
              });
            }

            if (pack.composition.headerRegex) {
              try {
                new RegExp(pack.composition.headerRegex);
              } catch {
                context.report({
                  node,
                  message: `Invalid regex in composition.headerRegex: ${pack.composition.headerRegex}`,
                });
              }
            }
          }
        } catch (error) {
          context.report({
            node,
            message: `Failed to parse SpecPack JSON: ${error.message}`,
          });
        }
      },
    };
  },
};
