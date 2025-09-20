#!/usr/bin/env node
import fs from "node:fs";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.split("=");
      args[k.slice(2)] = v ?? argv[++i];
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const currentPath = args.current || "reports/fta.json";
const basePath = args.base || "reports/fta.base.json";
const changedArg = args.changed || "";

const changed = changedArg
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .filter(
    (f) => f.startsWith("src/") && (f.endsWith(".ts") || f.endsWith(".tsx"))
  )
  .map((f) => f.replace(/^src\//, ""));

if (changed.length === 0) {
  console.log(
    "[quality] No changed TS/TSX files under src/. Skipping FTA gate."
  );
  process.exit(0);
}

const current = readJson(currentPath);
const base = fs.existsSync(basePath) ? readJson(basePath) : [];

const byFile = (arr) => {
  const m = new Map();
  for (const e of arr) m.set(e.file_name, e);
  return m;
};
const curMap = byFile(current);
const baseMap = byFile(base);

const HARD_CAP = Number(process.env.FTA_HARD_CAP || 50);
const DELTA_PCT = Number(process.env.FTA_DELTA_PCT || 10);

const failures = [];
const report = [];
for (const f of changed) {
  const cur = curMap.get(f);
  if (!cur) continue;
  const baseEntry = baseMap.get(f);
  const curScore = cur.fta_score;
  const baseScore = baseEntry?.fta_score;
  report.push({ file: `src/${f}`, curScore, baseScore });
  if (curScore > HARD_CAP)
    failures.push({
      file: `src/${f}`,
      reason: `FTA ${curScore.toFixed(2)} > ${HARD_CAP}`,
    });
  if (
    typeof baseScore === "number" &&
    curScore > baseScore * (1 + DELTA_PCT / 100)
  ) {
    failures.push({
      file: `src/${f}`,
      reason: `FTA Δ>${DELTA_PCT}% (${baseScore.toFixed(2)} → ${curScore.toFixed(2)})`,
    });
  }
}

console.log("[quality] FTA comparison for changed files:");
for (const r of report) {
  console.log(
    `- ${r.file}: ${typeof r.baseScore === "number" ? r.baseScore.toFixed(2) : "—"} -> ${r.curScore.toFixed(2)}`
  );
}

if (failures.length) {
  console.error("\n[quality] FTA gate failed:");
  for (const f of failures) console.error(`- ${f.file}: ${f.reason}`);
  process.exit(1);
}

console.log("[quality] FTA gate passed");
