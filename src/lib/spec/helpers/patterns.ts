/**
 * Common regex patterns and pattern matching utilities
 */

/**
 * Create a word boundary regex that handles special characters
 */
export function createWordBoundaryRegex(word: string, flags = 'i'): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, flags);
}

/**
 * Create a case-insensitive regex with optional inline flag support
 */
export function createFlexibleRegex(pattern: string): RegExp {
  const hasInlineI = /^\(\?i\)/.test(pattern);
  const source = pattern.replace(/^\(\?i\)/, '');
  return new RegExp(source, hasInlineI ? 'gi' : 'g');
}

/**
 * Test multiple regex patterns against text
 */
export function testAnyPattern(text: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    try {
      const regex = createFlexibleRegex(pattern);
      return regex.test(text);
    } catch {
      return false; // Invalid regex patterns fail gracefully
    }
  });
}

/**
 * Find all matches for multiple patterns in text
 */
export function findAllMatches(text: string, patterns: string[]): string[] {
  const matches: string[] = [];
  
  for (const pattern of patterns) {
    try {
      const regex = createFlexibleRegex(pattern);
      const found = text.match(regex);
      if (found) {
        matches.push(...found);
      }
    } catch {
      // Invalid regex patterns are silently ignored
    }
  }
  
  return matches;
}

/**
 * Extract content between delimiters using regex
 */
export function extractBetween(
  text: string, 
  startPattern: string, 
  endPattern: string
): string[] {
  const regex = new RegExp(`${startPattern}([\\s\\S]*?)${endPattern}`, 'g');
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Split text by pattern while preserving the delimiters
 */
export function splitPreservingDelimiters(text: string, pattern: string): string[] {
  const regex = new RegExp(`(${pattern})`, 'g');
  return text.split(regex).filter(Boolean);
}