import { google } from "@ai-sdk/google";

export function geminiModel() {
  return google("gemini-1.5-pro");
}
