import React from 'react';
import {H, LINE, W} from '../motion/design';
import type {Pt} from '../motion/easing';

/**
 * A linha (direção). Um único desenho por frame: um traço principal (polilinha),
 * ramos opcionais, ticks, nós, e a cabeça de luz quando ela está em movimento.
 * Quem decide a geometria é o filme (estado por frame); aqui só se desenha.
 */
export type LineState = {
  pts: Pt[];
  color: string;
  width?: number;
  opacity?: number;
  /** traço largo e desfocado por baixo (energia, só quando a linha nasce da imagem). */
  glow?: number;
  head?: {p: Pt; o: number} | null;
  /** cor da cabeça (no campo claro a luz branca some; lá ela é teal) */
  headColor?: string;
  branches?: Array<{a: Pt; b: Pt; node?: number}>;
  ticks?: Array<{x: number; y: number; h: number; o: number}>;
  nodes?: Array<{p: Pt; r: number; o: number}>;
};

export const Line: React.FC<{s: LineState | null}> = ({s}) => {
  if (!s || s.pts.length < 2) return null;
  const w = s.width ?? LINE.width;
  const pts = s.pts.map((p) => p.join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H, overflow: 'visible'}}>
      <defs>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <radialGradient id={s.headColor ? 'headGlowC' : 'headGlow'}>
          <stop offset="0%" stopColor={s.headColor ?? '#e6f6ff'} stopOpacity={s.headColor ? 0.35 : 0.7} />
          <stop offset="100%" stopColor={s.headColor ?? '#e6f6ff'} stopOpacity={0} />
        </radialGradient>
      </defs>
      {s.glow ? (
        <polyline points={pts} fill="none" stroke={s.color} strokeWidth={w * 7} strokeLinecap="round" strokeLinejoin="round" opacity={s.glow} filter="url(#lineGlow)" />
      ) : null}
      <g opacity={s.opacity ?? 1}>
        <polyline points={pts} fill="none" stroke={s.color} strokeWidth={w} strokeLinecap="butt" strokeLinejoin="round" />
        {s.branches?.map((b, i) => (
          <g key={i}>
            <line x1={b.a[0]} y1={b.a[1]} x2={b.b[0]} y2={b.b[1]} stroke={s.color} strokeWidth={w} />
            {b.node ? <circle cx={b.b[0]} cy={b.b[1]} r={LINE.headR * 1.25 * b.node} fill={s.color} /> : null}
          </g>
        ))}
        {s.ticks?.map((t, i) => (
          <line key={i} x1={t.x} y1={t.y - t.h} x2={t.x} y2={t.y + t.h} stroke={s.color} strokeWidth={1} opacity={t.o} />
        ))}
        {s.nodes?.map((n, i) => (
          <circle key={i} cx={n.p[0]} cy={n.p[1]} r={n.r} fill={s.color} opacity={n.o} />
        ))}
      </g>
      {s.head && s.head.o > 0 ? (
        <g opacity={s.head.o}>
          <circle cx={s.head.p[0]} cy={s.head.p[1]} r={LINE.glowR} fill={s.headColor ? 'url(#headGlowC)' : 'url(#headGlow)'} />
          <circle cx={s.head.p[0]} cy={s.head.p[1]} r={LINE.headR * (s.headColor ? 1.3 : 1)} fill={s.headColor ?? '#e6f6ff'} />
        </g>
      ) : null}
    </svg>
  );
};

/**
 * Linha com motion blur temporal: duas amostras anteriores (meio obturador) por baixo do traço,
 * só o traço e os ramos (cabeça, brilho, ticks e nós não arrastam). Parada, é invisível; em movimento, arrasta.
 */
export const LineMB: React.FC<{at: (f: number) => LineState | null; f: number}> = ({at, f}) => {
  const main = at(f);
  if (!main) return null;
  const ghost = (dt: number, o: number) => {
    const s = at(f - dt);
    return s ? <Line s={{...s, head: null, glow: 0, ticks: [], nodes: [], opacity: (s.opacity ?? 1) * o}} /> : null;
  };
  return (
    <>
      {ghost(0.66, 0.16)}
      {ghost(0.33, 0.32)}
      <Line s={main} />
    </>
  );
};
