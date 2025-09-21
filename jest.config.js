module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.(test|spec).+(ts|tsx|js)"],
  testPathIgnorePatterns: ["/__tests__/.*\\.ts$", "/setup\\.ts$"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        babelConfig: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
        },
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@babel/runtime)/)"
  ],
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
