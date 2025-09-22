/**
 * Enhanced workflow serialization that maintains data fidelity
 * Addresses BLOCKER 2: Data Format Mismatch
 */

import type { StructuredWorkflowState } from '@/types/workflow';

/**
 * Serialize structured workflow state to spec text format
 * Maintains data integrity while transforming to expected API format
 */
export function serializeWorkflowToSpec(state: StructuredWorkflowState): string {
  const sections: string[] = [];
  
  // Header section with project metadata
  sections.push(`Project: ${extractProjectName(state.initialPrompt)}`);
  sections.push(`Target SKU: ${state.enterpriseParameters.targetSku}`);
  sections.push(`Deployment: ${state.enterpriseParameters.deploymentModel}`);
  sections.push('');
  
  // Core problem/objective
  sections.push('## Objective');
  sections.push(state.initialPrompt);
  sections.push('');
  
  // Functional requirements as features
  if (state.contentOutline.functionalRequirements.length > 0) {
    sections.push('## Key Features');
    state.contentOutline.functionalRequirements.forEach(req => {
      sections.push(`- **${req.title}** (${req.priority}): ${req.description}`);
      if (req.userStory) {
        sections.push(`  User Story: ${req.userStory}`);
      }
      if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
        sections.push(`  Acceptance Criteria: ${req.acceptanceCriteria.join(', ')}`);
      }
    });
    sections.push('');
  }
  
  // Success metrics
  if (state.contentOutline.successMetrics.length > 0) {
    sections.push('## Success Metrics');
    state.contentOutline.successMetrics.forEach(metric => {
      const target = metric.target ? ` → ${metric.target}` : '';
      const measurement = metric.measurement ? ` (${metric.measurement})` : '';
      sections.push(`- ${metric.name}: ${metric.description}${target}${measurement}`);
    });
    sections.push('');
  }
  
  // Project milestones
  if (state.contentOutline.milestones.length > 0) {
    sections.push('## Project Timeline');
    state.contentOutline.milestones.forEach(milestone => {
      const date = milestone.estimatedDate ? ` - ${milestone.estimatedDate}` : '';
      sections.push(`- **${milestone.title}** (${milestone.phase}${date}): ${milestone.description}`);
    });
    sections.push('');
  }
  
  // Enterprise context
  const security = state.enterpriseParameters.securityRequirements;
  if (security.length > 0) {
    sections.push('## Security Requirements');
    sections.push(security.map(req => `- ${req.toUpperCase()}`).join('\n'));
    sections.push('');
  }
  
  const integrations = state.enterpriseParameters.integrations;
  if (integrations.length > 0) {
    sections.push('## Required Integrations');
    sections.push(integrations.map(integration => `- ${integration}`).join('\n'));
    sections.push('');
  }
  
  // Executive summary if available
  if (state.contentOutline.executiveSummary) {
    const summary = state.contentOutline.executiveSummary;
    sections.push('## Executive Summary');
    sections.push(`**Problem Statement**: ${summary.problemStatement}`);
    sections.push(`**Proposed Solution**: ${summary.proposedSolution}`);
    sections.push(`**Business Value**: ${summary.businessValue}`);
    sections.push(`**Target Users**: ${summary.targetUsers}`);
    sections.push('');
  }
  
  return sections.join('\n');
}

/**
 * Extract project name from initial prompt
 */
function extractProjectName(prompt: string): string {
  // Try to extract a project name from the prompt
  const lines = prompt.split('\n');
  const projectLine = lines.find(l => l.toLowerCase().includes('project'));
  if (projectLine) {
    return projectLine.replace(/project[:\s]*/i, '').trim();
  }
  
  // Generate a name from first few words
  const words = prompt.split(/\s+/).slice(0, 5).join(' ');
  return words.length > 50 ? words.substring(0, 47) + '...' : words;
}

/**
 * Validate that the serialized spec contains required information
 */
export function validateSerializedSpec(specText: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!specText.includes('Project:')) {
    issues.push('Missing project name');
  }
  
  if (!specText.includes('Target SKU:')) {
    issues.push('Missing target SKU');
  }
  
  if (!specText.includes('## Objective')) {
    issues.push('Missing objective section');
  }
  
  if (specText.length < 100) {
    issues.push('Spec text is too short');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}