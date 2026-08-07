import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import {
  FittedHeading,
  FramedFigure,
  SlideBadge,
  SlideBullets,
} from "../slide-parts";

/**
 * Centered "figure with caption" treatment reserved for worked examples. Deliberately
 * skips highlight-term chips (unlike the other layouts) — figure + heading + bullets
 * already fill this layout's vertical budget on their own.
 */
export const ExampleSpotlightLayout: React.FC<{
  slide: SlideData;
  theme: Theme;
  videoId: string;
  durationInFrames: number;
}> = ({ slide, theme, videoId, durationInFrames }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-6 overflow-hidden px-24 py-16 ${theme.background}`}
    >
      <div style={fadeSlideUp(frame, 0, 24)}>
        <SlideBadge type="example" theme={theme} />
      </div>

      <div className="h-[34%] w-full max-w-5xl">
        <FramedFigure
          src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
          durationInFrames={durationInFrames}
          theme={theme}
          className="h-full w-full"
        />
      </div>

      <FittedHeading
        text={slide.heading}
        maxFontSize={56}
        maxBoxWidth={896}
        style={{ ...fadeSlideUp(frame, 4), textAlign: "center" }}
        className={theme.heading}
      />

      {slide.bullets && slide.bullets.length > 0 ? (
        <SlideBullets
          bullets={slide.bullets}
          theme={theme}
          align="center"
          max={3}
        />
      ) : null}
    </AbsoluteFill>
  );
};
