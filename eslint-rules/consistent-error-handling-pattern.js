module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce consistent error handling patterns by context",
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const fileName = context.getFilename();

    // Determine the context based on file location
    function getFileContext(fileName) {
      if (
        fileName.includes("/spec/items/") ||
        fileName.includes("/spec/validate") ||
        fileName.includes("/spec/healing/")
      ) {
        return "validation";
      }
      if (fileName.includes("/spec/streaming") || fileName.includes("/api/")) {
        return "streaming";
      }
      if (
        fileName.includes("/components/") ||
        fileName.includes("/hooks/") ||
        fileName.includes("page.tsx")
      ) {
        return "component";
      }
      return "unknown";
    }

    return {
      NewExpression(node) {
        if (node.callee.name === "Error") {
          const fileContext = getFileContext(fileName);

          if (fileContext === "validation") {
            context.report({
              node,
              message:
                "Use Issue interface for validation errors, not Error class",
            });
          } else if (fileContext === "streaming") {
            context.report({
              node,
              message: "Use StreamingError class for streaming context errors",
            });
          }
        }
      },

      ThrowStatement(node) {
        const fileContext = getFileContext(fileName);

        if (fileContext === "validation") {
          context.report({
            node,
            message:
              "Validation modules should return Issue[] from validate(), not throw errors",
          });
        }

        if (
          fileContext === "streaming" &&
          node.argument &&
          node.argument.type === "NewExpression" &&
          node.argument.callee.name === "Error"
        ) {
          context.report({
            node,
            message:
              "Throw StreamingError instances in streaming context, not generic Error",
          });
        }
      },

      Identifier(node) {
        if (
          node.name === "Issue" ||
          node.name === "ErrorDetails" ||
          node.name === "StreamingError"
        ) {
          const fileContext = getFileContext(fileName);

          if (node.name === "Issue" && fileContext !== "validation") {
            context.report({
              node,
              message: "Issue type should only be used in validation context",
            });
          }

          if (node.name === "StreamingError" && fileContext !== "streaming") {
            context.report({
              node,
              message:
                "StreamingError should only be used in streaming/API context",
            });
          }

          if (node.name === "ErrorDetails" && fileContext !== "component") {
            context.report({
              node,
              message:
                "ErrorDetails should only be used in component/UI context",
            });
          }
        }
      },

      // Check for proper error code usage
      ObjectExpression(node) {
        const hasCode = node.properties.some(
          (p) => p.key && p.key.name === "code"
        );
        const hasMessage = node.properties.some(
          (p) => p.key && p.key.name === "message"
        );
        const hasRecoverable = node.properties.some(
          (p) => p.key && p.key.name === "recoverable"
        );

        if (hasMessage && hasCode) {
          const fileContext = getFileContext(fileName);

          if (fileContext === "streaming" && !hasRecoverable) {
            context.report({
              node,
              message: "Streaming errors must include 'recoverable' property",
            });
          }
        }
      },
    };
  },
};
