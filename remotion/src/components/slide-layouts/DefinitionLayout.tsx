import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { AcademicTexture, FittedHeading, SlideBadge } from "../slide-parts";

const DEFINITION_MAX_BOX_WIDTH = 1200;

/** Themed background with the term as a big heading and its definition in a glass panel. */
export const DefinitionLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-12 overflow-hidden ${theme.background}`}
    >
      <AcademicTexture lineColor={theme.ruleLineColor} />

      <div
        style={fadeSlideUp(frame, 0, 24)}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <SlideBadge type="definition" theme={theme} />
        <FittedHeading
          text={slide.term ?? slide.heading}
          maxFontSize={90}
          maxBoxWidth={900}
          maxLines={2}
          style={{ textAlign: "center" }}
          className={theme.heading}
        />
      </div>

      {slide.definition ? (
        <div
          style={{
            // Only the slide-up motion, no animated opacity: `theme.formulaPanel`'s
            // translucent background uses a color-mix() alpha modifier, and compositing
            // that at a fractional opacity corrupts its color during the fade-in.
            translate: fadeSlideUp(frame, 10, 24).translate,
            maxWidth: DEFINITION_MAX_BOX_WIDTH,
          }}
          className={`relative z-10 rounded-3xl px-16 py-12 text-center text-[36px] leading-snug font-medium ${theme.formulaPanel}`}
        >
          {slide.definition}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
