import { createValidatorModule, registerItem } from "../registry";
// Import each module object
import { itemModule as adoptionRealism } from "./adoptionRealism";
import { itemModule as bannedText } from "./bannedText";
import { itemModule as competitorResearch } from "./competitorResearch";
import { itemModule as executiveQuality } from "./executiveQuality";
import { itemModule as labelPattern } from "./labelPattern";
import { itemModule as metricsRequired } from "./metricsRequired";
import { itemModule as placeholderQuality } from "./placeholderQuality";
import { itemModule as sectionCount } from "./sectionCount";
import { itemModule as semanticCoherence } from "./semanticCoherence";
import { itemModule as skuDifferentiation } from "./skuDifferentiation";
import { itemModule as technicalFeasibility } from "./technicalFeasibility";
import { itemModule as wordBudget } from "./wordBudget";

registerItem(createValidatorModule(adoptionRealism));
registerItem(createValidatorModule(bannedText));
registerItem(createValidatorModule(competitorResearch));
registerItem(createValidatorModule(executiveQuality));
registerItem(createValidatorModule(labelPattern));
registerItem(createValidatorModule(metricsRequired));
registerItem(createValidatorModule(placeholderQuality));
registerItem(createValidatorModule(sectionCount));
registerItem(createValidatorModule(semanticCoherence));
registerItem(createValidatorModule(skuDifferentiation));
registerItem(createValidatorModule(technicalFeasibility));
registerItem(createValidatorModule(wordBudget));
