import { google } from "@ai-sdk/google";

import { AI_MODEL_PRIMARY } from "@/lib/config";

export function geminiModel() {
  return google(AI_MODEL_PRIMARY);
}
