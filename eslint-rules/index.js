// Single plugin file that exports all custom rules
module.exports = {
  rules: {
    "enforce-validation-module-structure": require("./enforce-validation-module-structure"),
    "stream-frame-factory-usage": require("./stream-frame-factory-usage"),
    "consistent-error-handling-pattern": require("./consistent-error-handling-pattern"),
    "enforce-helper-usage": require("./enforce-helper-usage"),
    "spec-pack-json-validation": require("./spec-pack-json-validation"),
  },
};
