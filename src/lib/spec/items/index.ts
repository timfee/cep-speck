// Central registration of all validation modules

import { registerItem, createValidationModule } from '../registry';

// Import validation modules
import { itemModule as wordBudget } from './wordBudget';
import { itemModule as bannedText } from './bannedText';

// Register all validation modules
export function registerAllItems(): void {
  registerItem(createValidationModule(wordBudget));
  registerItem(createValidationModule(bannedText));
}

// Auto-register on module load
registerAllItems();

// Re-export for convenience
export { wordBudget, bannedText };