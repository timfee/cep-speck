import type { ValidationModule } from './types';

// Registry for validation modules
const validationRegistry = new Map<string, ValidationModule>();

export function registerItem(module: ValidationModule): void {
  if (validationRegistry.has(module.itemId)) {
    throw new Error(`Validation module with ID "${module.itemId}" is already registered`);
  }
  validationRegistry.set(module.itemId, module);
}

export function getItem(itemId: string): ValidationModule | undefined {
  return validationRegistry.get(itemId);
}

export function getAllItems(): ValidationModule[] {
  return Array.from(validationRegistry.values());
}

export function getItemIds(): string[] {
  return Array.from(validationRegistry.keys());
}

export function clearRegistry(): void {
  validationRegistry.clear();
}

// Helper to create validation modules with consistent structure
export function createValidationModule(config: {
  itemId: string;
  toPrompt: ValidationModule['toPrompt'];
  validate: ValidationModule['validate'];
}): ValidationModule {
  return {
    itemId: config.itemId,
    toPrompt: config.toPrompt,
    validate: config.validate
  };
}