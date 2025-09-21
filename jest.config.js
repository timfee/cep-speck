module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).+(ts|tsx|js)",
    "**/?(*.)+(test|spec).+(ts|tsx|js)",
  ],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "tests/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 30000,
};
