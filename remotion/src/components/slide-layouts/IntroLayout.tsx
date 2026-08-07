import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { AcademicTexture, CoverImage } from "../slide-parts";

/** Full-bleed hero: cover image (or ruled-paper texture) behind a huge title. */
export const IntroLayout: React.FC<{
  slide: SlideData;
  theme: Theme;
  videoId: string;
  durationInFrames: number;
}> = ({ slide, theme, videoId, durationInFrames }) => {
  const frame = useCurrentFrame();
  const hasImage = Boolean(slide.imageFile);

  return (
    <AbsoluteFill className={theme.background}>
      {hasImage ? (
        <AbsoluteFill>
          <CoverImage
            src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
            durationInFrames={durationInFrames}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(to top, ${theme.overlayTo}, ${theme.overlayFrom})`,
            }}
          />
        </AbsoluteFill>
      ) : (
        <AcademicTexture lineColor={theme.ruleLineColor} />
      )}

      <AbsoluteFill className="flex flex-col items-start justify-end px-24 py-24">
        <span
          style={fadeSlideUp(frame, 0, 24)}
          className={`inline-block rounded-full px-6 py-2 text-[28px] font-semibold tracking-wide uppercase ${theme.badge}`}
        >
          Introduction
        </span>

        <h1
          style={fadeSlideUp(frame, 4)}
          className={`mt-8 max-w-6xl text-[130px] leading-[1.05] font-extrabold ${
            hasImage ? "text-white" : theme.heading
          }`}
        >
          {slide.heading}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
