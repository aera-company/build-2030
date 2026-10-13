import {Easing, interpolate} from 'remotion';

/** Curvas. Nomes pelo que fazem, não pelo efeito. */
export const settle = Easing.bezier(0.16, 1, 0.3, 1); // chega com inércia, sem overshoot
export const glide = Easing.bezier(0.45, 0, 0.55, 1); // editorial, simétrica
export const expoOut = Easing.bezier(0.19, 1, 0.22, 1); // abertura rápida que assenta
export const leave = Easing.in(Easing.cubic); // sai com gravidade
export const linear = Easing.linear;

/** Progresso 0→1 entre os frames a e b, clampado. */
export const ramp = (
  f: number,
  a: number,
  b: number,
  easing: (t: number) => number = settle,
): number =>
  interpolate(f, [a, b], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Entra (a→b) e sai (c→d): 1 enquanto presente. */
export const window = (f: number, a: number, b: number, c: number, d: number): number =>
  ramp(f, a, b) - ramp(f, c, d, leave);

export type Pt = [number, number];

/** Comprimento acumulado de uma polilinha. */
export const polyLength = (pts: Pt[]): number => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return L;
};

/** Ponto à fração t (0..1) do comprimento de uma polilinha. */
export const pointAt = (pts: Pt[], t: number): Pt => {
  const L = polyLength(pts);
  let target = Math.max(0, Math.min(1, t)) * L;
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

/** Frações acumuladas (0..1) de cada vértice ao longo do comprimento. */
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
