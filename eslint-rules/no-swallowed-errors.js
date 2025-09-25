/**
 * ESLint rule: no-swallowed-errors
 *
 * Principle: Errors must never be silently swallowed. At minimum, they should be logged
 * for debugging purposes, even if they're expected/recoverable errors.
 *
 * Anti-Pattern: A `CatchClause` node where the `body` is empty (`catch {}`) or where
 * the `param` (the `err` variable) is not referenced inside the body.
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow swallowed errors in catch blocks",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      emptyCatch:
        "Empty catch block swallows errors. At minimum, log the error: `console.warn(message, err)`.",
      unusedError:
        "Error parameter '{{errorParam}}' is not used in catch block. Log the error for debugging: `console.warn(message, {{errorParam}})`.",
    },
  },

  create(context) {
    function checkCatchClause(node) {
      // Check for empty catch block
      if (node.body.body.length === 0) {
        context.report({
          node: node,
          messageId: "emptyCatch",
        });
        return;
      }

      // Check if error parameter is unused
      if (node.param && node.param.type === "Identifier") {
        const sourceCode = context.getSourceCode();
        const errorParamName = node.param.name;

        // Simple check: search for the parameter name in the catch block text
        const catchBlockText = sourceCode.getText(node.body);
        const paramUsed = catchBlockText.includes(errorParamName);

        if (!paramUsed) {
          context.report({
            node: node.param,
            messageId: "unusedError",
            data: {
              errorParam: errorParamName,
            },
          });
        }
      }
    }

    return {
      CatchClause: checkCatchClause,
    };
  },
};
