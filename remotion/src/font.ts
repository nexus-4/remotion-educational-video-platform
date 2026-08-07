import { loadFont } from "@remotion/google-fonts/Inter";

/**
 * Loaded once and shared across the whole composition so every layout renders with
 * the same, deterministic font regardless of what's installed on the render machine —
 * and so `fitTextOnNLines` measures against the exact font that actually renders.
 */
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "800"],
  subsets: ["latin"],
});
