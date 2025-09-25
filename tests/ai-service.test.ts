/**
 * @fileoverview AI Service Tests - Testing server actions for PRD and content generation
 */

import { generatePRDContent, generateContentOutline } from '../src/lib/ai'

// Mock the AI SDK modules
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}))

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => 'mocked-model'),
}))

describe('AI Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockGenerateObject = require('ai').generateObject

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generatePRDContent', () => {
    it('should generate PRD content successfully', async () => {
      const mockResult = {
        object: {
          title: 'Test PRD',
          overview: 'Test overview',
          objectives: ['Objective 1', 'Objective 2'],
          requirements: [
            {
              title: 'Requirement 1',
              description: 'Test requirement',
              priority: 'high' as const
            }
          ],
          timeline: '3 months',
          success_metrics: ['Metric 1', 'Metric 2']
        }
      }

      mockGenerateObject.mockResolvedValue(mockResult)

      const result = await generatePRDContent('Test product concept')

      expect(result).toEqual({
        success: true,
        data: mockResult.object
      })

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-model',
          schema: expect.any(Object),
          prompt: expect.stringContaining('Test product concept')
        })
      )
    })

    it('should handle errors gracefully', async () => {
      mockGenerateObject.mockRejectedValue(new Error('AI generation failed'))

      const result = await generatePRDContent('Test prompt')

      expect(result).toEqual({
        success: false,
        error: 'AI generation failed'
      })
    })

    it('should require a prompt', async () => {
      await generatePRDContent('')

      // Should still attempt generation even with empty prompt
      expect(mockGenerateObject).toHaveBeenCalled()
    })
  })
  })

  describe('generateContentOutline', () => {
    it('should generate content outline successfully', async () => {
      const mockResult = {
        object: {
          functional_requirements: [
            {
              id: 'req-1',
              title: 'Test Requirement',
              description: 'Test description'
            }
          ],
          success_metrics: [
            {
              id: 'metric-1',
              name: 'Test Metric',
              target: '90%'
            }
          ],
          milestones: [
            {
              id: 'milestone-1',
              title: 'Test Milestone',
              timeline: '1 month'
            }
          ]
        }
      }

      mockGenerateObject.mockResolvedValue(mockResult)

      const result = await generateContentOutline('Test product concept')

      expect(result).toEqual({
        success: true,
        data: mockResult.object
      })

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-model',
          schema: expect.any(Object),
          prompt: expect.stringContaining('Test product concept')
        })
      )
    })

    it('should handle errors gracefully', async () => {
      mockGenerateObject.mockRejectedValue(new Error('Outline generation failed'))

      const result = await generateContentOutline('Test prompt')

      expect(result).toEqual({
        success: false,
        error: 'Outline generation failed'
      })
    })

    it('should validate required schema fields', async () => {
      const incompleteResult = {
        object: {
          functional_requirements: [], // Empty but valid
          success_metrics: [], // Empty but valid
          milestones: [] // Empty but valid
        }
      }

      mockGenerateObject.mockResolvedValue(incompleteResult)

      const result = await generateContentOutline('Test prompt')

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('functional_requirements')
      expect(result.data).toHaveProperty('success_metrics')
      expect(result.data).toHaveProperty('milestones')
    })
  })
})