import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { FittedHeading } from "../slide-parts";

const CONFETTI_DOTS = [
  { top: "16%", left: "12%", size: 18 },
  { top: "28%", left: "84%", size: 14 },
  { top: "72%", left: "16%", size: 12 },
  { top: "80%", left: "78%", size: 20 },
  { top: "12%", left: "50%", size: 10 },
  { top: "86%", left: "48%", size: 14 },
];

/** Celebratory closing card for the mandatory "outro" slide that ends every video. */
export const OutroLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-8 overflow-hidden px-24 ${theme.background}`}
    >
      {CONFETTI_DOTS.map((dot, index) => {
        const startFrame = index * 4;

        return (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              backgroundColor:
                theme.confettiColors[index % theme.confettiColors.length],
              scale: interpolate(
                frame,
                [startFrame, startFrame + 15],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 8 }),
                },
              ),
            }}
          />
        );
      })}

      <div style={fadeSlideUp(frame, 0, 24)}>
        <span
          className={`inline-block rounded-full px-6 py-2 text-[28px] font-semibold tracking-wide uppercase ${theme.badge}`}
        >
          The End
        </span>
      </div>

      <FittedHeading
        text={slide.heading}
        maxFontSize={90}
        maxBoxWidth={1400}
        maxLines={3}
        style={{ ...fadeSlideUp(frame, 4), textAlign: "center" }}
        className={theme.heading}
      />
    </AbsoluteFill>
  );
};
