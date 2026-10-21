import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import type { CSSProperties, ReactNode } from "react";

const FPS = 30;
const SLIDE_DURATION = 5 * FPS;

const colors = {
  ink: "#123229",
  muted: "#557268",
  cream: "#f8f7ed",
  green: "#2f855a",
  deepGreen: "#14532d",
  lime: "#b7e36b",
  yellow: "#f5c95d",
  blue: "#5aa9d6",
  orange: "#ee8b4b",
  white: "#ffffff",
};

const slideData = [
  ["BIOLOGIA EM 30 SEGUNDOS", "Fotossíntese", "Como as plantas transformam luz em energia", colors.green],
  ["01 · A FÁBRICA DE ENERGIA", "Tudo começa na folha", "Dentro das células vegetais, os cloroplastos capturam a luz do Sol.", colors.yellow],
  ["02 · OS INGREDIENTES", "Luz + água + gás carbônico", "A planta absorve água pelas raízes e CO₂ pelos estômatos das folhas.", colors.blue],
  ["03 · A TRANSFORMAÇÃO", "A energia vira glicose", "A clorofila usa a luz para reorganizar os ingredientes em alimento.", colors.orange],
  ["04 · O QUE SAI", "Alimento para a planta, oxigênio para nós", "A glicose alimenta o crescimento. O oxigênio é liberado para a atmosfera.", colors.lime],
] as const;

const fadeUp = (frame: number, start = 0): CSSProperties => ({
  opacity: interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
  translate: `0 ${interpolate(frame, [start, start + 18], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
});

const SceneShell: React.FC<{ children: ReactNode; accent: string; slideNumber: number }> = ({ children, accent, slideNumber }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "74px 92px", color: colors.ink, fontFamily: "Inter, Arial, sans-serif", background: `radial-gradient(circle at 86% 18%, ${accent}55 0, transparent 28%), linear-gradient(135deg, ${colors.cream} 0%, #eef5e7 100%)` }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: interpolate(frame, [0, 32], [0, 1920], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), height: 8, background: accent }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <div style={{ position: "absolute", right: 92, bottom: 54, color: colors.muted, fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>{String(slideNumber).padStart(2, "0")} / 06</div>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ children: ReactNode; frame: number }> = ({ children, frame }) => (
  <div style={{ ...fadeUp(frame), display: "inline-flex", borderRadius: 999, padding: "10px 18px", background: "rgba(255,255,255,0.7)", color: colors.deepGreen, fontSize: 20, fontWeight: 700, letterSpacing: 1.2 }}>{children}</div>
);

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell accent={colors.green} slideNumber={1}>
      <Pill frame={frame}>{slideData[0][0]}</Pill>
      <div style={{ display: "flex", alignItems: "center", gap: 94, marginTop: 88 }}>
        <div style={{ width: 980 }}>
          <div style={{ ...fadeUp(frame, 10), fontSize: 112, fontWeight: 800, lineHeight: 1.02 }}>{slideData[0][1]}</div>
          <div style={{ ...fadeUp(frame, 24), marginTop: 28, maxWidth: 770, color: colors.muted, fontSize: 38, lineHeight: 1.25 }}>{slideData[0][2]}</div>
        </div>
        <div style={{ ...fadeUp(frame, 18), position: "relative", width: 530, height: 530 }}>
          <div style={{ position: "absolute", top: 30, right: 22, width: 170, height: 170, borderRadius: "50%", background: colors.yellow, boxShadow: `0 0 0 22px ${colors.yellow}30, 0 0 80px ${colors.yellow}99` }} />
          {Array.from({ length: 8 }).map((_, index) => <div key={index} style={{ position: "absolute", top: 103, right: 105, width: 250, height: 4, background: colors.yellow, transformOrigin: "0 50%", rotate: `${index * 45}deg`, opacity: 0.7 }} />)}
          <div style={{ position: "absolute", bottom: 42, left: 242, width: 16, height: 300, borderRadius: 20, background: colors.deepGreen }} />
          <div style={{ position: "absolute", bottom: 170, left: 112, width: 190, height: 112, borderRadius: "100% 0 100% 0", background: colors.green, rotate: "-24deg" }} />
          <div style={{ position: "absolute", bottom: 244, left: 254, width: 190, height: 112, borderRadius: "0 100% 0 100%", background: "#63a85a", rotate: "18deg" }} />
          <div style={{ position: "absolute", bottom: 28, left: 132, width: 250, height: 86, borderRadius: "50%", background: "#c9935d" }} />
        </div>
      </div>
    </SceneShell>
  );
};

