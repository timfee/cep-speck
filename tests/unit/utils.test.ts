/**
 * @fileoverview Utility Functions Tests
 */

import { 
  cn, 
  sanitizeText, 
  calculateProgress, 
  getStepIndex, 
  getStepInfo, 
  sanitizeOptionalField,
  WORKFLOW_STEPS,
  type WorkflowStep 
} from '../../src/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', 'active', '')).toBe('base active')
    })

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('p-4 bg-red-500', 'bg-blue-500')).toBe('p-4 bg-blue-500')
    })
  })

  describe('sanitizeText', () => {
    it('should return trimmed text for valid input', () => {
      expect(sanitizeText('  hello world  ')).toBe('hello world')
    })

    it('should return undefined for empty or whitespace-only strings', () => {
      expect(sanitizeText('')).toBeUndefined()
      expect(sanitizeText('   ')).toBeUndefined()
      expect(sanitizeText('\n\t  ')).toBeUndefined()
    })

    it('should return undefined for null/undefined input', () => {
      expect(sanitizeText(undefined)).toBeUndefined()
      expect(sanitizeText(null as any)).toBeUndefined()
    })

    it('should handle normal strings without modification', () => {
      expect(sanitizeText('hello')).toBe('hello')
    })
  })

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(1, 5)).toBe(20)
      expect(calculateProgress(3, 5)).toBe(60)
      expect(calculateProgress(5, 5)).toBe(100)
    })

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 5)).toBe(0)
      expect(calculateProgress(1, 1)).toBe(100)
    })

    it('should round to nearest integer', () => {
      expect(calculateProgress(1, 3)).toBe(33) // 33.333... rounded to 33
      expect(calculateProgress(2, 3)).toBe(67) // 66.666... rounded to 67
    })
  })

  describe('WORKFLOW_STEPS constant', () => {
    it('should have the correct structure', () => {
      expect(WORKFLOW_STEPS).toHaveLength(5)
      
      for (const step of WORKFLOW_STEPS) {
        expect(step).toHaveProperty('id')
        expect(step).toHaveProperty('name')
        expect(step).toHaveProperty('description')
        expect(typeof step.id).toBe('string')
        expect(typeof step.name).toBe('string')
        expect(typeof step.description).toBe('string')
      }
    })

    it('should have the expected workflow steps', () => {
      const expectedSteps = ['idea', 'outline', 'settings', 'generate', 'complete']
      const actualSteps = WORKFLOW_STEPS.map(step => step.id)
      expect(actualSteps).toEqual(expectedSteps)
    })

    it('should have descriptive names and descriptions', () => {
      const ideaStep = WORKFLOW_STEPS[0]
      expect(ideaStep.id).toBe('idea')
      expect(ideaStep.name).toBe('Idea Capture')
      expect(ideaStep.description).toBe('Describe your product concept')
    })
  })

  describe('getStepIndex', () => {
    it('should return correct indices for valid steps', () => {
      expect(getStepIndex('idea')).toBe(0)
      expect(getStepIndex('outline')).toBe(1)
      expect(getStepIndex('settings')).toBe(2)
      expect(getStepIndex('generate')).toBe(3)
      expect(getStepIndex('complete')).toBe(4)
    })

    it('should return -1 for invalid steps', () => {
      expect(getStepIndex('invalid' as WorkflowStep)).toBe(-1)
    })
  })

  describe('getStepInfo', () => {
    it('should return correct step info for valid steps', () => {
      const ideaStep = getStepInfo('idea')
      expect(ideaStep).toBeDefined()
      expect(ideaStep?.id).toBe('idea')
      expect(ideaStep?.name).toBe('Idea Capture')
    })

    it('should return undefined for invalid steps', () => {
      expect(getStepInfo('invalid' as WorkflowStep)).toBeUndefined()
    })

    it('should return complete step info', () => {
      const completeStep = getStepInfo('complete')
      expect(completeStep).toEqual({
        id: 'complete',
        name: 'PRD Complete',
        description: 'Review generated document'
      })
    })
  })

  describe('sanitizeOptionalField', () => {
    it('should sanitize optional fields correctly', () => {
      expect(sanitizeOptionalField('  hello  ')).toBe('hello')
      expect(sanitizeOptionalField('')).toBeUndefined()
      expect(sanitizeOptionalField('   ')).toBeUndefined()
      expect(sanitizeOptionalField(undefined)).toBeUndefined()
      expect(sanitizeOptionalField(null)).toBeUndefined()
    })

    it('should handle normal strings', () => {
      expect(sanitizeOptionalField('normal text')).toBe('normal text')
    })
  })
})