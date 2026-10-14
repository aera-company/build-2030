/**
 * Três comportamentos e só eles.
 * settle: chegada, início rápido e desaceleração precisa (14–18 frames).
 * leave: saída, aceleração controlada (8–10 frames).
 * glide: movimento de câmera e de linha, simétrico, sem artefato de easing.
 * Sem bounce, sem elástico, sem spring.
 */
import {Easing, interpolate} from 'remotion';

export const settle = Easing.bezier(0.16, 1, 0.3, 1);
export const leave = Easing.bezier(0.55, 0, 0.85, 0.35);
export const glide = Easing.bezier(0.45, 0, 0.55, 1);
/** aceleração pura (para a convergência que "puxa"). */
export const pull = Easing.bezier(0.6, 0, 0.9, 0.6);

export const SETTLE = 16;
export const LEAVE = 9;

export const ramp = (f: number, a: number, b: number, easing: (t: number) => number = settle): number =>
  interpolate(f, [a, b], [0, 1], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Interpolação em escala logarítmica (zoom de câmera sem "acelerar no fim"). */
export const lerpLog = (a: number, b: number, t: number): number => Math.exp(lerp(Math.log(a), Math.log(b), t));

/** Presença: entra em [a, a+inDur], sai em [b, b+outDur]. */
export const presence = (f: number, a: number, b: number, inDur = SETTLE, outDur = LEAVE): number =>
  ramp(f, a, a + inDur, settle) * (1 - ramp(f, b, b + outDur, leave));

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type Pt = [number, number];

export const polyLength = (pts: Pt[]): number => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
};

export const polyFractions = (pts: Pt[]): number[] => {
  const L = polyLength(pts);
  const out = [0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    out.push(L === 0 ? 0 : acc / L);
  }
  return out;
};

export const pointAt = (pts: Pt[], t: number): Pt => {
  const L = polyLength(pts);
  let target = clamp01(t) * L;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (target <= seg) {
      const u = seg === 0 ? 0 : target / seg;
      return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
    }
    target -= seg;
  }
  return pts[pts.length - 1];
};

/** Sub-polilinha de 0 até a fração t. */
export const partial = (pts: Pt[], t: number): Pt[] => {
  if (t >= 1) return pts;
  if (t <= 0) return [pts[0], pts[0]];
  const fr = polyFractions(pts);
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (fr[i] < t) out.push(pts[i]);
    else break;
  }
  out.push(pointAt(pts, t));
  return out;
};
