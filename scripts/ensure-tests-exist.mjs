#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function hasTestFiles() {
  const testPatterns = [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "tests/**/*.test.ts",
    "tests/**/*.test.tsx",
    "tests/**/*.spec.ts",
    "tests/**/*.spec.tsx",
  ];

  // Simple recursive search
  function searchDir(dir) {
    if (!fs.existsSync(dir)) return false;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (searchDir(fullPath)) return true;
        } else if (item.match(/\.(test|spec)\.(ts|tsx)$/)) {
          return true;
        }
      }
    } catch (e) {
      // Ignore errors (permission denied, etc.)
    }
    return false;
  }

  return searchDir("src") || searchDir("tests");
}

if (!hasTestFiles()) {
  console.error(
    "[test-check] No test files found (e.g., src/**/*.test.ts, tests/**/*.test.ts). Add at least one test before committing."
  );
  process.exit(1);
}

console.log("[test-check] Test files found - OK");
