/**
 * tokens.ts
 * ─────────────────────────────────────────────────────────────
 * LIGHT: orange accent #E8845A (warm, friendly)
 * DARK:  orb-teal accent #68A8A8 (matches the orb, not orange)
 * ─────────────────────────────────────────────────────────────
 */

export const LIGHT = {
  bg:          "#F2EBE0",
  sidebar:     "#FFFFFF",
  card:        "#FFFFFF",
  input:       "#FFFFFF",

  textPrimary: "#2C2418",
  textMuted:   "#9E9080",
  textHint:    "#C4B8A8",

  border:      "#EAE0D4",
  divider:     "#F0E8DC",

  // Light mode — orange accent everywhere
  accent:      "#E8845A",
  accentHover: "#D4744A",
  accentGlow:  "rgba(232,132,90,0.35)",
  accentText:  "#FFFFFF",

  // Nav active pill
  navActiveBg:   "#E8845A",
  navActiveText: "#FFFFFF",
  navHoverBg:    "#FAF5EE",
  navHoverText:  "#2C2418",

  // Orb
  orbGradient: "radial-gradient(circle at 40% 35%, #E09870 0%, #CC8890 35%, #B090B8 65%, #A888C0 100%)",
  orbGlow:     "rgba(192,136,144,0.2)",
  orbShadow:   "0 16px 48px rgba(192,136,144,0.22), 0 4px 16px rgba(168,136,192,0.15)",

  cardShadow:  "0 2px 12px rgba(0,0,0,0.06)",
  btnShadow:   "0 8px 24px rgba(232,132,90,0.4)",
};

export const DARK = {
  bg:          "#181A2E",
  sidebar:     "#111220",
  card:        "#202338",
  input:       "#202338",

  textPrimary: "#E0E2F2",
  textMuted:   "#5C6490",
  textHint:    "#363A60",

  border:      "#282B50",
  divider:     "#222548",

  // Dark mode — orb-teal accent (matches the orb, not orange)
  accent:      "#68A8A8",
  accentHover: "#589898",
  accentGlow:  "rgba(104,168,168,0.35)",
  accentText:  "#FFFFFF",

  // Nav active pill — muted teal matches orb
  navActiveBg:   "#2A3855",
  navActiveText: "#B8D8D8",
  navHoverBg:    "#202338",
  navHoverText:  "#E0E2F2",

  // Orb — muted violet→teal
  orbGradient: "radial-gradient(circle at 40% 30%, #8888B8 0%, #7898B8 40%, #68A8A8 70%, #60B0A8 100%)",
  orbGlow:     "rgba(96,176,168,0.18)",
  orbShadow:   "0 16px 48px rgba(96,176,168,0.16), 0 0 60px rgba(136,136,184,0.1)",

  cardShadow:  "none",
  btnShadow:   "0 8px 20px rgba(104,168,168,0.35)",
};

export type Theme = typeof LIGHT;

export function getTheme(dark: boolean): Theme {
  return dark ? DARK : LIGHT;
}