import { registerItem } from "../registry";

// Import all items
import * as bannedText from "./bannedText";
import * as competitorResearch from "./competitorResearch";
import * as crossSectionConsistency from "./crossSectionConsistency";
import * as executiveQuality from "./executiveQuality";
import * as executiveSummaryCoherence from "./executiveSummaryCoherence";
import * as labelPattern from "./labelPattern";
import * as metricsRequired from "./metricsRequired";
import * as personaCoverage from "./personaCoverage";
import * as placeholderQuality from "./placeholderQuality";
import * as sectionCount from "./sectionCount";
import * as skuDifferentiation from "./skuDifferentiation";
import * as technicalFeasibility from "./technicalFeasibility";
import * as traceabilityComplete from "./traceabilityComplete";
import * as wordBudget from "./wordBudget";

// Register all items using proper ItemModule interface
registerItem({
  itemId: bannedText.itemId,
  toPrompt: (params: unknown, pack) =>
    bannedText.toPrompt(params as bannedText.Params, pack!),
  validate: (draft, params, pack) =>
    bannedText.validate(draft, params as bannedText.Params, pack!),
  heal: (issues) => bannedText.heal(issues),
});

registerItem({
  itemId: competitorResearch.itemId,
  toPrompt: (params: unknown) =>
    competitorResearch.toPrompt(params as competitorResearch.Params),
  validate: (draft, params) =>
    competitorResearch.validate(draft, params as competitorResearch.Params),
  heal: (issues, params) =>
    competitorResearch.heal(issues, params as competitorResearch.Params),
});

registerItem({
  itemId: crossSectionConsistency.itemId,
  toPrompt: () => crossSectionConsistency.toPrompt(),
  validate: (draft, params) =>
    crossSectionConsistency.validate(
      draft,
      params as crossSectionConsistency.Params
    ),
  heal: () => crossSectionConsistency.heal(),
});

registerItem({
  itemId: executiveQuality.itemId,
  toPrompt: () => executiveQuality.toPrompt(),
  validate: (draft, params) =>
    executiveQuality.validate(draft, params as executiveQuality.Params),
  heal: (issues) => executiveQuality.heal(issues),
});

registerItem({
  itemId: executiveSummaryCoherence.itemId,
  toPrompt: () => executiveSummaryCoherence.toPrompt(),
  validate: (draft) => executiveSummaryCoherence.validate(draft),
  heal: (issues) => executiveSummaryCoherence.heal(issues),
});

registerItem({
  itemId: labelPattern.itemId,
  toPrompt: (params: unknown) =>
    labelPattern.toPrompt(params as labelPattern.Params),
  validate: (draft, params) =>
    labelPattern.validate(draft, params as labelPattern.Params),
  heal: () => labelPattern.heal(),
});

registerItem({
  itemId: metricsRequired.itemId,
  toPrompt: (params: unknown) =>
    metricsRequired.toPrompt(params as metricsRequired.Params),
  validate: (draft, params) =>
    metricsRequired.validate(draft, params as metricsRequired.Params),
  heal: (issues, params) =>
    metricsRequired.heal(issues, params as metricsRequired.Params),
});

registerItem({
  itemId: personaCoverage.itemId,
  toPrompt: () => personaCoverage.toPrompt(),
  validate: (draft, params) =>
    personaCoverage.validate(draft, params as personaCoverage.Params),
  heal: () => personaCoverage.heal(),
});

registerItem({
  itemId: placeholderQuality.itemId,
  toPrompt: () => placeholderQuality.toPrompt(),
  validate: (draft) => placeholderQuality.validate(draft),
  heal: (issues) => placeholderQuality.heal(issues),
});

registerItem({
  itemId: sectionCount.itemId,
  toPrompt: (params: unknown) =>
    sectionCount.toPrompt(params as sectionCount.Params),
  validate: (draft, params) =>
    sectionCount.validate(draft, params as sectionCount.Params),
  heal: (issues, params) =>
    sectionCount.heal(issues, params as sectionCount.Params),
});

registerItem({
  itemId: skuDifferentiation.itemId,
  toPrompt: () => skuDifferentiation.toPrompt(),
  validate: (draft, params) =>
    skuDifferentiation.validate(draft, params as skuDifferentiation.Params),
  heal: () => skuDifferentiation.heal(),
});

registerItem({
  itemId: technicalFeasibility.itemId,
  toPrompt: () => technicalFeasibility.toPrompt(),
  validate: (draft) => technicalFeasibility.validate(draft),
  heal: () => technicalFeasibility.heal(),
});

registerItem({
  itemId: traceabilityComplete.itemId,
  toPrompt: () => traceabilityComplete.toPrompt(),
  validate: (draft) => traceabilityComplete.validate(draft),
  heal: () => traceabilityComplete.heal(),
});

registerItem({
  itemId: wordBudget.itemId,
  toPrompt: (params: unknown) =>
    wordBudget.toPrompt(params as wordBudget.Params),
  validate: (draft, params) =>
    wordBudget.validate(draft, params as wordBudget.Params),
  heal: (issues, params) =>
    wordBudget.heal(issues, params as wordBudget.Params),
});
