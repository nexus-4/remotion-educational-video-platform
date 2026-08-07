import { Easing, interpolate, useCurrentFrame } from "remotion";
import { EMPHASIS_DURATION_IN_FRAMES } from "../../animations";
import type { EmphasisProps } from "./types";

/**
 * Wraps text in a highlight marker that sweeps in from the left, synced to `startFrame`.
 * DOM/CSS only — a background layer's width is interpolated per-frame, no canvas involved.
 */
export const HighlightSweep: React.FC<EmphasisProps> = ({
  children,
  startFrame,
  color = "rgba(251, 191, 36, 0.55)",
}) => {
  const frame = useCurrentFrame();

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: "0 0.2em",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
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
          backgroundColor: color,
          borderRadius: 6,
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
