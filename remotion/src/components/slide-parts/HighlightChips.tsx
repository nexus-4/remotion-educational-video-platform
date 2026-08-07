import type { Theme } from "../../theme";
import {
  HIGHLIGHT_STAGGER_IN_FRAMES,
  ENTRANCE_DURATION_IN_FRAMES,
} from "../../animations";
import { MarkerHighlight } from "../MarkerHighlight";

/** More terms than this reads as clutter and risks wrapping past the slide's height. */
const MAX_TERMS = 4;

export const HighlightChips: React.FC<{
  terms: string[];
  theme: Theme;
  align?: "left" | "center";
}> = ({ terms, theme, align = "left" }) => (
  <div
    className={`mt-10 flex flex-wrap gap-4 ${align === "center" ? "justify-center" : ""}`}
  >
    {terms.slice(0, MAX_TERMS).map((term, index) => (
      <MarkerHighlight
        key={term}
        startFrame={
          ENTRANCE_DURATION_IN_FRAMES + index * HIGHLIGHT_STAGGER_IN_FRAMES
        }
        color={theme.accent}
      >
        <span className={`text-[32px] font-semibold ${theme.heading}`}>
          {term}
        </span>
      </MarkerHighlight>
    ))}
  </div>
);
