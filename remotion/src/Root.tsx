import "./index.css";
import { Composition } from "remotion";
import { calculateMetadata } from "./calculateMetadata";
import { MainSequence } from "./MainSequence";
import {
  PHOTOSYNTHESIS_DURATION_IN_FRAMES,
  PhotosynthesisVideo,
} from "./PhotosynthesisVideo";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EducationalVideo"
        component={MainSequence}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={FPS * 10}
        defaultProps={{ videoId: "" }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="FotossintesePortugues"
        component={PhotosynthesisVideo}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={PHOTOSYNTHESIS_DURATION_IN_FRAMES}
      />
    </>
  );
};
