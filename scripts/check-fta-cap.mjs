#!/usr/bin/env node
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

import { DEFAULT_CAP, resolveCap, WARN_RATIO } from "./fta-config.mjs";

const JSON_PATH = path.resolve("reports/fta.json");
const BASELINE_PATH = path.resolve("reports/fta.base.json");

if (!fs.existsSync(JSON_PATH)) {
  console.error(
    `[FTA] Missing ${JSON_PATH}. Generate it first with \`pnpm run complexity:json\`.`
  );
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"))
  : [];

const dataMap = new Map(data.map((entry) => [entry.file_name, entry]));
const baselineMap = new Map(
  baseline.map((entry) => [entry.file_name, entry.fta_score])
);

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

const evaluations = changedFiles
  .map((file) => {
    const entry = dataMap.get(file);
    if (!entry) return null;
    const { cap, category } = resolveCap(file);
    const baselineScore = baselineMap.get(file);
    const score = entry.fta_score;
    const ratio = score / cap;
    return {
      file,
      score,
      cap,
      category,
      baselineScore,
      ratio,
    };
  })
  .filter(Boolean);

const offenders = evaluations.filter((e) => e.score > e.cap);

if (offenders.length) {
  console.error(`\n[FTA] Hard cap exceeded.`);
  offenders
    .sort((a, b) => b.score - a.score)
    .forEach((o) => {
      const delta =
        typeof o.baselineScore === "number"
          ? ` (baseline ${o.baselineScore.toFixed(2)})`
          : "";
      console.error(
        ` - ${o.file}  score=${o.score.toFixed(2)} cap=${o.cap} [${o.category}]${delta}`
      );
    });
  console.error(
    "\nRefactor or split code until scores are under the cap, then commit again.\n\nESSENTIAL: Do not panic and make arbitrary changes and add indirections without holistically considering how to streamline and improve the code. We don't want to create technical debt. This will only make things worse.\n"
  );
  process.exit(1);
}

console.log(
  `[FTA] All files under cap (default=${DEFAULT_CAP}). Evaluated ${evaluations.length} file(s).`
);

const nearCap = evaluations
  .filter((e) => e.ratio >= WARN_RATIO)
  .sort((a, b) => b.ratio - a.ratio);

if (nearCap.length) {
  console.log("\n[FTA] Diagnostics: files approaching cap:");
  nearCap.forEach((entry) => {
    const delta =
      typeof entry.baselineScore === "number"
        ? entry.score - entry.baselineScore
        : null;
    const deltaText =
      delta === null
        ? "baseline: —"
        : `baseline: ${entry.baselineScore.toFixed(2)} (Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(2)})`;
    console.log(
      ` - ${entry.file} [${entry.category}] score=${entry.score.toFixed(2)} cap=${entry.cap} (${deltaText})`
    );
  });

  const topFive = evaluations
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  console.log("\n[FTA] Top complexity scores among changed files:");
  topFive.forEach((entry, index) => {
    console.log(
      ` ${index + 1}. ${entry.file} ${entry.score.toFixed(2)} / cap ${entry.cap} [${entry.category}]`
    );
  });

  if (!fs.existsSync(BASELINE_PATH)) {
    console.log(
      "\n[FTA] Hint: establish a baseline with `pnpm run complexity:json && cp reports/fta.json reports/fta.base.json` to unlock historical comparisons."
    );
  }
}
