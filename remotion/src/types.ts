export type SlideType = "intro" | "content" | "formula" | "example";

export type VideoTemplate = "notebook_lm" | "standard_lecture";

export type VideoFormatId = "short" | "deep_dive";

export type Slide = {
  type: SlideType;
  heading: string;
  narration: string;
  bullets: string[] | null;
  formula: string | null;
  highlightTerms: string[] | null;
  audioFile: string;
  imageFile: string | null;
};

export type RenderManifest = {
  title: string;
  summary: string;
  template: VideoTemplate;
  format: VideoFormatId;
  slides: Slide[];
};

export type EducationalVideoProps = {
  videoId: string;
  manifest?: RenderManifest;
  slideDurationsInFrames?: number[];
};
