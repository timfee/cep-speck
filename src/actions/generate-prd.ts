"use server";

import { generatePRDContent, type AIConfig } from "@/lib/ai";

export async function generatePRDContentAction(
  prompt: string,
  config: AIConfig = {}
) {
  // Call the server function without progress callback
  return await generatePRDContent(prompt, config);
}