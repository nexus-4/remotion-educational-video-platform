export type SlideType =
  | "intro"
  | "content"
  | "formula"
  | "example"
  | "comparison"
  | "timeline"
  | "big_stat"
  | "definition"
  | "outro";

export type VideoTemplate =
  | "notebook_lm"
  | "standard_lecture"
  | "clean_minimal";

export type VideoFormatId = "short" | "deep_dive";

export type AnimationStyleId = "highlight" | "underline" | "pop_in";

export type Slide = {
  type: SlideType;
  heading: string;
  narration: string;
  bullets: string[] | null;
  formula: string | null;
  highlightTerms: string[] | null;
  leftLabel: string | null;
  leftItems: string[] | null;
  rightLabel: string | null;
  rightItems: string[] | null;
  steps: string[] | null;
  statValue: string | null;
  statLabel: string | null;
  term: string | null;
  definition: string | null;
  audioFile: string;
  imageFile: string | null;
};

export type RenderManifest = {
  title: string;
  summary: string;
  template: VideoTemplate;
  format: VideoFormatId;
  animationStyle: AnimationStyleId;
  logoFile?: string | null;
  slides: Slide[];
};

export type EducationalVideoProps = {
  videoId: string;
  manifest?: RenderManifest;
  slideDurationsInFrames?: number[];
};
