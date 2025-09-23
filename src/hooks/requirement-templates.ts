/**
 * Predefined functional requirement templates
 */

import type { FunctionalRequirement } from "@/types/workflow";

/**
 * Generate core functional requirement
 */
export function createCoreFunctionalRequirement(): FunctionalRequirement {
  return {
    id: "fr-core-functionality",
    title: "Core Product Functionality",
    description: "Primary product capabilities and core user workflows",
    priority: "P0" as const,
    userStory:
      "As a user, I want to access the main product features seamlessly",
    acceptanceCriteria: [
      "Feature is accessible",
      "Performance meets standards",
      "User experience is intuitive",
    ],
  };
}

/**
 * Generate enterprise/security requirement
 */
export function createSecurityRequirement(): FunctionalRequirement {
  return {
    id: "fr-auth-security",
    title: "Authentication & Security",
    description: "Enterprise-grade authentication and security controls",
    priority: "P0" as const,
    userStory:
      "As an admin, I want to ensure secure access to enterprise features",
    acceptanceCriteria: [
      "SSO integration",
      "Role-based access control",
      "Audit logging",
    ],
  };
}

/**
 * Generate integration requirement
 */
export function createIntegrationRequirement(): FunctionalRequirement {
  return {
    id: "fr-integrations",
    title: "Third-party Integrations",
    description: "Seamless connectivity with external tools and services",
    priority: "P1" as const,
    userStory:
      "As a user, I want to connect with my existing tools and workflows",
    acceptanceCriteria: [
      "API connectivity",
      "Data synchronization",
      "Authentication handling",
    ],
  };
}

/**
 * Generate collaboration requirement
 */
export function createCollaborationRequirement(): FunctionalRequirement {
  return {
    id: "fr-collaboration",
    title: "Team Collaboration",
    description: "Multi-user collaboration and sharing capabilities",
    priority: "P1" as const,
    userStory:
      "As a team member, I want to collaborate effectively with my colleagues",
    acceptanceCriteria: [
      "Real-time collaboration",
      "Permission management",
      "Activity notifications",
    ],
  };
}

/**
 * Generate analytics requirement
 */
export function createAnalyticsRequirement(): FunctionalRequirement {
  return {
    id: "fr-analytics",
    title: "Analytics & Reporting",
    description: "Comprehensive analytics and reporting capabilities",
    priority: "P2" as const,
    userStory: "As a stakeholder, I want to track usage and measure success",
    acceptanceCriteria: [
      "Usage tracking",
      "Custom reports",
      "Data visualization",
    ],
  };
}
