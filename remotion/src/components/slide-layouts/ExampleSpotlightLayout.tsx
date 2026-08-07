import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import {
  FramedFigure,
  HighlightChips,
  SlideBadge,
  SlideBullets,
} from "../slide-parts";

/** Centered "figure with caption" treatment reserved for worked examples. */
export const ExampleSpotlightLayout: React.FC<{
  slide: SlideData;
  theme: Theme;
  videoId: string;
  durationInFrames: number;
}> = ({ slide, theme, videoId, durationInFrames }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-8 px-24 py-16 ${theme.background}`}
    >
      <div style={fadeSlideUp(frame, 0, 24)}>
        <SlideBadge type="example" theme={theme} />
      </div>

      <div className="h-[50%] w-full max-w-5xl">
        <FramedFigure
          src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
          durationInFrames={durationInFrames}
          theme={theme}
          className="h-full w-full"
        />
      </div>

      <h1
        style={fadeSlideUp(frame, 4)}
        className={`max-w-4xl text-center text-[64px] leading-tight font-extrabold ${theme.heading}`}
      >
        {slide.heading}
      </h1>

      {slide.bullets && slide.bullets.length > 0 ? (
        <SlideBullets bullets={slide.bullets} theme={theme} align="center" />
      ) : null}

      {slide.highlightTerms && slide.highlightTerms.length > 0 ? (
        <HighlightChips
          terms={slide.highlightTerms}
          theme={theme}
          align="center"
        />
      ) : null}
    </AbsoluteFill>
  );
};
