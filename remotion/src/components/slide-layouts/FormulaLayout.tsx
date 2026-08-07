import { fitTextOnNLines } from "@remotion/layout-utils";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { fontFamily } from "../../font";
import { AcademicTexture, FittedHeading, SlideBadge } from "../slide-parts";

const FORMULA_MAX_BOX_WIDTH = 1400;

/** Full-bleed themed background with the formula in a glass panel. */
export const FormulaLayout: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  const formulaFontSize = slide.formula
    ? fitTextOnNLines({
        text: slide.formula,
        maxLines: 2,
        maxBoxWidth: FORMULA_MAX_BOX_WIDTH,
        fontFamily,
        fontWeight: 700,
        maxFontSize: 76,
      }).fontSize
    : 76;

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-12 overflow-hidden ${theme.background}`}
    >
      <AcademicTexture lineColor={theme.ruleLineColor} />

      <div
        style={fadeSlideUp(frame, 0, 24)}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <SlideBadge type="formula" theme={theme} />
        <FittedHeading
          text={slide.heading}
          maxFontSize={80}
          maxBoxWidth={896}
          style={{ textAlign: "center" }}
          className={theme.heading}
        />
      </div>

      {slide.formula ? (
        <div
          style={{ ...fadeSlideUp(frame, 10, 24), fontSize: formulaFontSize }}
          className={`relative z-10 rounded-3xl px-16 py-12 text-center font-bold ${theme.formulaPanel}`}
        >
          {slide.formula}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
