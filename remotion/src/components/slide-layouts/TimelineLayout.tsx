import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { FittedHeading } from "../slide-parts";

const STEP_STAGGER_IN_FRAMES = 10;
const STEPS_START_FRAME = 16;

/** Vertical numbered sequence of steps, connected by a background rule line. */
export const TimelineLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();
  const steps = slide.steps ?? [];

  return (
    <AbsoluteFill
      className={`flex flex-col justify-center overflow-hidden px-24 py-16 ${theme.background}`}
    >
      <div style={fadeSlideUp(frame, 0, 24)}>
        <FittedHeading
          text={slide.heading}
          maxFontSize={64}
          maxBoxWidth={1400}
          maxLines={2}
          className={theme.heading}
        />
      </div>

      <div className="relative mt-12 flex flex-col gap-8">
        <div
          className="absolute top-2 bottom-2 left-7 w-1 rounded-full"
          style={{ backgroundColor: theme.ruleLineColor }}
        />

        {steps.map((step, index) => {
          const startFrame = STEPS_START_FRAME + index * STEP_STAGGER_IN_FRAMES;

          return (
            <div
              key={index}
              style={fadeSlideUp(frame, startFrame, 24)}
              className="relative flex items-start gap-6"
            >
              <span
                className={`flex size-14 shrink-0 items-center justify-center rounded-full text-[26px] font-bold ${theme.badge}`}
              >
                {index + 1}
              </span>
              <p className={`mt-2 text-[32px] leading-snug ${theme.body}`}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
