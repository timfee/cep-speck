import type { Issue, SpecPack } from '../types';

export const itemId = 'sku-differentiation';

export type Params = {
  targetSku?: string;
  requireSkuMention?: boolean;
  skuFeatures?: Record<string, string[]>;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const targetSku = params.targetSku || 'premium';
  let prompt = `Focus on ${targetSku} SKU features and capabilities. `;
  
  if (params.requireSkuMention) {
    prompt += `Explicitly mention "${targetSku}" SKU differentiation. `;
  }
  
  if (params.skuFeatures && params.skuFeatures[targetSku]) {
    const features = params.skuFeatures[targetSku];
    prompt += `Emphasize these ${targetSku} SKU features: ${features.join(', ')}. `;
  }
  
  return prompt + 'Clearly differentiate from basic/standard offerings.';
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const targetSku = params.targetSku || 'premium';
  
  // Check for SKU mention if required
  if (params.requireSkuMention) {
    const skuMentioned = new RegExp(`\\b${targetSku}\\b`, 'i').test(draft);
    if (!skuMentioned) {
      issues.push({
        id: `${itemId}-missing-sku-mention`,
        itemId,
        severity: 'warn',
        message: `No explicit mention of "${targetSku}" SKU found`,
        evidence: `Expected "${targetSku}" to be mentioned`
      });
    }
  }
  
  // Check for SKU-specific features
  if (params.skuFeatures && params.skuFeatures[targetSku]) {
    const requiredFeatures = params.skuFeatures[targetSku];
    const missingFeatures = requiredFeatures.filter(feature => {
      return !new RegExp(`\\b${feature.replace(/\s+/g, '\\s+')}\\b`, 'i').test(draft);
    });
    
    if (missingFeatures.length > 0) {
      issues.push({
        id: `${itemId}-missing-features`,
        itemId,
        severity: 'warn',
        message: `Missing ${targetSku} SKU features: ${missingFeatures.join(', ')}`,
        evidence: `Required features not found: ${missingFeatures.join(', ')}`
      });
    }
  }
  
  // Check for differentiation language
  const differentiationKeywords = [
    'premium', 'advanced', 'enterprise', 'professional',
    'enhanced', 'superior', 'exclusive', 'high-end',
    'differentiat', 'distinguish', 'unique', 'competitive advantage'
  ];
  
  const hasDifferentiation = differentiationKeywords.some(keyword => 
    new RegExp(`\\b${keyword}`, 'i').test(draft)
  );
  
  if (!hasDifferentiation) {
    issues.push({
      id: `${itemId}-missing-differentiation`,
      itemId,
      severity: 'warn',
      message: 'Lacks clear differentiation language for premium positioning',
      evidence: 'No premium/differentiation keywords found'
    });
  }
  
  // Check for basic/standard comparisons
  const comparisonKeywords = ['vs', 'compared to', 'unlike', 'while standard', 'beyond basic'];
  const hasComparison = comparisonKeywords.some(keyword => 
    new RegExp(`\\b${keyword}\\b`, 'i').test(draft)
  );
  
  if (!hasComparison && targetSku !== 'standard' && targetSku !== 'basic') {
    issues.push({
      id: `${itemId}-missing-comparison`,
      itemId,
      severity: 'info',
      message: 'Consider adding comparisons to standard/basic offerings',
      evidence: 'No comparison language found'
    });
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };