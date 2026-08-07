import { interpolate, useCurrentFrame } from "remotion";
import type { Theme } from "../../theme";
import { ENTRANCE_DURATION_IN_FRAMES } from "../../animations";

/** More than this and a bullet list risks overflowing its slide's fixed height. */
const MAX_BULLETS = 4;

export const SlideBullets: React.FC<{
  bullets: string[];
  theme: Theme;
  align?: "left" | "center";
  max?: number;
}> = ({ bullets, theme, align = "left", max = MAX_BULLETS }) => {
  const frame = useCurrentFrame();
  const visibleBullets = bullets.slice(0, max);

  return (
    <ul className={`mt-8 space-y-4 ${align === "center" ? "text-center" : ""}`}>
      {visibleBullets.map((bullet, index) => {
        const startFrame = ENTRANCE_DURATION_IN_FRAMES + index * 6;

        return (
          <li
            key={bullet}
            style={{
              opacity: interpolate(
                frame,
                [startFrame, startFrame + 10],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
            className={`text-[36px] leading-snug ${theme.body}`}
          >
            {align === "left" ? "• " : ""}
            {bullet}
          </li>
        );
      })}
    </ul>
  );
};
