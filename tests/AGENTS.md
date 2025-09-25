# Test Suite - AI Agent Guide

Comprehensive test suite organized by test type for better maintainability.

## Directory Structure

- `unit/` - Unit tests for individual functions and components
- `integration/` - Integration tests for workflows and feature combinations  
- `e2e/` - End-to-end tests using Playwright for full user journeys

## Test Categories

### Unit Tests
- Component behavior and rendering
- Utility function correctness
- AI service integration mocks

### Integration Tests  
- Workflow state management
- Component interactions
- Server Action integration

### E2E Tests
- Complete user journeys through the PRD wizard
- Browser-based testing with Playwright
- Responsive design validation

## Guidelines

- Follow the existing test patterns in each directory
- Mock AI services in unit/integration tests
- Use Playwright best practices for E2E tests
- Ensure tests are deterministic and fast