const Diagram: React.FC<{ slideNumber: number; frame: number }> = ({ slideNumber, frame }) => {
  if (slideNumber === 2) {
    return <div style={{ display: "flex", alignItems: "center", gap: 52 }}>
      <div style={{ ...fadeUp(frame, 28), width: 670, height: 295, borderRadius: "70% 20% 70% 20%", background: "linear-gradient(135deg, #2f855a, #9bcf68)", rotate: "-8deg", boxShadow: "0 22px 40px #2f855a33" }} />
      <div style={{ ...fadeUp(frame, 38), display: "grid", gap: 18 }}>{["Cloroplasto", "Clorofila", "Luz capturada"].map((label, index) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: [colors.green, colors.lime, colors.yellow][index] }} />{label}</div>)}</div>
    </div>;
  }
  if (slideNumber === 3) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1520 }}>{[["☀", "Luz solar", colors.yellow], ["H₂O", "Água", colors.blue], ["CO₂", "Gás carbônico", colors.orange]].map(([icon, label, color], index) => <div key={label} style={{ ...fadeUp(frame, 28 + index * 10), display: "flex", alignItems: "center", gap: 22 }}><div style={{ display: "grid", placeItems: "center", width: 174, height: 174, borderRadius: 42, background: `${color}33`, color, fontSize: icon.length > 2 ? 35 : 78, fontWeight: 800 }}>{icon}</div><div style={{ fontSize: 31, fontWeight: 700, maxWidth: 170 }}>{label}</div>{index < 2 && <div style={{ color: colors.muted, fontSize: 62 }}>+</div>}</div>)}</div>;
  }
  if (slideNumber === 4) {
    return <div style={{ ...fadeUp(frame, 30), display: "flex", alignItems: "center", gap: 20, padding: "42px 50px", borderRadius: 34, background: colors.white, boxShadow: "0 18px 50px #14532d18" }}>{["6 CO₂", "+", "6 H₂O", "+", "luz", "→", "C₆H₁₂O₆", "+", "6 O₂"].map((item, index) => <div key={`${item}-${index}`} style={{ minWidth: item.length > 1 && item !== "luz" ? 120 : 50, padding: item === "+" || item === "→" ? 0 : "24px 12px", textAlign: "center", borderRadius: 20, background: item === "+" || item === "→" ? "transparent" : "#b7e36b55", color: item === "→" ? colors.green : colors.ink, fontSize: item === "→" ? 60 : 29, fontWeight: 800 }}>{item}</div>)}</div>;
  }
  return <div style={{ display: "flex", gap: 44 }}>{[["🍃", "Glicose", "Energia e matéria-prima para crescer.", colors.green], ["O₂", "Oxigênio", "Liberado no ar que respiramos.", colors.blue]].map(([icon, title, description, color], index) => <div key={title} style={{ ...fadeUp(frame, 26 + index * 12), width: 520, minHeight: 220, display: "flex", alignItems: "center", gap: 30, padding: 34, borderRadius: 30, background: colors.white, boxShadow: "0 18px 50px #14532d18", borderLeft: `12px solid ${color}` }}><div style={{ display: "grid", placeItems: "center", width: 112, height: 112, borderRadius: "50%", background: `${color}2d`, color, fontSize: icon.length > 2 ? 52 : 45, fontWeight: 800 }}>{icon}</div><div><div style={{ fontSize: 34, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 8, color: colors.muted, fontSize: 24, lineHeight: 1.25 }}>{description}</div></div></div>)}</div>;
};

const ProcessScene: React.FC<{ slideNumber: number }> = ({ slideNumber }) => {
  const frame = useCurrentFrame();
  const [eyebrow, title, subtitle, accent] = slideData[slideNumber - 1];
  return <SceneShell accent={accent} slideNumber={slideNumber}><Pill frame={frame}>{eyebrow}</Pill><div style={{ ...fadeUp(frame, 8), marginTop: 28, maxWidth: 1350, fontSize: 67, fontWeight: 800, lineHeight: 1.08 }}>{title}</div><div style={{ ...fadeUp(frame, 18), marginTop: 18, maxWidth: 1120, color: colors.muted, fontSize: 29, lineHeight: 1.35 }}>{subtitle}</div><div style={{ marginTop: 54 }}><Diagram slideNumber={slideNumber} frame={frame} /></div></SceneShell>;
};

const MetricTable: React.FC<{ frame: number; title: string; rows: string[][]; delay: number }> = ({ frame, title, rows, delay }) => <div style={{ ...fadeUp(frame, delay), flex: 1, overflow: "hidden", borderRadius: 26, background: colors.white, boxShadow: "0 18px 50px #14532d18" }}><div style={{ padding: "20px 28px", background: colors.deepGreen, color: colors.white, fontSize: 26, fontWeight: 800 }}>{title}</div>{rows.map(([label, value], index) => <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "18px 28px", background: index % 2 === 0 ? "#f7faf2" : colors.white, fontSize: 24 }}><span style={{ color: colors.muted }}>{label}</span><strong>{value}</strong></div>)}</div>;

const MetricsScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <SceneShell accent={colors.green} slideNumber={6}><Pill frame={frame}>MÉTRICAS DO VÍDEO</Pill><div style={{ ...fadeUp(frame, 8), marginTop: 28, fontSize: 67, fontWeight: 800 }}>Resumo técnico</div><div style={{ ...fadeUp(frame, 18), marginTop: 12, color: colors.muted, fontSize: 27 }}>Uma leitura rápida do conteúdo produzido.</div><div style={{ display: "flex", gap: 34, marginTop: 52 }}><MetricTable frame={frame} title="Estrutura" rows={[["Slides", "6"], ["Duração", "30 s"], ["Ritmo", "5 s / slide"], ["Idioma", "Português"]]} delay={28} /><MetricTable frame={frame} title="Formato" rows={[["Resolução", "1920 × 1080"], ["Proporção", "16:9"], ["Quadros", "30 fps"], ["Tema", "Ciências"]]} delay={42} /></div></SceneShell>;
};

export const PhotosynthesisVideo: React.FC = () => <AbsoluteFill style={{ backgroundColor: colors.cream }}>{[<IntroScene key="intro" />, <ProcessScene key="leaf" slideNumber={2} />, <ProcessScene key="ingredients" slideNumber={3} />, <ProcessScene key="formula" slideNumber={4} />, <ProcessScene key="outputs" slideNumber={5} />, <MetricsScene key="metrics" />].map((scene, index) => <Sequence key={index} from={index * SLIDE_DURATION} durationInFrames={SLIDE_DURATION}>{scene}</Sequence>)}</AbsoluteFill>;

export const PHOTOSYNTHESIS_DURATION_IN_FRAMES = 6 * SLIDE_DURATION;
