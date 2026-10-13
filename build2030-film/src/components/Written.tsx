import React from 'react';
import {useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {expoOut, glide, leave, lerp, ramp, settle} from '../film/motion';
import {LIGHT} from '../film/tokens';
import {CAP, GlyphWord, wordData, wordWidth} from './GlyphWord';
import {Node} from './Field';

/**
 * Palavra ESCRITA pela linha (a gramática aprovada no S02 V2): o contorno de cada letra é
 * desenhado em sequência, uma cabeça de luz acompanha o traço e a letra preenche logo depois.
 * Origem = baseline-esquerda. `at` = frame (local da cena) em que a escrita começa.
 * `write` = duração total da escrita (frames). Saída: as letras perdem o preenchimento e sobem.
 */
const lengths = new Map<string, number>();
const lengthOf = (d: string) => {
  let v = lengths.get(d);
  if (v === undefined) {
    v = d ? getLength(d) : 0;
    lengths.set(d, v);
  }
  return v;
};

export const writeTiming = (word: string, at: number, write: number) => {
  const n = wordData(word).glyphs.length;
  const dur = Math.max(6, Math.min(22, write * 0.45));
  const stagger = n > 1 ? (write - dur) / (n - 1) : 0;
  return {n, dur, stagger, draw: (f: number, i: number) => ramp(f, at + i * stagger, at + i * stagger + dur, glide), fill: (f: number, i: number) => ramp(f, at + i * stagger + dur * 0.7, at + i * stagger + dur * 0.7 + Math.max(5, dur * 0.5), settle)};
};

export const Written: React.FC<{
  word: string;
  size: number;
  x: number;
  y: number;
  at: number;
  write?: number;
  outAt?: number;
  color?: string;
  /** 0..1: perde o preenchimento e fica só o contorno (tipografia vira estrutura). */
  outline?: number;
  pen?: boolean;
  /** Frame em que o bloco entra fora da escrita (para cenas que herdam palavras prontas). */
  ready?: boolean;
}> = ({word, size, x, y, at, write = 14, outAt = 1e9, color = LIGHT, outline = 0, pen = true, ready = false}) => {
  const f = useCurrentFrame();
  if (!ready && f < at - 1) return null;
  if (f > outAt + 16) return null;
  const t = writeTiming(word, at, write);
  const exit = ramp(f, outAt, outAt + 12, leave);
  const w = wordData(word);
  const writing = !ready && f >= at && f <= at + write + 2;
  let head: {x: number; y: number} | null = null;
  if (pen && writing) {
    let i = Math.floor((f - at) / Math.max(0.001, t.stagger));
    i = Math.max(0, Math.min(t.n - 1, i));
    while (i > 0 && !w.glyphs[i].d) i--;
    const g = w.glyphs[i];
    if (g.d) {
      const p = Math.max(0.001, Math.min(0.999, t.draw(f, i)));
      const pt = getPointAtLength(g.d, lengthOf(g.d) * p);
      head = {x: x + ((g.x + pt.x) / 1000) * size, y: y + (pt.y / 1000) * size};
    }
  }
  return (
    <>
      <div style={{position: 'absolute', left: x, top: y - size * 0.5 * exit, opacity: 1 - exit}}>
        <GlyphWord
          word={word}
          size={size}
          color={color}
          draw={(i) => (ready ? 1 : t.draw(f, i))}
          fill={(i) => (ready ? 1 : t.fill(f, i)) * (1 - outline) * (1 - exit * 0.6)}
          opacity={() => lerp(1, 0.6, outline)}
          stroke={Math.max(1, size / 110)}
        />
      </div>
      {head ? (
        <>
          <div style={{position: 'absolute', left: head.x - 20, top: head.y - 20, width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(241,239,232,0.55) 0%, rgba(241,239,232,0) 70%)'}} />
          <Node x={head.x} y={head.y} r={2.4} color={color} />
        </>
      ) : null}
    </>
  );
};

/** Tamanho para caber numa largura. */
export const fitSize = (word: string, width: number, max: number) => Math.min(max, width / wordWidth(word));

/** Baseline para centrar a palavra verticalmente num y. */
export const baselineFor = (centerY: number, size: number) => centerY + (CAP * size) / 2;

export {expoOut};
