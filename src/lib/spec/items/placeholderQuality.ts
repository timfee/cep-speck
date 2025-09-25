import type { Issue, SpecPack } from '../types';

export const itemId = 'placeholder-quality';

export type Params = {
  maxPlaceholderLength?: number;
  bannedPlaceholders?: string[];
  requireSpecificity?: boolean;
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  const bannedPlaceholders = params.bannedPlaceholders || [
    'TBD', 'TODO', 'XXX', 'placeholder', 'fill in'
  ];
  
  let prompt = 'Avoid generic placeholders. ';
  
  if (bannedPlaceholders.length > 0) {
    prompt += `Do not use: ${bannedPlaceholders.join(', ')}. `;
  }
  
  if (params.requireSpecificity) {
    prompt += 'Use specific, actionable content instead of vague placeholders. ';
  }
  
  return prompt + 'Provide concrete examples and specific details rather than placeholder text.';
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const maxLength = params.maxPlaceholderLength || 100;
  
  const defaultBannedPlaceholders = [
    'TBD', 'TODO', 'XXX', 'placeholder', 'fill in', 'insert', 'add here',
    'more details', 'details TBD', 'to be determined', 'coming soon',
    'work in progress', 'WIP', 'draft', '[draft]', 'example', 'sample'
  ];
  
  const bannedPlaceholders = params.bannedPlaceholders || defaultBannedPlaceholders;
  
  // Check for banned placeholders
  bannedPlaceholders.forEach(placeholder => {
    const regex = new RegExp(`\\b${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = draft.match(regex);
    
    if (matches) {
      issues.push({
        id: `${itemId}-banned-${placeholder.replace(/\s+/g, '-').toLowerCase()}`,
        itemId,
        severity: 'error',
        message: `Found banned placeholder: "${placeholder}"`,
        evidence: `Found ${matches.length} occurrence(s): ${matches.join(', ')}`
      });
    }
  });
  
  // Check for common placeholder patterns
  const placeholderPatterns = [
    /\[.*?\]/g,           // [placeholder text]
    /<.*?>/g,             // <placeholder text>
    /\{.*?\}/g,           // {placeholder text}
    /\$\{.*?\}/g,         // ${placeholder text}
    /\b\w*\d+\w*\b/g      // placeholder123, item1, feature2
  ];
  
  placeholderPatterns.forEach((pattern, index) => {
    const matches = draft.match(pattern);
    if (matches) {
      const longPlaceholders = matches.filter(match => match.length > maxLength);
      
      matches.forEach(match => {
        // Skip common legitimate uses
        if (match.match(/^\d+$/) || // pure numbers
            match.match(/^[a-zA-Z]+\d+$/) || // version numbers like v1, API2
            match.length <= 3) { // short codes
          return;
        }
        
        if (longPlaceholders.includes(match)) {
          issues.push({
            id: `${itemId}-long-placeholder`,
            itemId,
            severity: 'warn',
            message: `Long placeholder detected: "${match}"`,
            evidence: `Placeholder length: ${match.length} characters`
          });
        } else if (match.toLowerCase().includes('placeholder') || 
                   match.toLowerCase().includes('example') ||
                   match.toLowerCase().includes('sample')) {
          issues.push({
            id: `${itemId}-generic-placeholder`,
            itemId,
            severity: 'warn',
            message: `Generic placeholder detected: "${match}"`,
            evidence: match
          });
        }
      });
    }
  });
  
  // Check for vague content that should be more specific
  if (params.requireSpecificity) {
    const vaguePatterns = [
      /\b(many|several|various|multiple|some|few)\s+\w+/gi,
      /\b(improve|enhance|optimize|better)\s+(?!by|through)/gi,
      /\b(significant|substantial|considerable|major)\s+(?!improvement|increase|decrease|reduction)/gi,
      /\b(as needed|when required|if necessary|where applicable)\b/gi
    ];
    
    vaguePatterns.forEach(pattern => {
      const matches = draft.match(pattern);
      if (matches && matches.length > 3) {
        issues.push({
          id: `${itemId}-vague-content`,
          itemId,
          severity: 'warn',
          message: `Found ${matches.length} instances of vague language`,
          evidence: `Examples: ${matches.slice(0, 3).join(', ')}`
        });
      }
    });
  }
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };