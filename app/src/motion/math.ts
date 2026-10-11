import { EASE, type Ease } from "./tokens";

export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Progresso 0→1 dentro de um segmento [a, b] do progresso maior, já com easing.
 * É a unidade básica da linha do tempo: cada evento é um `seg`.
 */
export const seg = (p: number, a: number, b: number, ease: Ease = EASE.out) =>
  ease(clamp((p - a) / (b - a)));

/** Sobe em [a, b], segura, desce em [c, d]. Para elementos que entram e saem. */
export const pulse = (
  p: number,
  a: number,
  b: number,
  c: number,
  d: number,
  easeIn: Ease = EASE.out,
  easeOut: Ease = EASE.expoIn,
) => {
  if (p <= a) return 0;
  if (p < b) return easeIn((p - a) / (b - a));
  if (p <= c) return 1;
  if (p < d) return 1 - easeOut((p - c) / (d - c));
  return 0;
};

/** Mistura entre dois valores conforme t (já eased). */
export const mix = (a: number, b: number, t: number) => lerp(a, b, t);

/** Interpola dois vetores de números do mesmo tamanho. */
export const mixArray = (a: number[], b: number[], t: number) =>
  a.map((v, i) => lerp(v, b[i], t));

/** Ponto numa cúbica de Bézier. */
export const cubicPoint = (
  p0: [number, number],
  c1: [number, number],
  c2: [number, number],
  p1: [number, number],
  t: number,
): [number, number] => {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1],
  ];
};

export const fmt = (n: number, d = 3) => n.toFixed(d);
