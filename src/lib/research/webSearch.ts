export interface CompetitorInfo {
  vendor: string;
  onboardingDefaults?: string;
  policyTemplates?: string;
  enterpriseBrowser?: string;
  dataProtection?: string;
  mobileSupport?: string;
  source?: string;
  date?: string;
}

export interface ResearchResult {
  competitors: CompetitorInfo[];
  citations: string[];
  autoFilledFacts: string[];
}

export async function performCompetitorResearch(
  vendors: string[]
): Promise<ResearchResult> {
  const result: ResearchResult = {
    competitors: [],
    citations: [],
    autoFilledFacts: []
  };
  
  for (const vendor of vendors) {
    result.competitors.push({
      vendor,
      onboardingDefaults: `[PM_INPUT_NEEDED: ${vendor} onboarding defaults]`,
      policyTemplates: `[PM_INPUT_NEEDED: ${vendor} policy templates]`,
      enterpriseBrowser: `[PM_INPUT_NEEDED: ${vendor} enterprise browser capabilities]`,
      dataProtection: `[PM_INPUT_NEEDED: ${vendor} data protection features]`,
      mobileSupport: `[PM_INPUT_NEEDED: ${vendor} mobile support]`
    });
  }
  
  return result;
}

export function synthesizeCompetitiveSnapshot(competitors: CompetitorInfo[]): string {
  if (competitors.length === 0) {
    return '[PM_INPUT_NEEDED: competitor snapshot]';
  }
  
  const vendorNames = competitors.map(c => c.vendor).join(', ');
  return `A brief competitive snapshot indicates that enterprise browsers such as ${vendorNames} focus on different approaches to enterprise management and security controls.`;
}

export async function searchCompetitorInfo(vendor: string, topic: string): Promise<string> {
  return `[PM_INPUT_NEEDED: ${vendor} ${topic}]`;
}
