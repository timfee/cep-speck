export const DEFAULT_CAP = Number(process.env.FTA_HARD_CAP || 65);

const parseCap = (envKey, fallback) => {
  const value = process.env[envKey];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const CATEGORY_RULES = [
  {
    name: "hooks",
    match: (file) => file.includes("/hooks/") || file.startsWith("hooks/"),
    cap: parseCap("FTA_CAP_HOOKS", Math.max(DEFAULT_CAP, 70)),
  },
  {
    name: "config",
    match: (file) => /config/i.test(file),
    cap: parseCap("FTA_CAP_CONFIG", Math.max(DEFAULT_CAP, 70)),
  },
  {
    name: "ui",
    match: (file) => file.startsWith("components/"),
    cap: parseCap("FTA_CAP_UI", DEFAULT_CAP),
  },
];

export function resolveCap(file) {
  for (const rule of CATEGORY_RULES) {
    if (rule.match(file)) {
      return { cap: rule.cap, category: rule.name };
    }
  }
  return { cap: DEFAULT_CAP, category: "default" };
}

export const WARN_RATIO = Number(process.env.FTA_WARN_RATIO || 0.9);
