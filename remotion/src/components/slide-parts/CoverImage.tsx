import { Img, useCurrentFrame } from "remotion";
import { kenBurnsScale } from "../../animations";

/** Full-bleed cover image with a slow Ken Burns zoom — used for the intro hero only. */
export const CoverImage: React.FC<{
  src: string;
  durationInFrames: number;
}> = ({ src, durationInFrames }) => {
  const frame = useCurrentFrame();

  return (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        scale: kenBurnsScale(frame, durationInFrames),
      }}
    />
  );
};
