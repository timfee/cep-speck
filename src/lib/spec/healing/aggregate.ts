import { WORD_BUDGET } from "@/lib/constants";

import { buildHealingMessage } from "../helpers";
import { invokeItemHeal } from "../registry";
import type { Issue, SpecItemDef, SpecPack } from "../types";

import {
  deduplicateIssues,
  groupIssuesByItem,
  sortItemIdsByPriority,
} from "./helpers";

export async function aggregateHealing(
  draftIssues: Issue[],
  pack: SpecPack
): Promise<string> {
  if (!draftIssues.length) return "";

  // Step 1: Deduplicate issues
  const deduped = deduplicateIssues(draftIssues);

  // Step 2: Group issues by item ID
  const byItem = groupIssuesByItem(deduped);

  // Step 3: Sort item IDs by priority and severity
  const defsById = new Map(pack.items.map((d) => [d.id, d]));
  const sortedItemIds = sortItemIdsByPriority(
    Array.from(byItem.keys()),
    byItem,
    defsById,
    pack.healPolicy.order
  );

  // Step 4: Generate healing messages for each item
  const chunks = await generateHealingChunks(
    sortedItemIds,
    byItem,
    defsById,
    pack
  );

  // Step 5: Build final message with constraints
  const maxChars = pack.healPolicy.maxChars ?? WORD_BUDGET.TARGET_BUDGET;
  return buildHealingMessage(chunks, pack, maxChars);
}

/**
 * Generates healing message chunks for each item
 */
async function generateHealingChunks(
  sortedItemIds: string[],
  byItem: Map<string, Issue[]>,
  defsById: Map<string, SpecItemDef>,
  pack: SpecPack
): Promise<string[]> {
  const chunks: string[] = [];

  for (const id of sortedItemIds) {
    const def = defsById.get(id);
    const issues = byItem.get(id);

    if (!def || !issues) continue;

    const msg = await invokeItemHeal(issues, def, pack);
    if ((msg ?? "").length > 0) {
      chunks.push(`${id}: ${msg}`);
    }
  }

  return chunks;
}
