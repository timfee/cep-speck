import { readFile } from "fs/promises";
import { join } from "path";

const GUIDE_CACHE = new Map<string, string>();

async function loadGuideFile(name: string): Promise<string> {
  const cached = GUIDE_CACHE.get(name);
  if (typeof cached === "string") {
    return cached;
  }

  const filePath = join(process.cwd(), "guides", name);
  const content = await readFile(filePath, "utf-8");
  GUIDE_CACHE.set(name, content);
  return content;
}

const PROMPT_REGEX: Record<string, RegExp> = {
  outliner: /Agent 1 \(Outliner\)[\s\S]*?- System Prompt: "([\s\S]*?)"/,
  drafter: /Agent 2 \(Drafter\)[\s\S]*?System Prompt: "([\s\S]*?)"/,
  evaluator: /Agent 3 \(Evaluator\)[\s\S]*?- System Prompt: "([\s\S]*?)"/,
  refiner: /Agent 4 \(Refiner\)[\s\S]*?- System Prompt: "([\s\S]*?)"/,
};

function extractPrompt(
  content: string,
  agent: keyof typeof PROMPT_REGEX
): string {
  const regex = PROMPT_REGEX[agent];
  const match = content.match(regex);
  if (!match) {
    throw new Error(
      `Failed to extract ${agent} system prompt from generation_flow_guide.md`
    );
  }

  const captured = match[1];
  if (typeof captured !== "string") {
    throw new Error(`Regex capture missing for ${agent}`);
  }
  const prompt = captured.trim();
  if (!prompt) {
    throw new Error(`Empty system prompt extracted for ${agent}`);
  }
  return prompt;
}

export async function loadOutlinerPrompt(): Promise<string> {
  const content = await loadGuideFile("generation_flow_guide.md");
  return extractPrompt(content, "outliner");
}

export async function loadDrafterPrompt(): Promise<string> {
  const content = await loadGuideFile("generation_flow_guide.md");
  return extractPrompt(content, "drafter");
}

export async function loadEvaluatorPrompt(): Promise<string> {
  const content = await loadGuideFile("generation_flow_guide.md");
  return extractPrompt(content, "evaluator");
}

export async function loadRefinerPrompt(): Promise<string> {
  const content = await loadGuideFile("generation_flow_guide.md");
  return extractPrompt(content, "refiner");
}

export async function loadStyleGuide(): Promise<string> {
  return loadGuideFile("style_and_principles_guide.md");
}

export async function loadFunctionalRequirements(): Promise<string> {
  return loadGuideFile("functional_requirements.md");
}
