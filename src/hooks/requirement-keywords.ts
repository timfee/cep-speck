/**
 * Keyword detection utilities for functional requirements
 */

/**
 * Keyword detection utilities
 */
export function includesEnterpriseKeywords(prompt: string): boolean {
  const enterpriseKeywords = [
    "enterprise",
    "security",
    "admin",
    "sso",
    "authentication",
    "authorization",
    "compliance",
    "audit",
  ];
  return enterpriseKeywords.some((keyword) => prompt.includes(keyword));
}

export function includesIntegrationKeywords(prompt: string): boolean {
  const integrationKeywords = [
    "api",
    "integration",
    "connect",
    "sync",
    "import",
    "export",
    "webhook",
    "third-party",
  ];
  return integrationKeywords.some((keyword) => prompt.includes(keyword));
}

export function includesCollaborationKeywords(prompt: string): boolean {
  const collaborationKeywords = [
    "team",
    "collaborate",
    "share",
    "comment",
    "review",
    "workspace",
    "multi-user",
  ];
  return collaborationKeywords.some((keyword) => prompt.includes(keyword));
}

export function includesAnalyticsKeywords(prompt: string): boolean {
  const analyticsKeywords = [
    "analytics",
    "metrics",
    "dashboard",
    "report",
    "insight",
    "track",
    "measure",
  ];
  return analyticsKeywords.some((keyword) => prompt.includes(keyword));
}
