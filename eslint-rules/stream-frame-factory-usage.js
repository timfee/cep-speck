module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce usage of factory functions for StreamFrame creation",
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    const factoryFunctions = new Set([
      "createStreamFrame",
      "createPhaseFrame",
      "createGenerationFrame",
      "createValidationFrame",
      "createErrorFrame",
      "createResultFrame",
      "createHealingFrame",
      "encodeStreamFrame",
    ]);

    return {
      ObjectExpression(node) {
        const parent = node.parent;
        
        // Check if this looks like a StreamFrame object
        const hasTypeProperty = node.properties.some(
          prop => prop.key && prop.key.name === "type" && 
          prop.value && prop.value.type === "Literal"
        );
        
        const hasDataProperty = node.properties.some(
          prop => prop.key && prop.key.name === "data"
        );
        
        if (hasTypeProperty && hasDataProperty) {
          // Check if it's being created directly or via a factory
          let isFactoryCall = false;
          let current = parent;
          
          while (current && current.type !== "Program") {
            if (current.type === "CallExpression" && 
                current.callee && 
                current.callee.name && 
                factoryFunctions.has(current.callee.name)) {
              isFactoryCall = true;
              break;
            }
            current = current.parent;
          }
          
          if (!isFactoryCall) {
            const typeProperty = node.properties.find(
              prop => prop.key && prop.key.name === "type"
            );
            const frameType = typeProperty?.value?.value;
            
            context.report({
              node,
              message: `Use factory function for StreamFrame creation. For type "${frameType}", use create${frameType.charAt(0).toUpperCase() + frameType.slice(1)}Frame()`,
              fix(fixer) {
                // Attempt to provide an auto-fix
                if (frameType === "phase") {
                  return fixer.replaceText(node, 
                    `createPhaseFrame(/* phase */, /* attempt */, /* message */)`
                  );
                }
                if (frameType === "error") {
                  return fixer.replaceText(node,
                    `createErrorFrame(/* message */, /* recoverable */, /* code */)`
                  );
                }
                return null;
              },
            });
          }
        }
      },
      
      // Also check for direct type assignment patterns
      AssignmentExpression(node) {
        if (node.right && 
            node.right.type === "ObjectExpression" &&
            node.left.type === "MemberExpression" &&
            node.left.property.name === "type") {
          
          const text = context.getSourceCode().getText(node);
          if (text.includes("StreamFrame") || text.includes("frame.type")) {
            context.report({
              node,
              message: "Do not mutate StreamFrame objects directly. Create new frames using factory functions.",
            });
          }
        }
      },
    };
  },
};