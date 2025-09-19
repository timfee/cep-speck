export const SPEC_TEMPLATES = {
  basic: {
    name: "Basic PRD",
    content: `Project: [Your project name]
Target SKU: premium

Objective: [Brief description of what you want to build]
Target Users: [Who will use this feature]
Success Metrics: [How you'll measure success]`,
  },
  
  detailed: {
    name: "Detailed PRD",
    content: `Project: [Your project name]
Target SKU: premium

Objective: [Primary goal and problem being solved]
Target Users: [Primary and secondary user personas]
User Story: [As a user, I want to... so that...]

Key Features:
- [Feature 1: Description]
- [Feature 2: Description]
- [Feature 3: Description]

Success Metrics:
- [Metric 1: Baseline → Target]
- [Metric 2: Baseline → Target]

Constraints:
- [Technical or business constraints]`,
  },
  
  competitive: {
    name: "Competitive Analysis",
    content: `Project: [Your project name]
Target SKU: premium

Objective: [Competitive positioning and differentiation]
Target Users: [Users switching from competitors]

Competitive Landscape:
- [Competitor 1: Strengths and weaknesses]
- [Competitor 2: Strengths and weaknesses]

Differentiation:
- [How we'll be different/better]
- [Unique value proposition]

Success Metrics:
- [Market share targets]
- [User acquisition goals]`,
  },
  
  enterprise: {
    name: "Enterprise Feature",
    content: `Project: [Enterprise feature name]
Target SKU: premium

Objective: [Enterprise-specific problem being solved]
Target Users: Enterprise IT administrators, security teams, end users
Compliance Requirements: [SOC2, GDPR, HIPAA, etc.]

Enterprise Features:
- [Admin controls and visibility]
- [Security and compliance features]
- [Scale and performance requirements]

Success Metrics:
- [Enterprise adoption rate]
- [Admin satisfaction scores]
- [Security incident reduction]`,
  },
} as const;

export type SpecTemplateKey = keyof typeof SPEC_TEMPLATES;