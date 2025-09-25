/**
 * @fileoverview Jest Test Setup
 */

import '@testing-library/jest-dom'

// Make React available globally for JSX
import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).React = React

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock server actions globally - This will be overridden by individual test files
jest.mock('../src/lib/ai', () => ({
  generatePRDContent: jest.fn(),
  generateContentOutline: jest.fn(),
}))

// Mock environment variables
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key'

// Global test timeout
jest.setTimeout(30000)

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})