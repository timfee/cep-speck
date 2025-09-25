/**
 * @fileoverview Wizard Navigation and Progress Components Tests
 */

import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom'

import { ProgressTimeline, WizardNavigation } from '../src/components/wizard'

describe('Wizard Components', () => {
  describe('ProgressTimeline', () => {
    it('should display correct progress for current step', () => {
      render(
        <ProgressTimeline 
          currentStep="outline" 
          completedSteps={['idea']} 
        />
      )

      expect(screen.getByText('Progress')).toBeInTheDocument()
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
      expect(screen.getByText('Content Outline • 40% complete')).toBeInTheDocument()
    })

    it('should show all workflow steps', () => {
      render(
        <ProgressTimeline 
          currentStep="idea" 
          completedSteps={[]} 
        />
      )

      expect(screen.getByText('Idea Capture')).toBeInTheDocument()
      expect(screen.getByText('Content Outline')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Settings')).toBeInTheDocument()
      expect(screen.getByText('Generate PRD')).toBeInTheDocument()
      expect(screen.getByText('PRD Complete')).toBeInTheDocument()
    })

    it('should mark completed steps correctly', () => {
      render(
        <ProgressTimeline 
          currentStep="settings" 
          completedSteps={['idea', 'outline']} 
        />
      )

      // Should have "Complete" badges for completed steps
      const completeBadges = screen.getAllByText('Complete')
      expect(completeBadges).toHaveLength(2)

      // Should have "Current" badge for current step
      expect(screen.getByText('Current')).toBeInTheDocument()
    })

    it('should show step numbers correctly', () => {
      render(
        <ProgressTimeline 
          currentStep="generate" 
          completedSteps={['idea', 'outline', 'settings']} 
        />
      )

      // Check that step numbers are displayed
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should calculate progress percentage correctly', () => {
      const testCases = [
        { step: 'idea', expected: '20% complete' },
        { step: 'outline', expected: '40% complete' },
        { step: 'settings', expected: '60% complete' },
        { step: 'generate', expected: '80% complete' },
        { step: 'complete', expected: '100% complete' }
      ]

      for (const { step, expected } of testCases) {
        render(
          <ProgressTimeline 
            currentStep={step as any} 
            completedSteps={[]} 
          />
        )
        
        expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
      }
    })

    it('should show step descriptions', () => {
      render(
        <ProgressTimeline 
          currentStep="idea" 
          completedSteps={[]} 
        />
      )

      expect(screen.getByText('Describe your product concept')).toBeInTheDocument()
      expect(screen.getByText('Review functional requirements & metrics')).toBeInTheDocument()
      expect(screen.getByText('Configure deployment & security')).toBeInTheDocument()
      expect(screen.getByText('Create final document')).toBeInTheDocument()
      expect(screen.getByText('Review generated document')).toBeInTheDocument()
    })
  })

  describe('WizardNavigation', () => {
    const mockOnNext = jest.fn()
    const mockOnBack = jest.fn()
    const mockOnStartOver = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should render navigation buttons correctly', () => {
      render(
        <WizardNavigation
          currentStep="outline"
          canGoNext={true}
          canGoBack={true}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      expect(screen.getByRole('button', { name: /← previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next →/i })).toBeInTheDocument()
    })

    it('should disable Previous button when canGoBack is false', () => {
      render(
        <WizardNavigation
          currentStep="idea"
          canGoNext={true}
          canGoBack={false}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      const backButton = screen.getByRole('button', { name: /← previous/i })
      expect(backButton).toBeDisabled()
    })

    it('should disable Next button when canGoNext is false', () => {
      render(
        <WizardNavigation
          currentStep="idea"
          canGoNext={false}
          canGoBack={false}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      const nextButton = screen.getByRole('button', { name: /next →/i })
      expect(nextButton).toBeDisabled()
    })

    it('should call onNext when Next button is clicked', () => {
      render(
        <WizardNavigation
          currentStep="idea"
          canGoNext={true}
          canGoBack={false}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      const nextButton = screen.getByRole('button', { name: /next →/i })
      fireEvent.click(nextButton)

      expect(mockOnNext).toHaveBeenCalledTimes(1)
    })

    it('should call onBack when Previous button is clicked', () => {
      render(
        <WizardNavigation
          currentStep="outline"
          canGoNext={true}
          canGoBack={true}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      const backButton = screen.getByRole('button', { name: /← previous/i })
      fireEvent.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should call onStartOver when Start Over button is clicked', () => {
      render(
        <WizardNavigation
          currentStep="outline"
          canGoNext={true}
          canGoBack={true}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      const startOverButton = screen.getByRole('button', { name: /start over/i })
      fireEvent.click(startOverButton)

      expect(mockOnStartOver).toHaveBeenCalledTimes(1)
    })

    it('should show "Done" text on complete step', () => {
      render(
        <WizardNavigation
          currentStep="complete"
          canGoNext={false}
          canGoBack={true}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
    })

    it('should always enable Start Over button', () => {
      render(
        <WizardNavigation
          currentStep="idea"
          canGoNext={false}
          canGoBack={false}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onStartOver={mockOnStartOver}
        />
      )

      const startOverButton = screen.getByRole('button', { name: /start over/i })
      expect(startOverButton).not.toBeDisabled()
    })
  })
})