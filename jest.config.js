module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).+(ts|tsx|js)",
    "**/tests/**/*.(test|spec).+(ts|tsx|js)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/setup\\.ts$"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 30000,
};
