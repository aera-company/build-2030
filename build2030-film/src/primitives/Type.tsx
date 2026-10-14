import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAP, GlyphWord, wordData} from '../components/GlyphWord';
import {C, LINE, micro, sentence, TYPE} from '../motion/design';
import {lerp, leave, ramp, settle} from '../motion/easing';

/**
 * Frase N2: cada linha sobe por dentro da própria máscara (a linha de base é a borda).
 * Sai subindo pela mesma máscara. Nunca fade.
 */
export const MaskLines: React.FC<{
  lines: string[];
  x: number;
  y: number;
  at: number;
  out?: number;
  size?: number;
  color?: string;
  stagger?: number;
}> = ({lines, x, y, at, out = 1e9, size = TYPE.n2, color = C.cream, stagger = 5}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > out + 14 + stagger * lines.length) return null;
  const lh = size * 1.06;
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {lines.map((l, i) => {
        const a = ramp(f, at + i * stagger, at + i * stagger + 18, settle);
        const b = ramp(f, out + i * stagger * 0.6, out + i * stagger * 0.6 + 10, leave);
        const ty = (1 - a) * 108 - b * 108;
        return (
          <div key={i} style={{position: 'relative', height: lh + size * 0.22, overflow: 'hidden', marginBottom: -size * 0.22}}>
            <div style={{...sentence(size, color), transform: `translateY(${ty}%)`}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Label N3/N4: abre da esquerda para a direita por máscara enquanto o tracking fecha.
 * Sai fechando pela direita.
 */
export const TickLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  at: number;
  out?: number;
  size?: number;
  color?: string;
  tracking?: number;
  upper?: boolean;
  align?: 'left' | 'right';
}> = ({text, x, y, at, out = 1e9, size = TYPE.n4, color = C.cream, tracking = 0.2, upper = true, align = 'left'}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > out + 12) return null;
  const a = ramp(f, at, at + 14, settle);
  const b = ramp(f, out, out + 9, leave);
  const tr = lerp(tracking + 0.32, tracking, a);
  const reveal = a * (1 - b);
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'left' ? x : undefined,
        right: align === 'right' ? 1920 - x : undefined,
        top: y,
        clipPath: align === 'left' ? `inset(-20% ${(1 - reveal) * 100}% -20% 0)` : `inset(-20% 0 -20% ${(1 - reveal) * 100}%)`,
      }}
    >
      <div style={{...micro(size, color, tr), textTransform: upper ? 'uppercase' : 'none'}}>{text}</div>
    </div>
  );
};

/**
 * Palavra N1 apoiada na linha: nasce de baixo da régua (a régua é a borda da máscara),
 * sai caindo de volta para dentro dela. `track` abre o tracking na entrada (em milésimos).
 */
export const ImpactWord: React.FC<{
  word: string;
  x: number;
  baseY: number;
  at: number;
  out?: number;
  size?: number;
  color?: string;
  track?: number;
  inDur?: number;
}> = ({word, x, baseY, at, out = 1e9, size = TYPE.n1, color = C.cream, track = 0, inDur = 15}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > out + 12) return null;
  const riseAt = (t: number) => (1 - ramp(t, at, at + inDur, settle)) * 1.08 + ramp(t, out, out + 9, leave) * 1.08; // em
  const a = ramp(f, at, at + inDur, settle);
  const rise = riseAt(f);
  // motion blur vertical: proporcional à velocidade (px/frame), meio obturador
  const blur = Math.min(18, Math.abs(riseAt(f) - riseAt(f - 1)) * size * 0.42);
  const id = `mbw-${at}-${word.length}`;
  const n = wordData(word).glyphs.length;
  const capPx = CAP * size;
  const pad = size * 0.24;
  return (
    <div style={{position: 'absolute', left: x - size * 0.3, top: baseY - capPx - size * 0.3, width: 1920, height: capPx + size * 0.3 + pad, overflow: 'hidden'}}>
      {blur > 0.4 ? <BlurDef id={id} sx={0} sy={blur} /> : null}
      <div style={{position: 'absolute', left: size * 0.3, top: capPx + size * 0.3 + rise * size, filter: blur > 0.4 ? `url(#${id})` : undefined}}>
        <GlyphWord
          word={word}
          size={size}
          color={color}
          offset={track ? (i) => (i - (n - 1) / 2) * track * (1 - a) : undefined}
        />
      </div>
    </div>
  );
};

/** Nó/ponto simples. */
export const Dot: React.FC<{x: number; y: number; r?: number; color?: string; o?: number}> = ({x, y, r = LINE.headR, color = C.cream, o = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: o}} />
);

/** Filtro de motion blur direcional (gaussiano com desvio por eixo). */
export const BlurDef: React.FC<{id: string; sx: number; sy: number}> = ({id, sx, sy}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
    </filter>
  </svg>
);

/**
 * Frase N2 apoiada numa linha (a linha é a borda da máscara): sobe de dentro dela e volta para dentro.
 * `align` center usa `x` como centro.
 */
export const LineSentence: React.FC<{
  text: string;
  x: number;
  baseY: number;
  at: number;
  out?: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center';
}> = ({text, x, baseY, at, out = 1e9, size = TYPE.n2, color = C.cream, align = 'left'}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > out + 12) return null;
  const riseAt = (t: number) => (1 - ramp(t, at, at + 16, settle)) * 1.25 + ramp(t, out, out + 9, leave) * 1.25;
  const rise = riseAt(f);
  const blur = Math.min(14, Math.abs(riseAt(f) - riseAt(f - 1)) * size * 0.42);
  const id = `mbs-${at}-${text.length}`;
  const asc = size * 0.95;
  const desc = size * 0.26;
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 0 : x, width: align === 'center' ? 1920 : undefined, top: baseY - asc, height: asc + desc, overflow: 'hidden', textAlign: align}}>
      {blur > 0.4 ? <BlurDef id={id} sx={0} sy={blur} /> : null}
      <div style={{...sentence(size, color), display: 'inline-block', lineHeight: `${asc}px`, transform: `translate(${align === 'center' ? x - 960 : 0}px, ${rise * size}px)`, filter: blur > 0.4 ? `url(#${id})` : undefined}}>
        {text}
      </div>
    </div>
  );
};
