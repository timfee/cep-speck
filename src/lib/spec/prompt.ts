import { SpecPack } from './types';
import { getItem } from './registry';

const additionalPromptRules = `\nCRITICAL VALIDATION REQUIREMENTS:\n\n1. CONSISTENCY ACROSS SECTIONS:\n   - Every metric mentioned in TL;DR must match EXACTLY with Success Metrics section\n   - Every persona in key_personas must appear in People Problems, Goals, and CUJs\n   - Features must trace back to specific People Problems\n   - No orphaned requirements or metrics\n\n2. TECHNICAL REALISM:\n   - Adoption rates must follow realistic curves (typically 10-20% in month 1, 40-60% by month 3)\n   - Never claim 100% of anything involving human behavior\n   - Implementation timelines must account for engineering, testing, and rollout phases\n   - Performance improvements must cite baseline measurements\n\n3. PLACEHOLDER SPECIFICITY:\n   - Every placeholder must specify: what data, units, timeframe, and source\n   - Bad: [PM_INPUT_NEEDED: metric]\n   - Good: [PM_INPUT_NEEDED: baseline median time to first security policy deployment in minutes from CBCM telemetry]\n\n4. SKU DIFFERENTIATION:\n   - Every feature must explicitly state: Core, Premium, or Both\n   - Premium features must include why they're premium (complexity, cost, advanced use case)\n   - Core features in Premium PRDs must explain the upgrade path\n\n5. QUANTIFICATION REQUIREMENTS:\n   - Replace "reduce significantly" with "reduce by X%" with baseline\n   - Replace "many admins" with "X% of admins" or "N admins in sample of M"\n   - Replace "faster" with "Xms faster" or "X% reduction in time"\n   - Never use "up to" without also providing typical/median values\n\n6. DEPENDENCY VALIDATION:\n   - Every dependency must be bidirectional (if A depends on B, B's timeline must support A)\n   - External dependencies need fallback plans\n   - Critical path items must be explicitly marked\n\n7. TESTABILITY REQUIREMENTS:\n   - Each functional requirement must include acceptance criteria\n   - Metrics must specify data collection method\n   - Success criteria must be binary (pass/fail) determinable\n`;

export function buildSystemPrompt(pack: SpecPack): string {
  const lines: string[] = [];
  for (const def of pack.items) {
    const mod = getItem(def.id);
    const p = mod.toPrompt(def.params as unknown, pack);
    if (p) lines.push(`- [${def.kind}] ${p}`);
  }
  if (pack.composition?.labelPattern) {
    lines.push(`- [structure] Header label pattern: ${pack.composition.labelPattern}`);
  }
  if (pack.composition?.headerRegex) {
    lines.push(`- [structure] Header detection regex: ${pack.composition.headerRegex}`);
  }
  return `You are generating a PRD for Chrome Enterprise Premium (CEP). Write as an L7+ Google PM: precise, factual, executive-level thinking. Voice: direct, concise, technically sophisticated. No marketing language, sensationalist claims, cutesy headings, or empty business speak. Use web search capabilities for competitor research with current data and citations. Do not invent facts; use placeholders when uncertain. Avoid quality theater metrics like NPS - focus on operational metrics. When using metrics to justify decisions, consider stating the underlying heuristic directly rather than obscuring intent through gameable metrics. Follow all constraints:\n${lines.join('\n')}${additionalPromptRules}`;
}

export function buildUserPrompt(specText: string): string {
  return `Inputs/spec:\n${specText}`;
}
