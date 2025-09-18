import type { SpecPack, Issue } from './types';

export type ItemModule<P = unknown> = {
  itemId: string;
  toPrompt: (params: P, pack: SpecPack) => string;
  validate: (draft: string, params: P, pack: SpecPack) => Issue[];
  heal: (issues: Issue[], params: P, pack: SpecPack) => string | null;
};

const modules: Record<string, ItemModule<unknown>> = {};

export function registerItem(mod: ItemModule<unknown>) {
  modules[mod.itemId] = mod;
}
export function getItem(id: string): ItemModule<unknown> {
  const mod = modules[id];
  if (!mod) throw new Error(`Unknown itemId: ${id}`);
  return mod;
}
export function getRegisteredItemIds(): string[] {
  return Object.keys(modules);
}
