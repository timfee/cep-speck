#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const CAP = Number(process.env.FTA_HARD_CAP || 60);
const JSON_PATH = path.resolve("reports/fta.json");

if (!fs.existsSync(JSON_PATH)) {
  console.error(
    `[FTA] Missing ${JSON_PATH}. Generate it first with \`pnpm run complexity:json\`.`
  );
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const offenders = data.filter((d) => d.fta_score > CAP);

if (offenders.length) {
  console.error(`\n[FTA] Hard cap exceeded (cap=${CAP}). Offending files:`);
  offenders
    .sort((a, b) => b.fta_score - a.fta_score)
    .forEach((o) =>
      console.error(` - ${o.file_name}  score=${o.fta_score.toFixed(2)}`)
    );
  console.error(
    "\nRefactor or split code until scores are under the cap, then commit again."
  );
  process.exit(1);
}

console.log(`[FTA] All files under cap (${CAP}).`);
