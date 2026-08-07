import { interpolate, useCurrentFrame } from "remotion";
import type { Theme } from "../../theme";
import { ENTRANCE_DURATION_IN_FRAMES } from "../../animations";

export const SlideBullets: React.FC<{
  bullets: string[];
  theme: Theme;
  align?: "left" | "center";
}> = ({ bullets, theme, align = "left" }) => {
  const frame = useCurrentFrame();

  return (
    <ul className={`mt-8 space-y-4 ${align === "center" ? "text-center" : ""}`}>
      {bullets.map((bullet, index) => {
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
