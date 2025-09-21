// Single plugin file that exports all custom rules
module.exports = {
  rules: {
    "no-hardcoded-ai-models": require("./no-hardcoded-ai-models"),
    "no-swallowed-errors": require("./no-swallowed-errors"),
    "no-void-unused-helper": require("./no-void-unused-helper"),
  },
};
