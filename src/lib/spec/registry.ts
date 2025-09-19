import type { Issue, SpecItemDef, SpecPack } from "./types";

// Generic, type-safe validator module definition. Modules with no params should use Params = void.
export interface ValidatorModule<Params = void> {
  readonly itemId: string;
  readonly toPrompt: (params: Params, pack?: SpecPack) => string;
  readonly validate: (
    draft: string,
    params: Params,
    pack?: SpecPack
  ) => Issue[];
  readonly heal: (
    issues: Issue[],
    params: Params,
    pack?: SpecPack
  ) => string | null;
}

export function createValidatorModule<P>(
  m: ValidatorModule<P>
): ValidatorModule<P> {
  return m;
}

// Internal registry map retains broad typing; individual module definitions remain strongly typed.
// We store modules erased to unknown to keep a single unsafely-typed boundary.
// Retrieval functions re-genericize via the caller's expected Params type.
const modules: Record<string, ValidatorModule<unknown>> = {};

export function registerItem<P>(mod: ValidatorModule<P>): void {
  modules[mod.itemId] = mod as ValidatorModule<unknown>;
}

export function getItem<P = unknown>(id: string): ValidatorModule<P> {
  const mod = modules[id] as ValidatorModule<P> | undefined;
  if (mod === undefined) throw new Error(`Unknown itemId: ${id}`);
  return mod;
}

export function getRegisteredItemIds(): string[] {
  return Object.keys(modules);
}

export function invokeItemToPrompt<P>(
  def: SpecItemDef<P>,
  pack: SpecPack
): string {
  const mod = getItem<P>(def.id);
  return mod.toPrompt(def.params, pack);
}

export function invokeItemValidate<P>(
  draft: string,
  def: SpecItemDef<P>,
  pack: SpecPack
): Issue[] {
  const mod = getItem<P>(def.id);
  return mod.validate(draft, def.params, pack);
}

export function invokeItemHeal<P>(
  issues: Issue[],
  def: SpecItemDef<P>,
  pack: SpecPack
): string | null {
  const mod = getItem<P>(def.id);
  return mod.heal(issues, def.params, pack);
}
