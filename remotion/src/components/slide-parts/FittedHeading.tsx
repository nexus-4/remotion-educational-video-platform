import { fitTextOnNLines } from "@remotion/layout-utils";
import { fontFamily } from "../../font";

/**
 * A heading that shrinks to fit its box instead of overflowing or getting cropped —
 * AI-generated headings have no guaranteed length, but the video frame does.
 * `maxFontSize` is the size used for short text; longer text only ever shrinks from there.
 */
export const FittedHeading: React.FC<{
  text: string;
  maxFontSize: number;
  maxBoxWidth: number;
  maxLines?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, maxFontSize, maxBoxWidth, maxLines = 2, className, style }) => {
  const { fontSize, lines } = fitTextOnNLines({
    text,
    maxLines,
    maxBoxWidth,
    fontFamily,
    fontWeight: 800,
    maxFontSize,
  });

  return (
    <h1
      className={className}
      style={{ ...style, fontSize, fontWeight: 800, lineHeight: 1.05 }}
    >
      {lines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </h1>
  );
};
