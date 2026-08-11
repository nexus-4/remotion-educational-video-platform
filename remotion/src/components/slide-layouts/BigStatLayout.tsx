import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { FittedHeading } from "../slide-parts";

/**
 * Full-bleed drifting gradient (same technique as `GradientTitleLayout`) behind one giant
 * number/statistic and a short caption underneath.
 */
export const BigStatLayout: React.FC<{
  slide: SlideData;
  theme: Theme;
  durationInFrames: number;
}> = ({ slide, theme, durationInFrames }) => {
  const frame = useCurrentFrame();
  const [from, via, to] = theme.titleGradientColors;

  const backgroundPositionPercent = interpolate(
    frame,
    [0, Math.max(durationInFrames, 1)],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center gap-6 px-24"
      style={{
        backgroundImage: `linear-gradient(120deg, ${from}, ${via}, ${to})`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${backgroundPositionPercent}% 50%`,
      }}
    >
      <FittedHeading
        text={slide.statValue ?? ""}
        maxFontSize={220}
        maxBoxWidth={1500}
        maxLines={1}
        style={{
          ...fadeSlideUp(frame, 4),
          textAlign: "center",
          color: "#ffffff",
        }}
      />
      <FittedHeading
        text={slide.statLabel ?? ""}
        maxFontSize={48}
        maxBoxWidth={1300}
        maxLines={2}
        style={{
          ...fadeSlideUp(frame, 14),
          textAlign: "center",
          color: "#ffffff",
        }}
      />
    </AbsoluteFill>
  );
};
