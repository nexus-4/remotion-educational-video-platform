import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { Slide as SlideData, VideoTemplate } from "../types";
import { MarkerHighlight } from "./MarkerHighlight";

const ENTRANCE_DURATION_IN_FRAMES = 20;
const HIGHLIGHT_STAGGER_IN_FRAMES = 12;
const KEN_BURNS_END_SCALE = 1.06;

const SLIDE_BADGE_LABEL: Record<SlideData["type"], string> = {
  intro: "Intro",
  content: "Ideia Chave",
  formula: "Formula",
  example: "Exemplo",
};

type Theme = {
  background: string;
  panelBackground: string;
  overlayTo: string;
  overlayFrom: string;
  badge: string;
  heading: string;
  body: string;
  accent: string;
  ruleLineColor: string;
  frame: string;
  formulaPanel: string;
};

const THEME: Record<VideoTemplate, Theme> = {
  notebook_lm: {
    background: "bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100",
    panelBackground: "bg-gradient-to-br from-orange-50 to-amber-100",
    overlayTo: "rgba(120, 53, 15, 0.88)",
    overlayFrom: "rgba(255, 247, 237, 0)",
    badge: "bg-orange-200 text-orange-800",
    heading: "text-slate-900",
    body: "text-slate-700",
    accent: "rgba(251, 191, 36, 0.55)",
    ruleLineColor: "rgba(180, 83, 9, 0.14)",
    frame: "bg-white ring-1 ring-orange-200",
    formulaPanel: "bg-white/70 text-orange-800 ring-1 ring-orange-200",
  },
  standard_lecture: {
    background: "bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950",
    panelBackground: "bg-gradient-to-br from-slate-900 to-indigo-950",
    overlayTo: "rgba(2, 6, 23, 0.92)",
    overlayFrom: "rgba(2, 6, 23, 0)",
    badge: "bg-indigo-500/20 text-indigo-200",
    heading: "text-white",
    body: "text-slate-200",
    accent: "rgba(129, 140, 248, 0.55)",
    ruleLineColor: "rgba(148, 163, 184, 0.1)",
    frame: "bg-white/95 ring-1 ring-white/50",
    formulaPanel: "bg-white/5 text-indigo-200 ring-1 ring-white/10",
  },
};

const fadeSlideUp = (
  frame: number,
  startFrame: number,
  distance = 40,
): React.CSSProperties => ({
  opacity: interpolate(
    frame,
    [startFrame, startFrame + ENTRANCE_DURATION_IN_FRAMES],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  ),
  translate: interpolate(
    frame,
    [startFrame, startFrame + ENTRANCE_DURATION_IN_FRAMES],
    [`0px ${distance}px`, "0px 0px"],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  ),
});

/** Faint ruled-paper / graph-paper texture — reads as "academic notes", not a generic gradient. */
const AcademicTexture: React.FC<{ lineColor: string }> = ({ lineColor }) => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: [
        `repeating-linear-gradient(to bottom, transparent 0 62px, ${lineColor} 62px 64px)`,
        `repeating-linear-gradient(to right, transparent 0 62px, ${lineColor} 62px 64px)`,
      ].join(", "),
    }}
  />
);

const SlideBadge: React.FC<{ type: SlideData["type"]; theme: Theme }> = ({
  type,
  theme,
}) => (
  <span
    className={`inline-block rounded-full px-6 py-2 text-[26px] font-semibold tracking-wide uppercase ${theme.badge}`}
  >
    {SLIDE_BADGE_LABEL[type]}
  </span>
);

