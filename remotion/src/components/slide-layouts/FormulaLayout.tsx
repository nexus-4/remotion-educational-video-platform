import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { AcademicTexture, SlideBadge } from "../slide-parts";

/** Full-bleed themed background with the formula in a glass panel. */
export const FormulaLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-12 ${theme.background}`}
    >
      <AcademicTexture lineColor={theme.ruleLineColor} />

      <div
        style={fadeSlideUp(frame, 0, 24)}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <SlideBadge type="formula" theme={theme} />
        <h1
          className={`max-w-4xl text-center text-[80px] leading-tight font-extrabold ${theme.heading}`}
        >
          {slide.heading}
        </h1>
      </div>

      {slide.formula ? (
        <div
          style={fadeSlideUp(frame, 10, 24)}
          className={`relative z-10 rounded-3xl px-16 py-12 text-center text-[76px] font-bold ${theme.formulaPanel}`}
        >
          {slide.formula}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
