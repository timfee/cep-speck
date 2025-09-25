/**
 * @fileoverview PRD Wizard Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom'

import { PRDWizard } from '../src/components/prd-wizard'

// Mock the AI service
jest.mock('../src/lib/ai', () => ({
  generatePRDContent: jest.fn(),
  generateContentOutline: jest.fn(),
}))

describe('PRDWizard Component', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockGenerateContentOutline = require('../src/lib/ai').generateContentOutline

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the initial idea capture step', () => {
    render(<PRDWizard />)

    expect(screen.getByText('Structured PRD Wizard')).toBeInTheDocument()
    expect(screen.getByText('Create comprehensive PRDs through a guided, step-by-step process')).toBeInTheDocument()
    expect(screen.getByText('Describe Your Product Idea')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe your product idea here...')).toBeInTheDocument()
  })

  it('should show progress correctly', () => {
    render(<PRDWizard />)

    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(screen.getByText(/Idea Capture.*20% complete/)).toBeInTheDocument()
  })

  it('should disable Next button when prompt is too short', () => {
    render(<PRDWizard />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'short' } })

    expect(nextButton).toBeDisabled()
  })

  it('should enable Next button when prompt is long enough', () => {
    render(<PRDWizard />)

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'This is a long enough product description for testing purposes.' } })

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('should show character count', () => {
    render(<PRDWizard />)

    expect(screen.getByText('0 characters')).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'test' } })

    expect(screen.getByText('4 characters')).toBeInTheDocument()
  })

  it('should show tip for short prompts', () => {
    render(<PRDWizard />)

    expect(screen.getByText(/💡 Tip: Provide at least a few sentences/)).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'This is a longer description that should hide the tip' } })

    expect(screen.queryByText(/💡 Tip: Provide at least a few sentences/)).not.toBeInTheDocument()
  })

  it('should navigate to outline step and auto-generate content', async () => {
    const mockOutlineData = {
      functional_requirements: [
        { id: '1', title: 'Test Requirement', description: 'Test desc' }
      ],
      success_metrics: [
        { id: '1', name: 'Test Metric', target: '90%' }
      ],
      milestones: [
        { id: '1', title: 'Test Milestone', timeline: '1 month' }
      ]
    }

    mockGenerateContentOutline.mockResolvedValue({
      success: true,
      data: mockOutlineData
    })

    render(<PRDWizard />)

    // Enter a valid prompt
    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'This is a comprehensive product description for testing the outline generation feature.' } })

    // Click Next to go to outline step
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    // Should show outline step header
    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    // Should show loading state initially
    expect(screen.getByText('Generating outline...')).toBeInTheDocument()

    // Wait for outline to load
    await waitFor(() => {
      expect(screen.getByText('Test Requirement')).toBeInTheDocument()
      expect(screen.getByText('Test Metric')).toBeInTheDocument()
      expect(screen.getByText('Test Milestone')).toBeInTheDocument()
    })

    expect(mockGenerateContentOutline).toHaveBeenCalledWith(
      'This is a comprehensive product description for testing the outline generation feature.'
    )
  })

  it('should allow going back to previous step', async () => {
    render(<PRDWizard />)

    // Go to outline step
    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'Valid product description for testing navigation.' } })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    // Go back
    const backButton = screen.getByRole('button', { name: /previous/i })
    expect(backButton).not.toBeDisabled()
    fireEvent.click(backButton)

    expect(screen.getByText('Describe Your Product Idea')).toBeInTheDocument()
  })

  it('should handle start over functionality', () => {
    render(<PRDWizard />)

    // Enter some text
    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'Some product description' } })

    expect(screen.getByDisplayValue('Some product description')).toBeInTheDocument()

    // Click start over
    const startOverButton = screen.getByRole('button', { name: /start over/i })
    fireEvent.click(startOverButton)

    // Should reset to empty state
    expect(screen.getByPlaceholderText('Describe your product idea here...')).toHaveValue('')
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })

  it('should display error state when AI generation fails', async () => {
    mockGenerateContentOutline.mockResolvedValue({
      success: false,
      error: 'AI service unavailable'
    })

    render(<PRDWizard />)

    const textarea = screen.getByPlaceholderText('Describe your product idea here...')
    fireEvent.change(textarea, { target: { value: 'Test product for error handling' } })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    // Should show Generate Outline button instead of content
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate outline/i })).toBeInTheDocument()
    })
  })
})