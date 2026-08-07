import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Slide } from "./components/Slide";
import type { EducationalVideoProps } from "./types";

export const MainSequence: React.FC<EducationalVideoProps> = ({
  videoId,
  manifest,
  slideDurationsInFrames,
}) => {
  if (!manifest || !slideDurationsInFrames) {
    return null;
  }

  return (
    <AbsoluteFill className="bg-white">
      <Series>
        {manifest.slides.map((slide, index) => (
          <Series.Sequence
            key={index}
            durationInFrames={slideDurationsInFrames[index]}
            name={`Slide ${index + 1}: ${slide.heading}`}
          >
            <Slide
              slide={slide}
              template={manifest.template}
              videoId={videoId}
              durationInFrames={slideDurationsInFrames[index]}
              index={index}
            />
            <Audio
              src={staticFile(`generated/${videoId}/${slide.audioFile}`)}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
