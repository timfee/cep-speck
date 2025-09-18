import { registerItem } from '../../spec/registry';
import * as sectionCount from './sectionCount';
import * as metricsRequired from './metricsRequired';
import * as bannedText from './bannedText';
import * as labelPattern from './labelPattern';

[sectionCount, metricsRequired, bannedText, labelPattern].forEach((m: any) => {
  registerItem({ itemId: m.itemId, toPrompt: m.toPrompt, validate: m.validate, heal: m.heal });
});
