import { SpecPack } from './types';
import { getItem } from './registry';

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
  return `You are generating a PRD. Follow all constraints:\n${lines.join('\n')}`;
}

export function buildUserPrompt(specText: string): string {
  return `Inputs/spec:\n${specText}`;
}
