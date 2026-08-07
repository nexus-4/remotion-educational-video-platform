import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import type { Slide as SlideData } from "../../types";
import type { Theme } from "../../theme";
import { fadeSlideUp } from "../../animations";
import { AcademicTexture, CoverImage, FittedHeading } from "../slide-parts";

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

        <FittedHeading
          text={slide.heading}
          maxFontSize={130}
          maxBoxWidth={1152}
          maxLines={3}
          style={fadeSlideUp(frame, 4)}
          className={`mt-8 ${hasImage ? "text-white" : theme.heading}`}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
