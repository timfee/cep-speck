"use server";

import { generateContentOutline, type AIConfig } from "@/lib/ai";

export async function generateContentOutlineAction(
  prompt: string,
  config: AIConfig = {}
) {
  // Call the server function without progress callback
  return await generateContentOutline(prompt, config);
}