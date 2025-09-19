import { google } from "@ai-sdk/google";

export function geminiModel() {
  return google("gemini-2.5-pro");
}
