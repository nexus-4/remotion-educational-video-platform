import type {
  AnimationStyleId,
  Slide as SlideData,
  VideoTemplate,
} from "../types";
import { THEME } from "../theme";
import {
  BigStatLayout,
  ComparisonLayout,
  ContentSplitLayout,
  ContentStackedLayout,
  DefinitionLayout,
  ExampleSpotlightLayout,
  FormulaLayout,
  GradientTitleLayout,
  IntroLayout,
  OutroLayout,
  TextOnlyLayout,
  TimelineLayout,
} from "./slide-layouts";

type SlideProps = {
  slide: SlideData;
  template: VideoTemplate;
  videoId: string;
  durationInFrames: number;
  index: number;
  animationStyle: AnimationStyleId;
};

/**
 * Picks which layout to render for a slide:
 * - `intro` always gets the full-bleed hero; `outro` always gets the celebratory closer.
 * - `formula`, `comparison`, `timeline`, `big_stat`, and `definition` each get their own
 *   dedicated layout, regardless of illustration/bullets.
 * - a slide with no illustration AND no bullets is a short, punchy statement — it gets
 *   the minimalist gradient-title scene instead of the plain text layout.
 * - anything else without an illustration falls back to the full-bleed text-only layout.
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
  animationStyle,
}) => {
  const theme = THEME[template];
  const hasImage = Boolean(slide.imageFile);
  const hasBullets = Boolean(slide.bullets && slide.bullets.length > 0);

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

  if (slide.type === "outro") {
    return <OutroLayout slide={slide} theme={theme} />;
  }

  if (slide.type === "formula") {
    return <FormulaLayout slide={slide} theme={theme} />;
  }

  if (slide.type === "comparison") {
    return <ComparisonLayout slide={slide} theme={theme} />;
  }

  if (slide.type === "timeline") {
    return <TimelineLayout slide={slide} theme={theme} />;
  }

  if (slide.type === "big_stat") {
    return (
      <BigStatLayout
        slide={slide}
        theme={theme}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (slide.type === "definition") {
    return <DefinitionLayout slide={slide} theme={theme} />;
  }

  if (!hasImage && !hasBullets) {
    return (
      <GradientTitleLayout
        slide={slide}
        theme={theme}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (!hasImage) {
    return (
      <TextOnlyLayout
        slide={slide}
        theme={theme}
        animationStyle={animationStyle}
      />
    );
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
      animationStyle={animationStyle}
    />
  ) : (
    <ContentStackedLayout
      slide={slide}
      theme={theme}
      videoId={videoId}
      durationInFrames={durationInFrames}
      animationStyle={animationStyle}
    />
  );
};
