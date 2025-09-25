/**
 * @fileoverview Individual Step Components Tests
 */

import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom'

import { IdeaStep, OutlineStep, SettingsStep, GenerateStep, CompleteStep } from '../src/components/steps'

describe('Individual Step Components', () => {
  describe('IdeaStep', () => {
    const mockOnDataChange = jest.fn()
    const defaultData = { prompt: '' }

    beforeEach(() => {
      mockOnDataChange.mockClear()
    })

    it('should render idea step correctly', () => {
      render(<IdeaStep data={defaultData} onDataChange={mockOnDataChange} />)

      expect(screen.getByText('Describe Your Product Idea')).toBeInTheDocument()
      expect(screen.getByText(/Tell us about your product concept/)).toBeInTheDocument()
      expect(screen.getByLabelText('Product Description')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Describe your product idea here...')).toBeInTheDocument()
    })

    it('should show character count', () => {
      const dataWithText = { prompt: 'test prompt' }
      render(<IdeaStep data={dataWithText} onDataChange={mockOnDataChange} />)

      expect(screen.getByText('11 characters')).toBeInTheDocument()
    })

    it('should call onDataChange when text changes', () => {
      render(<IdeaStep data={defaultData} onDataChange={mockOnDataChange} />)

      const textarea = screen.getByPlaceholderText('Describe your product idea here...')
      fireEvent.change(textarea, { target: { value: 'new product idea' } })

      expect(mockOnDataChange).toHaveBeenCalledWith({
        prompt: 'new product idea'
      })
    })

    it('should show tip for short prompts', () => {
      render(<IdeaStep data={defaultData} onDataChange={mockOnDataChange} />)

      expect(screen.getByText(/💡 Tip: Provide at least a few sentences/)).toBeInTheDocument()
    })

    it('should hide tip for longer prompts', () => {
      const dataWithLongText = { prompt: 'This is a long enough prompt to hide the tip' }
      render(<IdeaStep data={dataWithLongText} onDataChange={mockOnDataChange} />)

      expect(screen.queryByText(/💡 Tip: Provide at least a few sentences/)).not.toBeInTheDocument()
    })
  })

  describe('OutlineStep', () => {
    const mockOnGenerate = jest.fn()
    const defaultData = { prompt: '' }

    beforeEach(() => {
      mockOnGenerate.mockClear()
    })

    it('should render outline step correctly', () => {
      render(<OutlineStep data={defaultData} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('Content Outline')).toBeInTheDocument()
    })

    it('should show generate button when no outline exists', () => {
      render(<OutlineStep data={defaultData} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      const generateButton = screen.getByRole('button', { name: /generate outline/i })
      expect(generateButton).toBeInTheDocument()

      fireEvent.click(generateButton)
      expect(mockOnGenerate).toHaveBeenCalled()
    })

    it('should show loading state when pending', () => {
      render(<OutlineStep data={defaultData} onDataChange={jest.fn()} isPending={true} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('Generating outline...')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /generate outline/i })).not.toBeInTheDocument()
    })

    it('should display outline content when available', () => {
      const dataWithOutline = {
        prompt: '',
        outline: {
          functional_requirements: [
            { id: '1', title: 'Test Requirement', description: 'Test description' }
          ],
          success_metrics: [
            { id: '1', name: 'Test Metric', target: '90%' }
          ],
          milestones: [
            { id: '1', title: 'Test Milestone', timeline: '1 month' }
          ]
        }
      }

      render(<OutlineStep data={dataWithOutline} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('Functional Requirements')).toBeInTheDocument()
      expect(screen.getByText('Test Requirement')).toBeInTheDocument()
      expect(screen.getByText('Success Metrics')).toBeInTheDocument()
      expect(screen.getByText('Test Metric')).toBeInTheDocument()
      expect(screen.getByText('Milestones')).toBeInTheDocument()
      expect(screen.getByText('Test Milestone')).toBeInTheDocument()
    })
  })

  describe('SettingsStep', () => {
    it('should render settings step correctly', () => {
      render(<SettingsStep />)

      expect(screen.getByText('Enterprise Settings')).toBeInTheDocument()
      expect(screen.getByText(/Configure deployment and security settings/)).toBeInTheDocument()
      expect(screen.getByText('Deployment Configuration')).toBeInTheDocument()
      expect(screen.getByText('Security Settings')).toBeInTheDocument()
    })

    it('should show predefined configuration options', () => {
      render(<SettingsStep />)

      expect(screen.getByText('Standard cloud deployment selected')).toBeInTheDocument()
      expect(screen.getByText('Enterprise security policies applied')).toBeInTheDocument()
    })
  })

  describe('GenerateStep', () => {
    const mockOnGenerate = jest.fn()
    const defaultData = { prompt: '' }

    beforeEach(() => {
      mockOnGenerate.mockClear()
    })

    it('should render generate step correctly', () => {
      render(<GenerateStep data={defaultData} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('Generate PRD')).toBeInTheDocument()
    })

    it('should show generate button when no PRD exists', () => {
      render(<GenerateStep data={defaultData} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      const generateButton = screen.getByRole('button', { name: /generate prd/i })
      expect(generateButton).toBeInTheDocument()

      fireEvent.click(generateButton)
      expect(mockOnGenerate).toHaveBeenCalled()
    })

    it('should show loading state when pending', () => {
      render(<GenerateStep data={defaultData} onDataChange={jest.fn()} isPending={true} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('Generating PRD...')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /generate prd/i })).not.toBeInTheDocument()
    })

    it('should display PRD content when available', () => {
      const dataWithPRD = {
        prompt: '',
        prd: {
          title: 'Test PRD Title',
          overview: 'Test overview description',
          objectives: ['Objective 1', 'Objective 2'],
          requirements: [
            { title: 'Requirement 1', description: 'Description 1', priority: 'high' as const },
            { title: 'Requirement 2', description: 'Description 2', priority: 'medium' as const }
          ],
          timeline: '6 months',
          success_metrics: ['Metric 1', 'Metric 2']
        }
      }

      render(<GenerateStep data={dataWithPRD} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('Test PRD Title')).toBeInTheDocument()
      expect(screen.getByText('Test overview description')).toBeInTheDocument()
      expect(screen.getByText('Objectives')).toBeInTheDocument()
      expect(screen.getByText('Objective 1')).toBeInTheDocument()
      expect(screen.getByText('Requirements')).toBeInTheDocument()
      expect(screen.getByText('Requirement 1')).toBeInTheDocument()
      expect(screen.getByText('Timeline')).toBeInTheDocument()
      expect(screen.getByText('6 months')).toBeInTheDocument()
      expect(screen.getByText('Success Metrics')).toBeInTheDocument()
      expect(screen.getByText('Metric 1')).toBeInTheDocument()
    })

    it('should show priority badges correctly', () => {
      const dataWithPRD = {
        prompt: '',
        prd: {
          title: 'Test PRD',
          overview: 'Test overview',
          objectives: ['Objective 1'],
          requirements: [
            { title: 'High Priority', description: 'High desc', priority: 'high' as const },
            { title: 'Medium Priority', description: 'Medium desc', priority: 'medium' as const },
            { title: 'Low Priority', description: 'Low desc', priority: 'low' as const }
          ],
          timeline: '3 months',
          success_metrics: ['Metric 1']
        }
      }

      render(<GenerateStep data={dataWithPRD} onDataChange={jest.fn()} onGenerate={mockOnGenerate} />)

      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
      expect(screen.getByText('low')).toBeInTheDocument()
    })
  })

  describe('CompleteStep', () => {
    it('should render complete step correctly', () => {
      render(<CompleteStep />)

      expect(screen.getByText('PRD Complete!')).toBeInTheDocument()
      expect(screen.getByText(/Your Product Requirements Document has been generated successfully/)).toBeInTheDocument()
    })

    it('should show action buttons', () => {
      render(<CompleteStep />)

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share prd/i })).toBeInTheDocument()
    })
  })
})