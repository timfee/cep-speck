import type { Issue, SpecItemDef } from "../types";

/**
 * Deduplicates issues by creating a unique key for each issue
 */
export function deduplicateIssues(issues: Issue[]): Issue[] {
  if (!issues.length) return [];

  const key = (i: Issue) => `${i.itemId}::${i.message}`;
  const map = new Map<string, Issue>();

  for (const i of issues) {
    const k = key(i);
    if (!map.has(k)) {
      map.set(k, i);
    }
  }

  return Array.from(map.values());
}

/**
 * Groups issues by their item ID
 */
export function groupIssuesByItem(issues: Issue[]): Map<string, Issue[]> {
  const byItem = new Map<string, Issue[]>();

  for (const issue of issues) {
    const arr = byItem.get(issue.itemId) ?? [];
    arr.push(issue);
    byItem.set(issue.itemId, arr);
  }

  return byItem;
}

/**
 * Sorts item IDs based on healing policy and severity
 */
export function sortItemIdsByPriority(
  itemIds: string[],
  issuesByItem: Map<string, Issue[]>,
  defsById: Map<string, SpecItemDef>,
  healOrder: string
): string[] {
  return itemIds.sort((a, b) => {
    const da = defsById.get(a);
    const db = defsById.get(b);
    if (!da || !db) return 0;

    if (healOrder === "by-severity-then-priority") {
      const issuesA = issuesByItem.get(a);
      const issuesB = issuesByItem.get(b);
      if (!issuesA || !issuesB) return 0;

      const hasErrorA = issuesA.some((i) => i.severity === "error");
      const hasErrorB = issuesB.some((i) => i.severity === "error");

      if (hasErrorA !== hasErrorB) {
        return hasErrorB ? 1 : -1; // Errors first
      }
    }

    return db.priority - da.priority;
  });
}
