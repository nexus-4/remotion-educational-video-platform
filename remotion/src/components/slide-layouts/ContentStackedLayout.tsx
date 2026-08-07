import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import {
  FittedHeading,
  FramedFigure,
  HighlightChips,
  SlideBadge,
  SlideBullets,
} from "../slide-parts";

/** Framed figure spanning the top, text and bullets below — the alternate layout for variety. */
export const ContentStackedLayout: React.FC<{
  slide: SlideData;
  theme: Theme;
  videoId: string;
  durationInFrames: number;
}> = ({ slide, theme, videoId, durationInFrames }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className={`flex flex-col px-24 py-16 ${theme.background}`}>
      <div className="h-[42%] w-full">
        <FramedFigure
          src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
          durationInFrames={durationInFrames}
          theme={theme}
          className="h-full w-full"
        />
      </div>

      <div className="mt-8 flex-1 overflow-hidden">
        <div style={fadeSlideUp(frame, 0, 24)}>
          <SlideBadge type={slide.type} theme={theme} />
        </div>

        <FittedHeading
          text={slide.heading}
          maxFontSize={72}
          maxBoxWidth={1728}
          style={fadeSlideUp(frame, 4)}
          className={`mt-6 ${theme.heading}`}
        />

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
