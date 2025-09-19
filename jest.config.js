module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.(test|spec).+(ts|tsx|js)"],
  testPathIgnorePatterns: ["/__tests__/.*\\.ts$", "/setup\\.ts$"],
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
