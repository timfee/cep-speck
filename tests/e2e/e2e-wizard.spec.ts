/**
 * @fileoverview End-to-End Tests for PRD Wizard using Playwright
 */

import { test, expect } from '@playwright/test'

test.describe('PRD Wizard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should render the PRD wizard homepage', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Structured PRD Wizard')
    await expect(page.locator('text=Create comprehensive PRDs')).toBeVisible()
    await expect(page.locator('text=Describe Your Product Idea')).toBeVisible()
  })

  test('should show progress timeline correctly', async ({ page }) => {
    await expect(page.locator('text=Progress')).toBeVisible()
    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
    await expect(page.locator('text=Idea Capture • 20% complete')).toBeVisible()
    
    // Check all 5 steps are shown
    await expect(page.locator('text=Idea Capture')).toBeVisible()
    await expect(page.locator('text=Content Outline')).toBeVisible()
    await expect(page.locator('text=Enterprise Settings')).toBeVisible()
    await expect(page.locator('text=Generate PRD')).toBeVisible()
    await expect(page.locator('text=PRD Complete')).toBeVisible()
  })

  test('should validate prompt input and enable/disable Next button', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    const nextButton = page.getByRole('button', { name: /next/i })
    
    // Initially Next should be disabled
    await expect(nextButton).toBeDisabled()
    
    // Type short text - should still be disabled
    await textarea.fill('short')
    await expect(nextButton).toBeDisabled()
    
    // Type longer text - should be enabled
    await textarea.fill('This is a comprehensive product description for a smart document assistant that helps knowledge workers and professionals with AI-powered analysis.')
    await expect(nextButton).toBeEnabled()
    
    // Character count should update
    await expect(page.locator('text=characters')).toBeVisible()
  })

  test('should navigate through wizard steps', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    const nextButton = page.getByRole('button', { name: /next/i })
    const backButton = page.getByRole('button', { name: /previous/i })
    
    // Fill in the idea
    const productIdea = 'Smart Document Assistant: AI-powered document analysis and insight generation for knowledge workers. Key features include document summarization, Q&A capabilities, and insights extraction. Target timeline: MVP in 3 months.'
    await textarea.fill(productIdea)
    
    // Go to Content Outline step
    await nextButton.click()
    await expect(page.locator('text=Content Outline')).toBeVisible()
    await expect(page.locator('text=Step 2 of 5')).toBeVisible()
    
    // Should show either loading or generated content
    const isLoading = await page.locator('text=Generating outline...').isVisible()
    if (isLoading) {
      // Wait for content to load or show generate button
      await page.waitForTimeout(2000)
    }
    
    // Navigate to Enterprise Settings
    await nextButton.click()
    await expect(page.locator('text=Enterprise Settings')).toBeVisible()
    await expect(page.locator('text=Step 3 of 5')).toBeVisible()
    await expect(page.locator('text=Configure deployment and security')).toBeVisible()
    
    // Navigate to Generate PRD
    await nextButton.click()
    await expect(page.locator('text=Generate PRD')).toBeVisible()
    await expect(page.locator('text=Step 4 of 5')).toBeVisible()
    
    // Test back navigation
    await backButton.click()
    await expect(page.locator('text=Enterprise Settings')).toBeVisible()
    
    await backButton.click()
    await expect(page.locator('text=Content Outline')).toBeVisible()
  })

  test('should handle Start Over functionality', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    const startOverButton = page.getByRole('button', { name: /start over/i })
    const nextButton = page.getByRole('button', { name: /next/i })
    
    // Fill in some content and navigate
    await textarea.fill('Test product for start over functionality')
    await nextButton.click()
    
    // Should be on step 2
    await expect(page.locator('text=Content Outline')).toBeVisible()
    
    // Click start over
    await startOverButton.click()
    
    // Should be back to step 1 with empty form
    await expect(page.locator('text=Describe Your Product Idea')).toBeVisible()
    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
    await expect(textarea).toHaveValue('')
  })

  test('should show validation tip for short prompts', async ({ page }) => {
    const tip = page.locator('text=💡 Tip: Provide at least a few sentences')
    
    // Tip should be visible initially
    await expect(tip).toBeVisible()
    
    // Type enough text to hide tip
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    await textarea.fill('This is a longer product description that should be sufficient for validation.')
    
    // Tip should be hidden
    await expect(tip).not.toBeVisible()
  })

  test('should display character count correctly', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    
    // Initially 0 characters
    await expect(page.locator('text=0 characters')).toBeVisible()
    
    // Type some text
    const testText = 'Test product'
    await textarea.fill(testText)
    
    // Should show character count
    await expect(page.locator(`text=${testText.length} characters`)).toBeVisible()
  })

  test('should handle wizard completion flow', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    const nextButton = page.getByRole('button', { name: /next/i })
    
    // Complete the full wizard flow
    await textarea.fill('Comprehensive AI-powered productivity tool for enterprise teams. Features include automated report generation, smart scheduling, and collaborative workspaces. Target users are enterprise knowledge workers. Timeline: 6 months to full launch.')
    
    // Navigate through all steps
    for (let step = 1; step < 5; step++) {
      await nextButton.click()
      await page.waitForTimeout(500) // Small delay for transitions
      
      // Check we're on the expected step
      await expect(page.locator(`text=Step ${step + 1} of 5`)).toBeVisible()
    }
    
    // Should reach the complete step
    await expect(page.locator('text=PRD Complete!')).toBeVisible()
    await expect(page.locator('text=Your Product Requirements Document has been generated successfully')).toBeVisible()
    
    // Should show completion actions
    await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /share prd/i })).toBeVisible()
  })

  test('should validate responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that key elements are still visible and usable
    await expect(page.locator('h1')).toContainText('Structured PRD Wizard')
    await expect(page.getByPlaceholder('Describe your product idea here...')).toBeVisible()
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible()
    
    // Check that progress timeline is still functional
    await expect(page.locator('text=Progress')).toBeVisible()
    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
  })

  test('should maintain state during navigation', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    const nextButton = page.getByRole('button', { name: /next/i })
    const backButton = page.getByRole('button', { name: /previous/i })
    
    const originalText = 'This is my original product idea that should be preserved during navigation'
    
    // Enter text and navigate forward
    await textarea.fill(originalText)
    await nextButton.click()
    await nextButton.click() // Go to step 3
    
    // Navigate back to step 1
    await backButton.click()
    await backButton.click()
    
    // Text should be preserved
    await expect(textarea).toHaveValue(originalText)
  })

  test('should handle keyboard navigation', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe your product idea here...')
    
    // Focus the textarea using keyboard
    await page.keyboard.press('Tab')
    await expect(textarea).toBeFocused()
    
    // Type using keyboard
    await page.keyboard.type('Product idea typed with keyboard navigation')
    
    // Navigate to next button using Tab
    await page.keyboard.press('Tab') // Skip character count
    await page.keyboard.press('Tab') // Skip tip
    await page.keyboard.press('Tab') // Skip Previous button (disabled)
    await page.keyboard.press('Tab') // Skip Start Over button
    await page.keyboard.press('Tab') // Focus Next button
    
    const nextButton = page.getByRole('button', { name: /next/i })
    await expect(nextButton).toBeFocused()
    
    // Activate with keyboard
    await page.keyboard.press('Enter')
    
    // Should navigate to next step
    await expect(page.locator('text=Content Outline')).toBeVisible()
  })
})