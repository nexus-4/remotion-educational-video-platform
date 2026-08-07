import type { Slide as SlideData, VideoTemplate } from "../types";
import { THEME } from "../theme";
import {
  ContentSplitLayout,
  ContentStackedLayout,
  ExampleSpotlightLayout,
  FormulaLayout,
  IntroLayout,
  TextOnlyLayout,
} from "./slide-layouts";

type SlideProps = {
  slide: SlideData;
  template: VideoTemplate;
  videoId: string;
  durationInFrames: number;
  index: number;
};

/**
 * Picks which layout to render for a slide:
 * - `intro` always gets the full-bleed hero.
 * - `formula` always gets the themed formula panel.
 * - anything without an illustration falls back to the full-bleed text-only layout.
 * - `example` slides with an illustration get the centered spotlight treatment.
 * - other illustrated slides alternate between the split and stacked layouts by index,
 *   purely for visual variety across a video's slides.
 */
export const Slide: React.FC<SlideProps> = ({
  slide,
  template,
  videoId,
  durationInFrames,
  index,
}) => {
  const theme = THEME[template];
  const hasImage = Boolean(slide.imageFile);

  if (slide.type === "intro") {
    return (
      <IntroLayout
        slide={slide}
        theme={theme}
        videoId={videoId}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (slide.type === "formula") {
    return <FormulaLayout slide={slide} theme={theme} />;
  }

  if (!hasImage) {
    return <TextOnlyLayout slide={slide} theme={theme} />;
  }

  if (slide.type === "example") {
    return (
      <ExampleSpotlightLayout
        slide={slide}
        theme={theme}
        videoId={videoId}
        durationInFrames={durationInFrames}
      />
    );
  }

  return index % 2 === 0 ? (
    <ContentSplitLayout
      slide={slide}
      theme={theme}
      videoId={videoId}
      durationInFrames={durationInFrames}
      mirrored={false}
    />
  ) : (
    <ContentStackedLayout
      slide={slide}
      theme={theme}
      videoId={videoId}
      durationInFrames={durationInFrames}
    />
  );
};
