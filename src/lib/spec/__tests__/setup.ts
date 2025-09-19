/**
 * Jest test setup for streaming protocol tests
 */

// Global test timeout for async operations
jest.setTimeout(10000);

// Mock console.warn to reduce noise during tests
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

// Performance measurement availability check
(global as Record<string, unknown>).performance = (
  global as Record<string, unknown>
).performance || {
  now: Date.now,
  memory: undefined,
};
