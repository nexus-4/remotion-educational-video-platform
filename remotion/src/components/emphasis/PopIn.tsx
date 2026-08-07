import { Easing, interpolate, useCurrentFrame } from "remotion";
import { EMPHASIS_DURATION_IN_FRAMES } from "../../animations";
import type { EmphasisProps } from "./types";

/**
 * Wraps text with an accent pill that scales and bounces into view, synced to `startFrame`.
 * DOM/CSS only — `scale`/`opacity` are interpolated per-frame, no canvas involved.
 */
export const PopIn: React.FC<EmphasisProps> = ({
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
          inset: 0,
          borderRadius: 8,
          backgroundColor: color,
          zIndex: 0,
          scale: interpolate(
            frame,
            [startFrame, startFrame + EMPHASIS_DURATION_IN_FRAMES],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 8 }),
            },
          ),
          opacity: interpolate(
            frame,
            [startFrame, startFrame + EMPHASIS_DURATION_IN_FRAMES / 2],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
