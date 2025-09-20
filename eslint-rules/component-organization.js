/**
 * Custom ESLint rule to enforce proper component organization
 */
module.exports = {
  name: "component-organization",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce proper component organization (UI components in components/ui, specialized components elsewhere)",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
    messages: {
      uiComponentMisplaced:
        'UI component "{{ componentName }}" should be in components/ui directory',
      specializedComponentMisplaced:
        'Specialized component "{{ componentName }}" should not be in components/ui directory',
    },
  },
  create(context) {
    const filename = context.getFilename();

    if (
      !filename.includes("src/components") ||
      !filename.match(/\.(tsx|jsx)$/)
    ) {
      return {};
    }

    const isInUiDirectory = filename.includes("src/components/ui/");
    const basename = filename
      .split("/")
      .pop()
      .replace(/\.(tsx|jsx)$/, "");

    // List of standard UI component names (should be in components/ui)
    const standardUIComponents = [
      "button",
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio-group",
      "badge",
      "card",
      "tabs",
      "tooltip",
      "progress",
      "spinner",
      "status",
      "separator",
      "copy-button",
      "dialog",
      "modal",
      "dropdown",
      "menu",
      "table",
      "form",
      "label",
      "switch",
      "slider",
      "avatar",
      "alert",
    ];

    // List of specialized component patterns (should NOT be in components/ui)
    const specializedPatterns = [
      /.*-phase$/,
      /.*-wizard$/,
      /.*-editor$/,
      /.*-timeline$/,
      /.*-selector$/,
      /.*-dialog$/,
      /.*-display$/,
      /.*-terminal$/,
      /.*-status$/,
      /.*-view$/,
    ];

    const isStandardUI = standardUIComponents.includes(basename);
    const isSpecialized =
      specializedPatterns.some((pattern) => pattern.test(basename)) ||
      basename.includes("workflow") ||
      basename.includes("error");

    return {
      Program(node) {
        if (isStandardUI && !isInUiDirectory) {
          context.report({
            node,
            messageId: "uiComponentMisplaced",
            data: { componentName: basename },
          });
        }

        if (isSpecialized && isInUiDirectory) {
          context.report({
            node,
            messageId: "specializedComponentMisplaced",
            data: { componentName: basename },
          });
        }
      },
    };
  },
};
