import { Easing, interpolate, useCurrentFrame } from "remotion";
import { EMPHASIS_DURATION_IN_FRAMES } from "../../animations";
import type { EmphasisProps } from "./types";

/**
 * Wraps text with a clean underline that draws itself left-to-right, synced to `startFrame`.
 * DOM/CSS only — a bar's width is interpolated per-frame, no canvas involved.
 */
export const UnderlineDraw: React.FC<EmphasisProps> = ({
  children,
  startFrame,
  color = "rgba(251, 191, 36, 0.85)",
}) => {
  const frame = useCurrentFrame();

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        paddingBottom: "0.15em",
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          width: `${interpolate(
            frame,
            [startFrame, startFrame + EMPHASIS_DURATION_IN_FRAMES],
            [0, 100],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          )}%`,
        }}
      />
    </span>
  );
};
