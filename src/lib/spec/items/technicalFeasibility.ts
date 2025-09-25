import type { Issue, SpecPack } from '../types';

export const itemId = 'technical-feasibility';

export type Params = {
  requireImplementation?: boolean;
  requireArchitecture?: boolean;
  requireConstraints?: boolean;
  bannedTechnologies?: string[];
};

export function toPrompt(params: Params, pack?: SpecPack): string {
  let prompt = 'Include technical feasibility considerations. ';
  
  if (params.requireImplementation) {
    prompt += 'Specify implementation approach and technical requirements. ';
  }
  
  if (params.requireArchitecture) {
    prompt += 'Include high-level system architecture considerations. ';
  }
  
  if (params.requireConstraints) {
    prompt += 'Address technical constraints, limitations, and dependencies. ';
  }
  
  if (params.bannedTechnologies && params.bannedTechnologies.length > 0) {
    prompt += `Avoid these technologies: ${params.bannedTechnologies.join(', ')}. `;
  }
  
  return prompt + 'Ensure technical requirements are realistic and achievable.';
}

export async function validate(
  draft: string,
  params: Params,
  pack?: SpecPack
): Promise<Issue[]> {
  const issues: Issue[] = [];
  
  // Check for technical content
  const technicalKeywords = [
    'API', 'database', 'system', 'architecture', 'implementation',
    'technology', 'platform', 'infrastructure', 'service', 'framework',
    'security', 'performance', 'scalability', 'integration'
  ];
  
  const technicalMentions = technicalKeywords.filter(keyword => 
    new RegExp(`\\b${keyword}\\b`, 'i').test(draft)
  );
  
  if (technicalMentions.length < 3) {
    issues.push({
      id: `${itemId}-insufficient-technical`,
      itemId,
      severity: 'warn',
      message: 'Limited technical content found. Consider adding more technical details.',
      evidence: `Technical keywords found: ${technicalMentions.join(', ')}`
    });
  }
  
  // Check for implementation details if required
  if (params.requireImplementation) {
    const implementationKeywords = [
      'implement', 'build', 'develop', 'create', 'design',
      'code', 'programming', 'development', 'engineering'
    ];
    
    const hasImplementation = implementationKeywords.some(keyword => 
      new RegExp(`\\b${keyword}`, 'i').test(draft)
    );
    
    if (!hasImplementation) {
      issues.push({
        id: `${itemId}-missing-implementation`,
        itemId,
        severity: 'warn',
        message: 'Missing implementation approach details',
        evidence: 'No implementation keywords found'
      });
    }
  }
  
  // Check for architecture considerations if required
  if (params.requireArchitecture) {
    const architectureKeywords = [
      'architecture', 'component', 'module', 'layer', 'tier',
      'microservice', 'service', 'system design', 'data flow'
    ];
    
    const hasArchitecture = architectureKeywords.some(keyword => 
      new RegExp(`\\b${keyword}`, 'i').test(draft)
    );
    
    if (!hasArchitecture) {
      issues.push({
        id: `${itemId}-missing-architecture`,
        itemId,
        severity: 'warn',
        message: 'Missing system architecture considerations',
        evidence: 'No architecture keywords found'
      });
    }
  }
  
  // Check for constraints if required
  if (params.requireConstraints) {
    const constraintKeywords = [
      'constraint', 'limitation', 'dependency', 'requirement',
      'assumption', 'risk', 'challenge', 'issue', 'blocker'
    ];
    
    const hasConstraints = constraintKeywords.some(keyword => 
      new RegExp(`\\b${keyword}`, 'i').test(draft)
    );
    
    if (!hasConstraints) {
      issues.push({
        id: `${itemId}-missing-constraints`,
        itemId,
        severity: 'warn',
        message: 'Missing technical constraints and limitations',
        evidence: 'No constraint keywords found'
      });
    }
  }
  
  // Check for banned technologies
  if (params.bannedTechnologies && params.bannedTechnologies.length > 0) {
    params.bannedTechnologies.forEach(tech => {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = draft.match(regex);
      
      if (matches) {
        issues.push({
          id: `${itemId}-banned-technology-${tech.toLowerCase().replace(/\s+/g, '-')}`,
          itemId,
          severity: 'error',
          message: `Use of banned technology: "${tech}"`,
          evidence: `Found ${matches.length} occurrence(s)`
        });
      }
    });
  }
  
  // Check for unrealistic claims
  const unrealisticPatterns = [
    /\b(instant|immediate|zero\s+latency|100%\s+uptime|perfect|never\s+fail)\b/gi,
    /\b(unlimited|infinite|forever|permanent|always\s+work)\b/gi
  ];
  
  unrealisticPatterns.forEach(pattern => {
    const matches = draft.match(pattern);
    if (matches) {
      issues.push({
        id: `${itemId}-unrealistic-claims`,
        itemId,
        severity: 'warn',
        message: 'Potentially unrealistic technical claims found',
        evidence: `Claims: ${matches.join(', ')}`
      });
    }
  });
  
  return issues;
}

export const itemModule = { itemId, toPrompt, validate };