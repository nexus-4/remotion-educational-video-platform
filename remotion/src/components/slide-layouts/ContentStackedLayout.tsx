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
      <div className="h-[48%] w-full">
        <FramedFigure
          src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
          durationInFrames={durationInFrames}
          theme={theme}
          className="h-full w-full"
        />
      </div>

      <div className="mt-10 flex-1">
        <div style={fadeSlideUp(frame, 0, 24)}>
          <SlideBadge type={slide.type} theme={theme} />
        </div>

        <h1
          style={fadeSlideUp(frame, 4)}
          className={`mt-6 text-[72px] leading-tight font-extrabold ${theme.heading}`}
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
