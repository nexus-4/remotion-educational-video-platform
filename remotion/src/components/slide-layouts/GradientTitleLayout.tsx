import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { FittedHeading } from "../slide-parts";

/**
 * Minimalist scene: nothing but a big title over a slowly drifting gradient background.
 * Used for short, punchy statement slides that have neither an image nor bullets — the
 * pure DOM/CSS gradient-position drift is the whole point, no canvas involved.
 */
export const GradientTitleLayout: React.FC<{
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
      className="flex items-center justify-center px-24"
      style={{
        backgroundImage: `linear-gradient(120deg, ${from}, ${via}, ${to})`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${backgroundPositionPercent}% 50%`,
      }}
    >
      <FittedHeading
        text={slide.heading}
        maxFontSize={140}
        maxBoxWidth={1400}
        maxLines={3}
        style={{
          ...fadeSlideUp(frame, 4),
          textAlign: "center",
          color: "#ffffff",
        }}
      />
    </AbsoluteFill>
  );
};
