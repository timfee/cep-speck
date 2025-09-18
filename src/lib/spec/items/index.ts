import { registerItem, createValidatorModule } from "../registry";

// Import each module object
import { itemModule as bannedText } from "./bannedText";
import { itemModule as competitorResearch } from "./competitorResearch";
import { itemModule as crossSectionConsistency } from "./crossSectionConsistency";
import { itemModule as executiveQuality } from "./executiveQuality";
import { itemModule as executiveSummaryCoherence } from "./executiveSummaryCoherence";
import { itemModule as labelPattern } from "./labelPattern";
import { itemModule as metricsRequired } from "./metricsRequired";
import { itemModule as personaCoverage } from "./personaCoverage";
import { itemModule as placeholderQuality } from "./placeholderQuality";
import { itemModule as sectionCount } from "./sectionCount";
import { itemModule as skuDifferentiation } from "./skuDifferentiation";
import { itemModule as technicalFeasibility } from "./technicalFeasibility";
import { itemModule as traceabilityComplete } from "./traceabilityComplete";
import { itemModule as wordBudget } from "./wordBudget";

registerItem(createValidatorModule(bannedText));
registerItem(createValidatorModule(competitorResearch));
registerItem(createValidatorModule(crossSectionConsistency));
registerItem(createValidatorModule(executiveQuality));
registerItem(createValidatorModule(executiveSummaryCoherence));
registerItem(createValidatorModule(labelPattern));
registerItem(createValidatorModule(metricsRequired));
registerItem(createValidatorModule(personaCoverage));
registerItem(createValidatorModule(placeholderQuality));
registerItem(createValidatorModule(sectionCount));
registerItem(createValidatorModule(skuDifferentiation));
registerItem(createValidatorModule(technicalFeasibility));
registerItem(createValidatorModule(traceabilityComplete));
registerItem(createValidatorModule(wordBudget));
