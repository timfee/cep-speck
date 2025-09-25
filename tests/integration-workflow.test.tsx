/**
 * @fileoverview Integration Tests - Full Application Workflow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom'

import { PRDWizard } from '../src/components/prd-wizard'

// Mock the AI service with realistic responses
const mockGeneratePRDContent = jest.fn()
const mockGenerateContentOutline = jest.fn()

jest.mock('../src/lib/ai', () => ({
  generatePRDContent: mockGeneratePRDContent,
  generateContentOutline: mockGenerateContentOutline,
}))

describe('PRD Wizard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup realistic mock responses
    mockGenerateContentOutline.mockResolvedValue({
      success: true,
      data: {
        functional_requirements: [
          {
            id: 'req-1',
            title: 'Document Analysis Engine',
            description: 'AI-powered engine for analyzing and extracting insights from various document formats'
          },
          {
            id: 'req-2',
            title: 'Natural Language Query Interface',
            description: 'User-friendly interface for asking questions about document content in natural language'
          }
        ],
        success_metrics: [
          {
            id: 'metric-1',
            name: 'Document Processing Speed',
            target: '< 5 seconds per document'
          },
          {
            id: 'metric-2',
            name: 'Query Accuracy',
            target: '> 95% relevant responses'
          }
        ],
        milestones: [
          {
            id: 'milestone-1',
            title: 'Core Engine Development',
            timeline: '2 months'
          },
          {
            id: 'milestone-2',
            title: 'Beta Release',
            timeline: '3 months'
          }
        ]
      }
    })

    mockGeneratePRDContent.mockResolvedValue({
      success: true,
      data: {
        title: 'Smart Document Assistant - Product Requirements Document',
        overview: 'An AI-powered document analysis and insight generation tool designed for knowledge workers and professionals. The system provides intelligent document summarization, natural language Q&A capabilities, and automated insights extraction to enhance productivity.',
        objectives: [
          'Reduce document review time by 70%',
          'Improve information discovery and retrieval',
          'Enable natural language interaction with document content',
          'Provide actionable insights from complex documents'
        ],
        requirements: [
          {
            title: 'Multi-format Document Support',
            description: 'Support for PDF, Word, PowerPoint, and text documents with accurate content extraction',
            priority: 'high'
          },
          {
            title: 'Real-time AI Analysis',
            description: 'Process documents and generate summaries within 5 seconds',
            priority: 'high'
          },
          {
            title: 'Natural Language Query System',
            description: 'Allow users to ask questions about document content in conversational language',
            priority: 'medium'
          },
          {
            title: 'Insights Dashboard',
            description: 'Visual dashboard showing key themes, entities, and insights from analyzed documents',
            priority: 'medium'
          }
        ],
        timeline: 'MVP delivery in 3 months, full product launch in 6 months',
        success_metrics: [
          'Time to process standard document: < 5 seconds',
          'Query response accuracy: > 95%',
          'User satisfaction score: > 4.5/5',
          'Monthly active users: 1000+ by month 6'
        ]
      }
    })
  })

  it('should complete the full PRD generation workflow', async () => {
    render(<PRDWizard />)

    // Step 1: Idea Capture
    expect(screen.getByText('Structured PRD Wizard')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    const productDescription = `Smart Document Assistant: AI-powered document analysis and insight generation for knowledge workers and professionals. 

Key Features:
- Document summarization using advanced NLP
- Q&A capabilities for natural language queries
- Insights extraction and visualization
- Support for multiple document formats (PDF, Word, PowerPoint)

Target Users: Enterprise knowledge workers, researchers, consultants, and legal professionals

Objectives:
- Reduce document review time by 70%
- Improve information discovery and retrieval
- Enable faster decision-making through automated insights

Timeline: MVP in 3 months, full product launch in 6 months`

    fireEvent.change(textarea, { target: { value: productDescription } })

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeEnabled()

    // Navigate to Step 2: Content Outline
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    })

    // Should show loading initially
    expect(screen.getByText('Generating outline...')).toBeInTheDocument()

    // Wait for outline content to appear
    await waitFor(() => {
      expect(screen.getByText('Document Analysis Engine')).toBeInTheDocument()
      expect(screen.getByText('Natural Language Query Interface')).toBeInTheDocument()
      expect(screen.getByText('Document Processing Speed')).toBeInTheDocument()
      expect(screen.getByText('Core Engine Development')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(mockGenerateContentOutline).toHaveBeenCalledWith(productDescription)

    // Navigate to Step 3: Enterprise Settings
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Enterprise Settings')).toBeInTheDocument()
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
    })

    expect(screen.getByText('Configure deployment and security settings')).toBeInTheDocument()
    expect(screen.getByText('Standard cloud deployment selected')).toBeInTheDocument()
    expect(screen.getByText('Enterprise security policies applied')).toBeInTheDocument()

    // Navigate to Step 4: Generate PRD
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Generate PRD')).toBeInTheDocument()
      expect(screen.getByText('Step 4 of 5')).toBeInTheDocument()
    })

    // Should show loading initially
    expect(screen.getByText('Generating PRD...')).toBeInTheDocument()

    // Wait for PRD content to appear
    await waitFor(() => {
      expect(screen.getByText('Smart Document Assistant - Product Requirements Document')).toBeInTheDocument()
      expect(screen.getByText('An AI-powered document analysis and insight generation tool')).toBeInTheDocument()
      expect(screen.getByText('Multi-format Document Support')).toBeInTheDocument()
      expect(screen.getByText('Real-time AI Analysis')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(mockGeneratePRDContent).toHaveBeenCalledWith(productDescription)

    // Check priority badges are displayed correctly
    expect(screen.getAllByText('high')).toHaveLength(2)
    expect(screen.getAllByText('medium')).toHaveLength(2)

    // Check objectives and metrics are displayed
    expect(screen.getByText('Reduce document review time by 70%')).toBeInTheDocument()
    expect(screen.getByText('Time to process standard document: < 5 seconds')).toBeInTheDocument()

    // Navigate to Step 5: Complete
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('PRD Complete!')).toBeInTheDocument()
      expect(screen.getByText('Step 5 of 5')).toBeInTheDocument()
    })

    expect(screen.getByText('Your Product Requirements Document has been generated successfully.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share prd/i })).toBeInTheDocument()

    // Verify the Done button is shown instead of Next
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('should handle AI service errors gracefully', async () => {
    mockGenerateContentOutline.mockResolvedValue({
      success: false,
      error: 'API rate limit exceeded'
    })

    render(<PRDWizard />)

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'Test product for error handling workflow' } })

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    // Should eventually show the Generate Outline button instead of content
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate outline/i })).toBeInTheDocument()
    })

    // User can retry generation manually
    const generateButton = screen.getByRole('button', { name: /generate outline/i })
    fireEvent.click(generateButton)

    expect(mockGenerateContentOutline).toHaveBeenCalledTimes(2)
  })

  it('should preserve data when navigating backward', async () => {
    render(<PRDWizard />)

    const originalText = 'Original product concept that should be preserved'
    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: originalText } })

    // Navigate forward two steps
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Enterprise Settings')).toBeInTheDocument()
    })

    // Navigate back to the beginning
    const backButton = screen.getByRole('button', { name: /previous/i })
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Describe Your Product Idea')).toBeInTheDocument()
    })

    // Original text should be preserved
    expect(screen.getByDisplayValue(originalText)).toBeInTheDocument()
  })

  it('should handle start over functionality correctly', async () => {
    render(<PRDWizard />)

    // Enter data and navigate to step 3
    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'Test product for start over workflow' } })

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Enterprise Settings')).toBeInTheDocument()
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
    })

    // Click start over
    const startOverButton = screen.getByRole('button', { name: /start over/i })
    fireEvent.click(startOverButton)

    // Should reset to step 1 with empty form
    await waitFor(() => {
      expect(screen.getByText('Describe Your Product Idea')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    })

    const resetTextarea = screen.getByPlaceholderText('Describe your product idea here...')
    expect(resetTextarea).toHaveValue('')

    // Progress should show no completed steps
    expect(screen.queryByText('Complete')).not.toBeInTheDocument()
  })
})