import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import type { EducationalVideoProps, RenderManifest } from "./types";

const FPS = 30;
const SLIDE_PADDING_IN_SECONDS = 1;
const MINIMUM_SLIDE_DURATION_IN_SECONDS = 3;

export const calculateMetadata: CalculateMetadataFunction<
  EducationalVideoProps
> = async ({ props, abortSignal }) => {
  const manifestResponse = await fetch(
    staticFile(`generated/${props.videoId}/manifest.json`),
    { signal: abortSignal },
  );
  const manifest: RenderManifest = await manifestResponse.json();

  const slideDurationsInFrames = await Promise.all(
    manifest.slides.map(async (slide) => {
      const audioDurationInSeconds = await getAudioDurationInSeconds(
        staticFile(`generated/${props.videoId}/${slide.audioFile}`),
      );

      const durationInSeconds = Math.max(
        audioDurationInSeconds + SLIDE_PADDING_IN_SECONDS,
        MINIMUM_SLIDE_DURATION_IN_SECONDS,
      );

      return Math.ceil(durationInSeconds * FPS);
    }),
  );

  const durationInFrames = slideDurationsInFrames.reduce(
    (total, frames) => total + frames,
    0,
  );

  return {
    durationInFrames: Math.max(durationInFrames, FPS),
    props: {
      ...props,
      manifest,
      slideDurationsInFrames,
    },
  };
};