const SlideBullets: React.FC<{
  bullets: string[];
  theme: Theme;
  align?: "left" | "center";
}> = ({ bullets, theme, align = "left" }) => {
  const frame = useCurrentFrame();

  return (
    <ul className={`mt-8 space-y-4 ${align === "center" ? "text-center" : ""}`}>
      {bullets.map((bullet, index) => {
        const startFrame = ENTRANCE_DURATION_IN_FRAMES + index * 6;

        return (
          <li
            key={bullet}
            style={{
              opacity: interpolate(
                frame,
                [startFrame, startFrame + 10],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
            className={`text-[36px] leading-snug ${theme.body}`}
          >
            {align === "left" ? "• " : ""}
            {bullet}
          </li>
        );
      })}
    </ul>
  );
};

const HighlightChips: React.FC<{
  terms: string[];
  theme: Theme;
  align?: "left" | "center";
}> = ({ terms, theme, align = "left" }) => (
  <div
    className={`mt-10 flex flex-wrap gap-4 ${align === "center" ? "justify-center" : ""}`}
  >
    {terms.map((term, index) => (
      <MarkerHighlight
        key={term}
        startFrame={
          ENTRANCE_DURATION_IN_FRAMES + index * HIGHLIGHT_STAGGER_IN_FRAMES
        }
        color={theme.accent}
      >
        <span className={`text-[32px] font-semibold ${theme.heading}`}>
          {term}
        </span>
      </MarkerHighlight>
    ))}
  </div>
);

/** Full-bleed cover image with a slow Ken Burns zoom — used for the intro hero only. */
const CoverImage: React.FC<{ src: string; durationInFrames: number }> = ({
  src,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        scale: interpolate(
          frame,
          [0, Math.max(durationInFrames, 1)],
          [1, KEN_BURNS_END_SCALE],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    />
  );
};

/**
 * A matted "figure" card that always shows the whole illustration (object-fit: contain),
 * so a mismatch between the generated image's aspect ratio and the card's never crops it.
 */
const FramedFigure: React.FC<{
  src: string;
  durationInFrames: number;
  theme: Theme;
  className?: string;
}> = ({ src, durationInFrames, theme, className }) => {
  const frame = useCurrentFrame();

  return (
    <div
      className={`overflow-hidden rounded-3xl p-6 shadow-2xl ${theme.frame} ${className ?? ""}`}
    >
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          scale: interpolate(
            frame,
            [0, Math.max(durationInFrames, 1)],
            [1, KEN_BURNS_END_SCALE],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
    </div>
  );
};

const IntroSlide: React.FC<{
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

/** Text panel on one side, framed figure filling the other — the default two-up layout. */
const ContentSplit: React.FC<{
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

/** Framed figure spanning the top, text and bullets below — the alternate layout for variety. */
const ContentStacked: React.FC<{
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

/** Centered "figure with caption" treatment reserved for worked examples. */
const ExampleSpotlight: React.FC<{
  slide: SlideData;
  theme: Theme;
  videoId: string;
  durationInFrames: number;
}> = ({ slide, theme, videoId, durationInFrames }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-8 px-24 py-16 ${theme.background}`}
    >
      <div style={fadeSlideUp(frame, 0, 24)}>
        <SlideBadge type="example" theme={theme} />
      </div>

      <div className="h-[50%] w-full max-w-5xl">
        <FramedFigure
          src={staticFile(`generated/${videoId}/${slide.imageFile}`)}
          durationInFrames={durationInFrames}
          theme={theme}
          className="h-full w-full"
        />
      </div>

      <h1
        style={fadeSlideUp(frame, 4)}
        className={`max-w-4xl text-center text-[64px] leading-tight font-extrabold ${theme.heading}`}
      >
        {slide.heading}
      </h1>

      {slide.bullets && slide.bullets.length > 0 ? (
        <SlideBullets bullets={slide.bullets} theme={theme} align="center" />
      ) : null}

      {slide.highlightTerms && slide.highlightTerms.length > 0 ? (
        <HighlightChips
          terms={slide.highlightTerms}
          theme={theme}
          align="center"
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Full-bleed text-only treatment, used whenever a slide has no illustration. */
const TextSlide: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col justify-center px-28 ${theme.background}`}
    >
      <AcademicTexture lineColor={theme.ruleLineColor} />

      <div className="relative z-10 max-w-5xl">
        <div style={fadeSlideUp(frame, 0, 24)}>
          <SlideBadge type={slide.type} theme={theme} />
        </div>

        <h1
          style={fadeSlideUp(frame, 4)}
          className={`mt-8 text-[100px] leading-tight font-extrabold ${theme.heading}`}
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

const FormulaSlide: React.FC<{ slide: SlideData; theme: Theme }> = ({
  slide,
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      className={`flex flex-col items-center justify-center gap-12 ${theme.background}`}
    >
      <AcademicTexture lineColor={theme.ruleLineColor} />

      <div
        style={fadeSlideUp(frame, 0, 24)}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <SlideBadge type="formula" theme={theme} />
        <h1
          className={`max-w-4xl text-center text-[80px] leading-tight font-extrabold ${theme.heading}`}
        >
          {slide.heading}
        </h1>
      </div>

      {slide.formula ? (
        <div
          style={fadeSlideUp(frame, 10, 24)}
          className={`relative z-10 rounded-3xl px-16 py-12 text-center text-[76px] font-bold ${theme.formulaPanel}`}
        >
          {slide.formula}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

type SlideProps = {
  slide: SlideData;
  template: VideoTemplate;
  videoId: string;
  durationInFrames: number;
  index: number;
};

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
      <IntroSlide
        slide={slide}
        theme={theme}
        videoId={videoId}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (slide.type === "formula") {
    return <FormulaSlide slide={slide} theme={theme} />;
  }

  if (!hasImage) {
    return <TextSlide slide={slide} theme={theme} />;
  }

  if (slide.type === "example") {
    return (
      <ExampleSpotlight
        slide={slide}
        theme={theme}
        videoId={videoId}
        durationInFrames={durationInFrames}
      />
    );
  }

  return index % 2 === 0 ? (
    <ContentSplit
      slide={slide}
      theme={theme}
      videoId={videoId}
      durationInFrames={durationInFrames}
      mirrored={false}
    />
  ) : (
    <ContentStacked
      slide={slide}
      theme={theme}
      videoId={videoId}
      durationInFrames={durationInFrames}
    />
  );
};
