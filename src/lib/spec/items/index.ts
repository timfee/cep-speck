import { createValidatorModule, registerItem } from "../registry";
// Import each module object
import { itemModule as bannedText } from "./banned-text";
import { itemModule as competitorResearch } from "./competitor-research";
import { itemModule as labelPattern } from "./label-pattern";
import { itemModule as metricsRequired } from "./metrics-required";
import { itemModule as placeholderQuality } from "./placeholder-quality";
import { itemModule as sectionCount } from "./section-count";
import { itemModule as skuDifferentiation } from "./sku-differentiation";
import { itemModule as technicalFeasibility } from "./technical-feasibility";
import { itemModule as wordBudget } from "./word-budget";

registerItem(createValidatorModule(bannedText));
registerItem(createValidatorModule(competitorResearch));
registerItem(createValidatorModule(labelPattern));
registerItem(createValidatorModule(metricsRequired));
registerItem(createValidatorModule(placeholderQuality));
registerItem(createValidatorModule(sectionCount));
registerItem(createValidatorModule(skuDifferentiation));
registerItem(createValidatorModule(technicalFeasibility));
registerItem(createValidatorModule(wordBudget));
