import { registerItem } from '../../spec/registry';
import type { SpecPack, Issue } from '../types';
import * as sectionCount from './sectionCount';
import * as metricsRequired from './metricsRequired';
import * as bannedText from './bannedText';
import * as labelPattern from './labelPattern';
import * as wordBudget from './wordBudget';
import * as competitorResearch from './competitorResearch';
import * as executiveQuality from './executiveQuality';
import * as crossSectionConsistency from './crossSectionConsistency';
import * as skuDifferentiation from './skuDifferentiation';
import * as personaCoverage from './personaCoverage';
import * as executiveSummaryCoherence from './executiveSummaryCoherence';
import * as technicalFeasibility from './technicalFeasibility';

registerItem({
  itemId: sectionCount.itemId,
  toPrompt: (params: unknown) => sectionCount.toPrompt(params as sectionCount.Params),
  validate: (draft: string, params: unknown) => sectionCount.validate(draft, params as sectionCount.Params),
  heal: (issues: Issue[], params?: unknown) => sectionCount.heal(issues, params as sectionCount.Params)
});

registerItem({
  itemId: metricsRequired.itemId,
  toPrompt: (params: unknown) => metricsRequired.toPrompt(params as metricsRequired.Params),
  validate: (draft: string, params: unknown) => metricsRequired.validate(draft, params as metricsRequired.Params),
  heal: (issues: Issue[], params?: unknown) => metricsRequired.heal(issues, params as metricsRequired.Params)
});

registerItem({
  itemId: bannedText.itemId,
  toPrompt: (params: unknown, pack?: SpecPack) => bannedText.toPrompt(params as bannedText.Params, pack!),
  validate: (draft: string, params: unknown, pack?: SpecPack) => bannedText.validate(draft, params as bannedText.Params, pack!),
  heal: () => bannedText.heal([])
});

registerItem({
  itemId: labelPattern.itemId,
  toPrompt: (params: unknown) => labelPattern.toPrompt(params as labelPattern.Params),
  validate: (draft: string, params: unknown) => labelPattern.validate(draft, params as labelPattern.Params),
  heal: () => labelPattern.heal()
});

registerItem({
  itemId: wordBudget.itemId,
  toPrompt: (params: unknown) => wordBudget.toPrompt(params as wordBudget.Params),
  validate: (draft: string, params: unknown) => wordBudget.validate(draft, params as wordBudget.Params),
  heal: (issues: Issue[], params?: unknown) => wordBudget.heal(issues, params as wordBudget.Params)
});

registerItem({
  itemId: competitorResearch.itemId,
  toPrompt: (params: unknown) => competitorResearch.toPrompt(params as competitorResearch.Params),
  validate: (draft: string, params: unknown) => competitorResearch.validate(draft, params as competitorResearch.Params),
  heal: (issues: Issue[], params?: unknown) => competitorResearch.heal(issues, params as competitorResearch.Params)
});

registerItem({
  itemId: executiveQuality.itemId,
  toPrompt: () => executiveQuality.toPrompt(),
  validate: (draft: string, params: unknown) => executiveQuality.validate(draft, params as executiveQuality.Params),
  heal: (issues: Issue[]) => executiveQuality.heal(issues)
});

registerItem({
  itemId: crossSectionConsistency.itemId,
  toPrompt: () => crossSectionConsistency.toPrompt(),
  validate: (draft: string, params: unknown) => crossSectionConsistency.validate(draft, params as crossSectionConsistency.Params),
  heal: () => crossSectionConsistency.heal()
});

registerItem({
  itemId: skuDifferentiation.itemId,
  toPrompt: (params: unknown) => skuDifferentiation.toPrompt(params as skuDifferentiation.Params),
  validate: (draft: string, params: unknown) => skuDifferentiation.validate(draft, params as skuDifferentiation.Params),
  heal: () => skuDifferentiation.heal()
});
registerItem({
  itemId: personaCoverage.itemId,
  toPrompt: () => personaCoverage.toPrompt(),
  validate: (draft: string, params: unknown) => personaCoverage.validate(draft, params as personaCoverage.Params),
  heal: () => personaCoverage.heal()
});

registerItem({
  itemId: executiveSummaryCoherence.itemId,
  toPrompt: () => executiveSummaryCoherence.toPrompt(),
  validate: (draft: string, params: unknown) => executiveSummaryCoherence.validate(draft, params as executiveSummaryCoherence.Params),
  heal: (issues: Issue[]) => executiveSummaryCoherence.heal(issues)
});


registerItem({
  itemId: technicalFeasibility.itemId,
  toPrompt: () => technicalFeasibility.toPrompt(),
  validate: (draft: string) => technicalFeasibility.validate(draft),
  heal: () => technicalFeasibility.heal()
});
