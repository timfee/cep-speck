#!/usr/bin/env node
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const CAP = Number(process.env.FTA_HARD_CAP || 50);
const JSON_PATH = path.resolve("reports/fta.json");

if (!fs.existsSync(JSON_PATH)) {
  console.error(
    `[FTA] Missing ${JSON_PATH}. Generate it first with \`pnpm run complexity:json\`.`
  );
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

let changedFiles = [];
try {
  const output = execSync("git status --porcelain", { encoding: "utf8" });
  changedFiles = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((file) => file.replace(/.* -> /, ""))
    .filter(
      (file) =>
        file.startsWith("src/") &&
        (file.endsWith(".ts") || file.endsWith(".tsx"))
    )
    .map((file) => file.replace(/^src\//, ""));
} catch (error) {
  console.warn("[FTA] Unable to determine changed files:", error);
}

if (changedFiles.length === 0) {
  console.log(
    "[FTA] No changed TypeScript files detected. Skipping cap enforcement."
  );
  process.exit(0);
}

const offenders = data
  .filter((d) => d.fta_score > CAP)
  .filter((d) => changedFiles.includes(d.file_name));

if (offenders.length) {
  console.error(`\n[FTA] Hard cap exceeded (cap=${CAP}). Offending files:`);
  offenders
    .sort((a, b) => b.fta_score - a.fta_score)
    .forEach((o) =>
      console.error(` - ${o.file_name}  score=${o.fta_score.toFixed(2)}`)
    );
  console.error(
    "\nRefactor or split code until scores are under the cap, then commit again.\n\nESSENTIAL: Do not panic and make arbitrary changes and add indirections without holistically considering how to streamline and improve the code. We don't want to create technical debt. This will only make things worse.\n"
  );
  process.exit(1);
}

console.log(`[FTA] All files under cap (${CAP}).`);
