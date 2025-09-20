import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Load prompt content from guides/prompts directory
 */
export async function loadPrompt(promptName: string): Promise<string> {
  try {
    const promptPath = join(
      process.cwd(),
      "guides",
      "prompts",
      `${promptName}.md`
    );
    const content = await readFile(promptPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Failed to load prompt ${promptName}:`, error);
    throw new Error(`Prompt ${promptName} not found`);
  }
}

/**
 * Load style and principles guide for evaluator
 */
export async function loadStyleGuide(): Promise<string> {
  try {
    const guidePath = join(
      process.cwd(),
      "guides",
      "style_and_principles_guide.md"
    );
    const content = await readFile(guidePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Failed to load style guide:", error);
    throw new Error("Style guide not found");
  }
}
