/**
 * ESLint rule: no-hardcoded-ai-models
 * 
 * Principle: Critical infrastructure config, like AI model names, must be centralized 
 * in `src/lib/config.ts` to prevent deployment bugs and allow for easy swapping.
 * 
 * Anti-Pattern: A hardcoded string literal starting with `gemini-` or `gpt-` passed 
 * to `google()` or as a `model:` property in an AI SDK call.
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded AI model names",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      hardcodedModel: "Do not hardcode AI model names. Import `AI_MODEL_PRIMARY` or `AI_MODEL_FALLBACK` from `src/lib/config.ts` instead of using '{{modelName}}'.",
    },
  },

  create(context) {
    function isAIModelString(value) {
      return typeof value === "string" && 
        (value.startsWith("gemini-") || value.startsWith("gpt-"));
    }

    function checkCallExpression(node) {
      // Check for google("gemini-...") calls
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "google" &&
        node.arguments.length > 0 &&
        node.arguments[0].type === "Literal" &&
        isAIModelString(node.arguments[0].value)
      ) {
        context.report({
          node: node.arguments[0],
          messageId: "hardcodedModel",
          data: {
            modelName: node.arguments[0].value,
          },
        });
      }
    }

    function checkProperty(node) {
      // Check for model: "gemini-..." in object properties
      if (
        node.key &&
        ((node.key.type === "Identifier" && node.key.name === "model") ||
         (node.key.type === "Literal" && node.key.value === "model")) &&
        node.value &&
        node.value.type === "Literal" &&
        isAIModelString(node.value.value)
      ) {
        context.report({
          node: node.value,
          messageId: "hardcodedModel",
          data: {
            modelName: node.value.value,
          },
        });
      }
    }

    return {
      CallExpression: checkCallExpression,
      Property: checkProperty,
    };
  },
};