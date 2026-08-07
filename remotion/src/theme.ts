import type { VideoTemplate } from "./types";

export type Theme = {
  background: string;
  panelBackground: string;
  overlayTo: string;
  overlayFrom: string;
  badge: string;
  heading: string;
  body: string;
  accent: string;
  ruleLineColor: string;
  frame: string;
  formulaPanel: string;
};

export const THEME: Record<VideoTemplate, Theme> = {
  notebook_lm: {
    background: "bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100",
    panelBackground: "bg-gradient-to-br from-orange-50 to-amber-100",
    overlayTo: "rgba(120, 53, 15, 0.88)",
    overlayFrom: "rgba(255, 247, 237, 0)",
    badge: "bg-orange-200 text-orange-800",
    heading: "text-slate-900",
    body: "text-slate-700",
    accent: "rgba(251, 191, 36, 0.55)",
    ruleLineColor: "rgba(180, 83, 9, 0.14)",
    frame: "bg-white ring-1 ring-orange-200",
    formulaPanel: "bg-white/70 text-orange-800 ring-1 ring-orange-200",
  },
  standard_lecture: {
    background: "bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950",
    panelBackground: "bg-gradient-to-br from-slate-900 to-indigo-950",
    overlayTo: "rgba(2, 6, 23, 0.92)",
    overlayFrom: "rgba(2, 6, 23, 0)",
    badge: "bg-indigo-500/20 text-indigo-200",
    heading: "text-white",
    body: "text-slate-200",
    accent: "rgba(129, 140, 248, 0.55)",
    ruleLineColor: "rgba(148, 163, 184, 0.1)",
    frame: "bg-white/95 ring-1 ring-white/50",
    formulaPanel: "bg-white/5 text-indigo-200 ring-1 ring-white/10",
  },
};
