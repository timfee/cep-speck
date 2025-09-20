/**
 * Custom ESLint rule to enforce kebab-case for React component files
 */
module.exports = {
  name: "kebab-case-component-files",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce kebab-case naming for React component files",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          directories: {
            type: "array",
            items: { type: "string" },
            default: ["src/components"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      kebabCase:
        'React component file "{{ filename }}" should use kebab-case naming (e.g., "{{ suggestion }}")',
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const directories = options.directories || ["src/components"];

    const filename = context.getFilename();

    // Check if file is in a target directory
    const isInTargetDirectory = directories.some(
      (dir) =>
        filename.includes(dir) &&
        (filename.endsWith(".tsx") || filename.endsWith(".jsx"))
    );

    if (!isInTargetDirectory) {
      return {};
    }

    const basename = filename.split("/").pop();
    const nameWithoutExt = basename.replace(/\.(tsx|jsx)$/, "");

    // Check if filename is already kebab-case
    const isKebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(nameWithoutExt);

    if (!isKebabCase) {
      // Convert PascalCase to kebab-case
      const suggestion = nameWithoutExt
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "");

      return {
        Program(node) {
          context.report({
            node,
            messageId: "kebabCase",
            data: {
              filename: basename,
              suggestion: `${suggestion}.${basename.split(".").pop()}`,
            },
          });
        },
      };
    }

    return {};
  },
};
