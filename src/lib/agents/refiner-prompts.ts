interface RefinerPromptParts {
  basePrompt: string;
  enumerationSummary: string;
  healingInstructions: string;
  draft: string;
}

export function buildRefinerPrompt({
  basePrompt,
  enumerationSummary,
  healingInstructions,
  draft,
}: RefinerPromptParts): string {
  return `${basePrompt}

## Metadata Enumerations

${enumerationSummary}

## Issues to Address

${healingInstructions}

## Original Document

${draft}

## Instructions

Fix all the issues listed above while maintaining the document's core message and professional quality. Provide the complete, corrected PRD as your response. Ensure:

1. All deterministic validation errors are resolved
2. Semantic quality issues are improved
3. Document coherence is maintained
4. Executive readiness is enhanced
5. Original content value is preserved

Return only the corrected document content without additional commentary.`;
}
