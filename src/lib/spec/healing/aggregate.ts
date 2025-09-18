import { invokeItemHeal } from "../registry";
import type { Issue, SpecPack } from "../types";

export function aggregateHealing(draftIssues: Issue[], pack: SpecPack): string {
  if (!draftIssues.length) return "";
  const key = (i: Issue) => `${i.itemId}::${i.message}`;
  const map = new Map<string, Issue>();
  for (const i of draftIssues) {
    const k = key(i);
    if (!map.has(k)) map.set(k, i);
  }
  const deduped = Array.from(map.values());

  const byItem = new Map<string, Issue[]>();
  for (const i of deduped) {
    const arr = byItem.get(i.itemId) ?? [];
    arr.push(i);
    byItem.set(i.itemId, arr);
  }

  const defsById = new Map(pack.items.map((d) => [d.id, d]));
  const order = pack.healPolicy.order;
  const sortedItemIds = Array.from(byItem.keys()).sort((a, b) => {
    const da = defsById.get(a)!;
    const db = defsById.get(b)!;
    if (order === "by-severity-then-priority") {
      const sa = byItem.get(a)!.some((i) => i.severity === "error") ? 1 : 0;
      const sb = byItem.get(b)!.some((i) => i.severity === "error") ? 1 : 0;
      if (sa !== sb) return sb - sa;
    }
    return (db.priority ?? 0) - (da.priority ?? 0);
  });

  const chunks: string[] = [];
  for (const id of sortedItemIds) {
    const def = defsById.get(id)!;
    const issues = byItem.get(id)!;
  const msg = invokeItemHeal(issues, def, pack);
    if (msg) chunks.push(`${id}: ${msg}`);
  }

  const header = `Revise the latest draft to satisfy the following constraints without resetting compliant content:`;
  let body = chunks.map((c) => `- ${c}`).join("\n");
  const labelGuard = pack.composition?.labelPattern
    ? `Maintain the header pattern "${pack.composition.labelPattern}".`
    : "";
  const footer = `${labelGuard} Perform minimal edits to satisfy constraints.`;

  let content = `${header}\n${body}\n${footer}`;
  const max = pack.healPolicy.maxChars ?? 1800;
  if (content.length > max) {
    while (content.length > max && chunks.length > 1) {
      chunks.pop();
      body = chunks.map((c) => `- ${c}`).join("\n");
      content = `${header}\n${body}\n${footer}`;
    }
    if (content.length > max) {
      content =
        content.slice(0, max - 80) +
        "\n- Remaining items will be fixed in the next iteration.";
    }
  }
  return content;
}
