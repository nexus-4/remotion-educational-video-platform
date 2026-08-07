/** Faint ruled-paper / graph-paper texture — reads as "academic notes", not a generic gradient. */
export const AcademicTexture: React.FC<{ lineColor: string }> = ({
  lineColor,
}) => (
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
