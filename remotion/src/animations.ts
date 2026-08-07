import { Easing, interpolate } from "remotion";

export const ENTRANCE_DURATION_IN_FRAMES = 20;
export const HIGHLIGHT_STAGGER_IN_FRAMES = 12;
export const KEN_BURNS_END_SCALE = 1.06;

/** Fade in + slide up from `distance`px, starting at `startFrame`. */
export const fadeSlideUp = (
  frame: number,
  startFrame: number,
  distance = 40,
): React.CSSProperties => ({
  opacity: interpolate(
    frame,
    [startFrame, startFrame + ENTRANCE_DURATION_IN_FRAMES],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  ),
  translate: interpolate(
    frame,
    [startFrame, startFrame + ENTRANCE_DURATION_IN_FRAMES],
    [`0px ${distance}px`, "0px 0px"],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  ),
});

/** Ken Burns slow zoom scale for the current frame, over a clip lasting `durationInFrames`. */
export const kenBurnsScale = (
  frame: number,
  durationInFrames: number,
): number =>
  interpolate(
    frame,
    [0, Math.max(durationInFrames, 1)],
    [1, KEN_BURNS_END_SCALE],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
