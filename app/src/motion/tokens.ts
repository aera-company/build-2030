/* ============================================================
   MOTION TOKENS
   Um só lugar para duração, easing, stagger, escala, blur e
   opacidade. Nenhum número de motion solto nos componentes.
   ============================================================ */

export type Ease = (t: number) => number;

/** Easings com massa: cúbico e exponencial. Sem spring, sem bounce. */
export const EASE = {
  linear: ((t) => t) as Ease,
  out: ((t) => 1 - Math.pow(1 - t, 3)) as Ease,
  in: ((t) => t * t * t) as Ease,
  inOut: ((t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) as Ease,
  /** Saída forte: chega rápido, assenta devagar. Para entradas de tipo. */
  expoOut: ((t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))) as Ease,
  /** Entrada forte: parte devagar, acelera. Para saídas e hand-offs. */
  expoIn: ((t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10))) as Ease,
  /** Quártico de saída: um pouco mais seco que o expo. Para labels. */
  quartOut: ((t) => 1 - Math.pow(1 - t, 4)) as Ease,
  /** Cinemático: lento nas duas pontas, com corpo no meio. */
  cinematic: ((t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2) as Ease,
};

/** Curvas CSS equivalentes, para os poucos casos de transição discreta. */
export const CSS_EASE = {
  punch: "cubic-bezier(0.16, 1, 0.3, 1)",
  flow: "cubic-bezier(0.65, 0, 0.35, 1)",
  mass: "cubic-bezier(0.7, 0, 0.2, 1)",
} as const;

/** Durações (ms) para transições discretas. O scroll dita o resto. */
export const DUR = {
  fast: 160,
  punch: 320,
  flow: 640,
  hold: 1200,
  cinematic: 2200,
} as const;

/** Faixas de escala usadas pelas camadas. */
export const SCALE = {
  /** Canvas em modo macro (abertura). */
  macro: 1.22,
  /** Canvas no mundo aberto. */
  world: 1,
  /** Canvas no hand-off (entra no material). */
  dive: 1.32,
  /** Tipografia chegando de perto demais para o lugar. */
  typeIn: 2.4,
  /** Tipografia recuando para virar ambiente/label. */
  typeSettle: 0.42,
  /** Logo do centro para o canto. */
  markCorner: 0.34,
} as const;

/** Profundidade do campo de palavras: 3 níveis discretos, sem blur interpolado. */
export const DEPTH = {
  far: { scale: 0.72, opacity: 0.38, blur: 3 },
  mid: { scale: 0.88, opacity: 0.66, blur: 1.2 },
  near: { scale: 1, opacity: 1, blur: 0 },
} as const;

/** Stagger em unidades de progresso (0–1 do bloco). */
export const STAGGER = {
  labels: 0.03,
  words: 0.045,
  windows: 0.06,
} as const;

/** Opacidade do véu navy sobre o material, por estado. */
export const VEIL = {
  opening: 0.86,
  logo: 0.72,
  world: 0.4,
  reveal: 0.28,
  dive: 0.96,
} as const;
