import type { SpecPack, Issue, SpecItemDef } from './types';

export type ItemModule = {
  itemId: string;
  toPrompt: (params: unknown, pack?: SpecPack) => string;
  validate: (draft: string, params: unknown, pack?: SpecPack) => Issue[];
  heal: (issues: Issue[], params?: unknown, pack?: SpecPack) => string | null;
};

const modules: Record<string, ItemModule> = {};

export function registerItem(mod: ItemModule): void {
  modules[mod.itemId] = mod;
}

export function getItem(id: string): ItemModule {
  const mod = modules[id];
  if (!mod) throw new Error(`Unknown itemId: ${id}`);
  return mod;
}

export function getRegisteredItemIds(): string[] {
  return Object.keys(modules);
}

export function invokeItemToPrompt(id: string, def: SpecItemDef, pack?: SpecPack): string {
  const mod = getItem(id);
  return mod.toPrompt(def.params, pack);
}

export function invokeItemValidate(id: string, draft: string, def: SpecItemDef, pack?: SpecPack): Issue[] {
  const mod = getItem(id);
  return mod.validate(draft, def.params, pack);
}

export function invokeItemHeal(id: string, issues: Issue[], def: SpecItemDef, pack?: SpecPack): string | null {
  const mod = getItem(id);
  return mod.heal(issues, def.params, pack);
}
