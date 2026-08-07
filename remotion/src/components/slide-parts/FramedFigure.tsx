import { Img, useCurrentFrame } from "remotion";
import type { Theme } from "../../theme";
import { kenBurnsScale } from "../../animations";

/**
 * A matted "figure" card that always shows the whole illustration (object-fit: contain),
 * so a mismatch between the generated image's aspect ratio and the card's never crops it.
 */
export const FramedFigure: React.FC<{
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
          scale: kenBurnsScale(frame, durationInFrames),
        }}
      />
    </div>
  );
};
