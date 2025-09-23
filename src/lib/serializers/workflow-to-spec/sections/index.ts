import type { SectionDefinition } from "../types";
import { CUJ_SECTION } from "./cuj-section";
import { FUNCTIONAL_REQUIREMENTS_SECTION } from "./functional-requirements-section";
import { GO_TO_MARKET_SECTION } from "./go-to-market-section";
import { GOALS_SECTION } from "./goals-section";
import { KEY_PERSONAS_SECTION } from "./key-personas-section";
import { PEOPLE_PROBLEMS_SECTION } from "./people-problems-section";
import { SUCCESS_METRICS_SECTION } from "./success-metrics-section";
import { TECHNICAL_CONSIDERATIONS_SECTION } from "./technical-considerations-section";
import { TLDR_SECTION } from "./tldr-section";

export const SECTION_DEFINITIONS: readonly SectionDefinition[] = [
  TLDR_SECTION,
  PEOPLE_PROBLEMS_SECTION,
  KEY_PERSONAS_SECTION,
  GOALS_SECTION,
  CUJ_SECTION,
  FUNCTIONAL_REQUIREMENTS_SECTION,
  TECHNICAL_CONSIDERATIONS_SECTION,
  SUCCESS_METRICS_SECTION,
  GO_TO_MARKET_SECTION,
];
