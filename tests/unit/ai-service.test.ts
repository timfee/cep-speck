import { generateObject } from 'ai'

// Don't use the global mock for this test file
jest.unmock('../../src/lib/ai')

// Mock server-only
jest.mock('server-only', () => {})

import { generatePRDContent, generateContentOutline } from '../../src/lib/ai'

// Mock the ai module
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}))

// Mock the google provider
jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => () => 'mock-model'),
}))

const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock environment variable
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-api-key'
  })

  describe('generatePRDContent', () => {
    it('should generate PRD content successfully', async () => {
      const mockResult = {
        object: {
          title: 'Test Product',
          overview: 'A comprehensive test product overview',
          objectives: ['Objective 1', 'Objective 2'],
          requirements: [
            {
              title: 'Requirement 1',
              description: 'Description of requirement 1',
              priority: 'high' as const
            }
          ],
          timeline: 'Q1 2024',
          success_metrics: ['Metric 1', 'Metric 2']
        }
      }

      mockGenerateObject.mockResolvedValue(mockResult)

      const result = await generatePRDContent('Test product concept')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult.object)
    })

    it('should handle errors gracefully', async () => {
      mockGenerateObject.mockRejectedValue(new Error('API Error'))

      const result = await generatePRDContent('Test prompt')

      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
    })
  })

  describe('generateContentOutline', () => {
    it('should generate content outline successfully', async () => {
      const mockResult = {
        object: {
          functional_requirements: [
            {
              id: 'req1',
              title: 'Requirement 1',
              description: 'Description of requirement 1'
            }
          ],
          success_metrics: [
            {
              id: 'metric1',
              name: 'Metric 1',
              target: '95% accuracy'
            }
          ],
          milestones: [
            {
              id: 'milestone1',
              title: 'Milestone 1',
              timeline: 'Q1 2024'
            }
          ]
        }
      }

      mockGenerateObject.mockResolvedValue(mockResult)

      const result = await generateContentOutline('Test product concept')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult.object)
    })
  })
})