// Central registration of all validation modules

import { registerItem, createValidationModule } from '../registry';

// Import validation modules
import { itemModule as wordBudget } from './wordBudget';
import { itemModule as bannedText } from './bannedText';
import { itemModule as competitorResearch } from './competitorResearch';
import { itemModule as labelPattern } from './labelPattern';
import { itemModule as metricsRequired } from './metricsRequired';
import { itemModule as placeholderQuality } from './placeholderQuality';
import { itemModule as sectionCount } from './sectionCount';
import { itemModule as skuDifferentiation } from './skuDifferentiation';
import { itemModule as technicalFeasibility } from './technicalFeasibility';

// Register all validation modules
export function registerAllItems(): void {
  registerItem(createValidationModule(wordBudget));
  registerItem(createValidationModule(bannedText));
  registerItem(createValidationModule(competitorResearch));
  registerItem(createValidationModule(labelPattern));
  registerItem(createValidationModule(metricsRequired));
  registerItem(createValidationModule(placeholderQuality));
  registerItem(createValidationModule(sectionCount));
  registerItem(createValidationModule(skuDifferentiation));
  registerItem(createValidationModule(technicalFeasibility));
}

// Auto-register on module load
registerAllItems();

// Re-export for convenience
export { 
  wordBudget, 
  bannedText, 
  competitorResearch, 
  labelPattern, 
  metricsRequired, 
  placeholderQuality, 
  sectionCount, 
  skuDifferentiation, 
  technicalFeasibility 
};