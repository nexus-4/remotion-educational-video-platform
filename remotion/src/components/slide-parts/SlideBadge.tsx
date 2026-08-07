import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";

const SLIDE_BADGE_LABEL: Record<SlideData["type"], string> = {
  intro: "Intro",
  content: "Ideia Chave",
  formula: "Formula",
  example: "Exemplo",
};

export const SlideBadge: React.FC<{
  type: SlideData["type"];
  theme: Theme;
}> = ({ type, theme }) => (
  <span
    className={`inline-block rounded-full px-6 py-2 text-[26px] font-semibold tracking-wide uppercase ${theme.badge}`}
  >
    {SLIDE_BADGE_LABEL[type]}
  </span>
);
