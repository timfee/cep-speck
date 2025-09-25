/**
 * @fileoverview Jest Test Setup
 */

import "@testing-library/jest-dom";

// Make React available globally for JSX
import React from "react";
(global as any).React = React;

// Mock Next.js router
jest.mock("next/navigation", () => ({
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
  usePathname: () => "/",
}));

// Mock server actions used by components - create simple mock functions
const mockGenerateContentOutlineAction = jest.fn();
const mockGeneratePRDContentAction = jest.fn();

// Make mocks available globally for test configuration
(global as any).mockGenerateContentOutlineAction = mockGenerateContentOutlineAction;
(global as any).mockGeneratePRDContentAction = mockGeneratePRDContentAction;

jest.mock("../src/actions/generate-outline", () => ({
  generateContentOutlineAction: mockGenerateContentOutlineAction,
}));

jest.mock("../src/actions/generate-prd", () => ({
  generatePRDContentAction: mockGeneratePRDContentAction,
}));

// Keep the original AI lib mocks for AI service tests
jest.mock("../src/lib/ai", () => ({
  generatePRDContent: jest.fn(),
  generateContentOutline: jest.fn(),
}));

// Mock environment variables
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
