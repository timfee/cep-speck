/**
 * ESLint rule: no-void-unused-helper
 * 
 * Principle: Use standard TypeScript/ESLint patterns for unused parameters rather than 
 * custom helper functions. The `_` prefix is the conventional way to mark intentionally 
 * unused parameters.
 * 
 * Anti-Pattern: Calls to `voidUnused()` helper function which is redundant when we can 
 * use the standard `_` prefix pattern.
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow voidUnused helper in favor of underscore prefix",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      voidUnusedCall: "Replace `voidUnused({{params}})` with underscore prefix on parameters: {{suggestion}}. Configure ESLint with `argsIgnorePattern: '^_'` instead.",
    },
  },

  create(context) {
    function checkCallExpression(node) {
      // Check for voidUnused() calls
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "voidUnused"
      ) {
        const params = node.arguments.map(arg => {
          if (arg.type === "Identifier") {
            return arg.name;
          }
          return context.getSourceCode().getText(arg);
        });
        
        const suggestion = params.map(p => `_${p}`).join(", ");
        
        context.report({
          node: node,
          messageId: "voidUnusedCall",
          data: {
            params: params.join(", "),
            suggestion: suggestion,
          },
        });
      }
    }

    return {
      CallExpression: checkCallExpression,
    };
  },
};