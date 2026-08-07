import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import {
  AcademicTexture,
  HighlightChips,
  SlideBadge,
  SlideBullets,
} from "../slide-parts";

/** Full-bleed text-only treatment, used whenever a slide has no illustration. */
export const TextOnlyLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col justify-center px-28 ${theme.background}`}
    >
      <AcademicTexture lineColor={theme.ruleLineColor} />

      <div className="relative z-10 max-w-5xl">
        <div style={fadeSlideUp(frame, 0, 24)}>
          <SlideBadge type={slide.type} theme={theme} />
        </div>

        <h1
          style={fadeSlideUp(frame, 4)}
          className={`mt-8 text-[100px] leading-tight font-extrabold ${theme.heading}`}
        >
          {slide.heading}
        </h1>

        {slide.bullets && slide.bullets.length > 0 ? (
          <SlideBullets bullets={slide.bullets} theme={theme} />
        ) : null}

        {slide.highlightTerms && slide.highlightTerms.length > 0 ? (
          <HighlightChips terms={slide.highlightTerms} theme={theme} />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
