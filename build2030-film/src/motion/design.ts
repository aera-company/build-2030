/**
 * GAVEA / BUILD 2030 · V3 · design do filme.
 * Tudo que é visual e ajustável mora aqui: cores, escala tipográfica, margens, linha, grão, grade.
 */
import type React from 'react';

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  navyDeep: '#050f1a',
  navy: '#081e2f',
  ink: '#0a1826',
  cream: '#f3f1ec',
  teal: '#1b8fb5',
  tealSoft: '#7fc6dc',
  head: '#e6f6ff',
  muted: 'rgba(243,241,236,0.56)',
  mutedInk: 'rgba(10,24,38,0.42)',
  rule: 'rgba(243,241,236,0.16)',
  ruleInk: 'rgba(10,24,38,0.18)',
};

export const FONT_DISPLAY = 'GAVEA Display'; // Mona Sans variável
export const FONT_MONO = 'GAVEA Mono'; // Geist Mono

/** Margens e grid. */
export const M = 96;
export const GRID = {top: 132, baseline: 952};

/** Escala tipográfica: N1 impacto · N2 frase · N3 frente · N4 micro. */
export const TYPE = {
  n1: 184, // palavras-impacto (glifos 680/112)
  title: 160, // BUILD 2030
  direction: 230, // DIRECTION
  n2: 76,
  n3: 25,
  n4: 17,
  anchor: 30, // MAIS
};

/** A linha. */
export const LINE = {
  width: 2.4,
  widthThin: 1.4,
  headR: 4.2,
  glowR: 34,
  tick: 9,
};

export const GRAIN = {dark: 0.075, light: 0.05};

/** Duotone (gradient map de 3 paradas, em sRGB). */
export const DUO = {
  lo: [5, 15, 26],
  mid: [34, 78, 102],
  hi: [218, 232, 238],
  contrast: 1.12,
};

export const sentence = (size = TYPE.n2, color = C.cream): React.CSSProperties => ({
  fontFamily: FONT_DISPLAY,
  fontVariationSettings: '"wght" 560, "wdth" 100',
  fontSize: size,
  lineHeight: 1.06,
  letterSpacing: '-0.025em',
  color,
  whiteSpace: 'nowrap',
});

export const micro = (size = TYPE.n4, color = C.cream, tracking = 0.2): React.CSSProperties => ({
  fontFamily: FONT_MONO,
  fontVariationSettings: '"wght" 500',
  fontSize: size,
  lineHeight: 1,
  letterSpacing: `${tracking}em`,
  textTransform: 'uppercase',
  color,
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
});
