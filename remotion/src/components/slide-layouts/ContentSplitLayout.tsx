import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import type { AnimationStyleId, Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import {
  FittedHeading,
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
  animationStyle: AnimationStyleId;
}> = ({ slide, theme, videoId, durationInFrames, mirrored, animationStyle }) => {
  const frame = useCurrentFrame();

  const textPanel = (
    <div
      className={`flex h-full w-1/2 flex-col justify-center overflow-hidden px-20 ${theme.panelBackground}`}
    >
      <div style={fadeSlideUp(frame, 0, 24)}>
        <SlideBadge type={slide.type} theme={theme} />
      </div>

      <FittedHeading
        text={slide.heading}
        maxFontSize={68}
        maxBoxWidth={800}
        style={fadeSlideUp(frame, 4)}
        className={`mt-6 ${theme.heading}`}
      />

      {slide.bullets && slide.bullets.length > 0 ? (
        <SlideBullets bullets={slide.bullets} theme={theme} />
      ) : null}

      {slide.highlightTerms && slide.highlightTerms.length > 0 ? (
        <HighlightChips
          terms={slide.highlightTerms}
          theme={theme}
          animationStyle={animationStyle}
        />
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
