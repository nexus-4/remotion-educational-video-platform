import type { Theme } from "../../theme";
import type { AnimationStyleId } from "../../types";
import {
  HIGHLIGHT_STAGGER_IN_FRAMES,
  ENTRANCE_DURATION_IN_FRAMES,
} from "../../animations";
import { HighlightSweep, PopIn, UnderlineDraw } from "../emphasis";

/** More terms than this reads as clutter and risks wrapping past the slide's height. */
const MAX_TERMS = 4;

const EMPHASIS_COMPONENT: Record<AnimationStyleId, typeof HighlightSweep> = {
  highlight: HighlightSweep,
  underline: UnderlineDraw,
  pop_in: PopIn,
};

export const HighlightChips: React.FC<{
  terms: string[];
  theme: Theme;
  animationStyle: AnimationStyleId;
  align?: "left" | "center";
}> = ({ terms, theme, animationStyle, align = "left" }) => {
  const Emphasis = EMPHASIS_COMPONENT[animationStyle];

  return (
    <div
      className={`mt-10 flex flex-wrap gap-4 ${align === "center" ? "justify-center" : ""}`}
    >
      {terms.slice(0, MAX_TERMS).map((term, index) => (
        <Emphasis
          key={term}
          startFrame={
            ENTRANCE_DURATION_IN_FRAMES + index * HIGHLIGHT_STAGGER_IN_FRAMES
          }
          color={theme.accent}
        >
          <span className={`text-[32px] font-semibold ${theme.heading}`}>
            {term}
          </span>
        </Emphasis>
      ))}
    </div>
  );
};
