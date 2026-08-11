import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { FittedHeading, SlideBullets } from "../slide-parts";

/** Two-column "this vs that" panel, each side a label + a short list of points. */
export const ComparisonLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col overflow-hidden ${theme.background}`}
    >
      <div
        style={fadeSlideUp(frame, 0, 24)}
        className="flex justify-center px-24 pt-16"
      >
        <FittedHeading
          text={slide.heading}
          maxFontSize={64}
          maxBoxWidth={1400}
          maxLines={2}
          style={{ textAlign: "center" }}
          className={theme.heading}
        />
      </div>

      <div className="relative flex flex-1 flex-row px-24 py-16">
        <div style={fadeSlideUp(frame, 8, 24)} className="w-1/2 pr-16">
          <span
            className={`inline-block w-fit rounded-full px-6 py-2 text-[28px] font-semibold ${theme.badge}`}
          >
            {slide.leftLabel}
          </span>
          <SlideBullets bullets={slide.leftItems ?? []} theme={theme} />
        </div>

        <div
          style={fadeSlideUp(frame, 4, 24)}
          className={`absolute top-12 left-[912px] flex size-24 items-center justify-center rounded-full text-[26px] font-bold uppercase ${theme.badge}`}
        >
          vs
        </div>

        <div style={fadeSlideUp(frame, 12, 24)} className="w-1/2 pl-16">
          <span
            className={`inline-block w-fit rounded-full px-6 py-2 text-[28px] font-semibold ${theme.badge}`}
          >
            {slide.rightLabel}
          </span>
          <SlideBullets bullets={slide.rightItems ?? []} theme={theme} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
