/**
 * GAVEA / BUILD 2030 · tokens do filme. Cores amostradas da marca oficial (navy, teal) e do hero.
 */
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const NAVY_DEEP = '#050f1a';
export const NAVY = '#081e2f';
export const WHITE = '#f3f1ec';
export const TEAL = '#1b8fb5';
export const TEAL_SOFT = '#7fc6dc';
export const MUTED = 'rgba(243,241,236,0.58)';
export const LINE = 'rgba(243,241,236,0.14)';
export const LINE_STRONG = 'rgba(243,241,236,0.28)';
/** compat com componentes herdados da AERA */
export const LIGHT = WHITE;
export const LINE_DARK_STRONG = LINE_STRONG;

export type Rect = {x: number; y: number; w: number; h: number};

export const FONT_DISPLAY = 'GAVEA Display'; // Mona Sans variável (wght 200–900, wdth 75–125)
export const FONT_MONO = 'GAVEA Mono'; // Geist Mono

/** Label editorial: mono, caps, tracking largo (o .label do hero). */
export const microStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontVariationSettings: '"wght" 500',
  fontSize: 15,
  lineHeight: 1,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

export const indexStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontVariationSettings: '"wght" 500',
  fontSize: 15,
  lineHeight: 1.5,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

/** Display: Mona Sans 600, wdth 110, tracking fechado (as palavras-sistema). */
export const displayStyle = (size: number, wdth = 110, tracking = -0.02, wght = 600): React.CSSProperties => ({
  fontFamily: FONT_DISPLAY,
  fontVariationSettings: `"wght" ${wght}, "wdth" ${wdth}`,
  fontSize: size,
  lineHeight: 1,
  letterSpacing: `${tracking}em`,
  whiteSpace: 'nowrap',
  fontKerning: 'normal',
});

/** Frases em sentence case: Mona Sans 500, wdth 100. */
export const sentenceStyle = (size: number): React.CSSProperties => ({
  fontFamily: FONT_DISPLAY,
  fontVariationSettings: '"wght" 500, "wdth" 100',
  fontSize: size,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
});
