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

/** Text panel on one side, framed figure filling the other — the default two-up layout. */
export const ContentSplitLayout: React.FC<{
  slide: SlideData;
  theme: Theme;
  videoId: string;
  durationInFrames: number;
  mirrored: boolean;
}> = ({ slide, theme, videoId, durationInFrames, mirrored }) => {
  const frame = useCurrentFrame();

  const textPanel = (
    <div
      className={`flex h-full w-1/2 flex-col justify-center px-20 ${theme.panelBackground}`}
    >
      <div style={fadeSlideUp(frame, 0, 24)}>
        <SlideBadge type={slide.type} theme={theme} />
      </div>

      <h1
        style={fadeSlideUp(frame, 4)}
        className={`mt-6 text-[68px] leading-tight font-extrabold ${theme.heading}`}
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
  );

  const imagePanel = (
    <div className="flex h-full w-1/2 items-center justify-center p-16">
      <FramedFigure
        src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
        durationInFrames={durationInFrames}
        theme={theme}
        className="h-full w-full"
      />
    </div>
  );

  return (
    <AbsoluteFill className={`flex flex-row ${theme.background}`}>
      {mirrored ? (
        <>
          {imagePanel}
          {textPanel}
        </>
      ) : (
        <>
          {textPanel}
          {imagePanel}
        </>
      )}
    </AbsoluteFill>
  );
};
