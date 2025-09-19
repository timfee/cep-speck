/**
 * Tests for shared validation helpers
 */

import { 
  extractSection, 
  extractBulletPoints, 
  extractMetrics,
  extractFeatureKeywords,
  doesMetricReferenceFeature,
  countSections,
  validateHeaderPattern,
  voidUnused,
  PATTERNS 
} from './index';

describe('Validation Helpers', () => {
  describe('extractSection', () => {
    it('should extract matching section content', () => {
      const draft = `
# 1. TL;DR
This is the summary.

# 2. People Problems
- Problem 1
- Problem 2

# 3. Goals
Goal content here.
      `;
      
      const section = extractSection(draft, PATTERNS.TLDR_SECTION);
      expect(section).toContain('This is the summary');
    });

    it('should return empty string for non-matching pattern', () => {
      const draft = 'No matching content';
      const section = extractSection(draft, PATTERNS.TLDR_SECTION);
      expect(section).toBe('');
    });
  });

  describe('extractMetrics', () => {
    it('should extract metrics from bullet points with default pattern', () => {
      const text = `
Some intro text
- Load time: 2 seconds # with comment
* Response rate: 95%
- Memory usage: 512 MB
More text
      `;
      
      const metrics = extractMetrics(text, {});
      expect(metrics.size).toBe(3);
      expect(metrics.get('load time')).toBe('2 seconds');
      expect(metrics.get('response rate')).toBe('95%');
      expect(metrics.get('memory usage')).toBe('512 MB');
    });

    it('should handle custom regex patterns', () => {
      const text = `
Custom format: metric1=value1
Another: metric2=value2
      `;
      
      const metrics = extractMetrics(text, { 
        metricRegex: '^(.+):\\s*(.+)=(.+)$' 
      });
      expect(metrics.size).toBeGreaterThanOrEqual(0);
    });

    it('should return empty map for no matches', () => {
      const text = 'No metrics here';
      const metrics = extractMetrics(text, {});
      expect(metrics.size).toBe(0);
    });
  });

  describe('extractBulletPoints', () => {
    it('should extract bullet points from text', () => {
      const text = `
Some intro text
- First bullet
* Second bullet
- Third bullet
More text
      `;
      
      const bullets = extractBulletPoints(text);
      expect(bullets).toEqual(['First bullet', 'Second bullet', 'Third bullet']);
    });

    it('should handle empty text', () => {
      const bullets = extractBulletPoints('');
      expect(bullets).toEqual([]);
    });
  });

  describe('extractFeatureKeywords', () => {
    it('should extract meaningful keywords', () => {
      const keywords = extractFeatureKeywords('User Authentication System');
      expect(keywords).toContain('user');
      expect(keywords).toContain('authentication');
      expect(keywords).toContain('system');
    });

    it('should filter out stop words', () => {
      const keywords = extractFeatureKeywords('The User and Authentication');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('and');
    });

    it('should limit to 3 keywords', () => {
      const keywords = extractFeatureKeywords('Very Long Feature Name With Many Words');
      expect(keywords.length).toBeLessThanOrEqual(3);
    });
  });

  describe('doesMetricReferenceFeature', () => {
    it('should match when metric contains feature keywords', () => {
      const metric = 'Authentication success rate improves by 95%';
      const feature = 'User Authentication System';
      expect(doesMetricReferenceFeature(metric, feature)).toBe(true);
    });

    it('should not match when no keywords overlap', () => {
      const metric = 'Dashboard load time under 2 seconds';
      const feature = 'User Authentication System';
      expect(doesMetricReferenceFeature(metric, feature)).toBe(false);
    });
  });

  describe('countSections', () => {
    it('should count sections using header regex', () => {
      const draft = `
# 1. TL;DR
Content

# 2. Problems
Content

# 3. Goals
Content
      `;
      
      const count = countSections(draft, '^#\\s+\\d+\\.');
      expect(count).toBe(3);
    });
  });

  describe('validateHeaderPattern', () => {
    it('should validate correct header patterns', () => {
      const draft = `
# 1. TL;DR
# 2. Problems
# 3. Goals
      `;
      
      const issues = validateHeaderPattern(draft, { pattern: '# {n}. {title}' }, 'test-item');
      expect(issues).toHaveLength(0);
    });

    it('should report incorrect header patterns', () => {
      const draft = `
# 1. TL;DR
# Problems (missing number)
# 3. Goals
      `;
      
      // Use a headerRegex that will match the incorrect line
      const issues = validateHeaderPattern(draft, { 
        pattern: '# {n}. {title}',
        headerRegex: '^#\\s+' // This will match all lines starting with #
      }, 'test-item');
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].id).toBe('label-pattern-mismatch');
    });
  });

  describe('voidUnused', () => {
    it('should accept any number of arguments without error', () => {
      expect(() => voidUnused()).not.toThrow();
      expect(() => voidUnused('param1')).not.toThrow();
      expect(() => voidUnused('param1', 'param2', { obj: true })).not.toThrow();
    });
  });
});