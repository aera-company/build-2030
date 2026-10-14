import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAP, GlyphWord, wordData} from '../components/GlyphWord';
import {C} from '../motion/design';
import {clamp01, leave, ramp, settle} from '../motion/easing';

/**
 * Título escrito pela linha, de forma arquitetônica (não caligráfica):
 * a cabeça corre na linha de base em velocidade constante; cada letra é plotada no instante
 * em que a cabeça passa por ela: o contorno sobe da base em 5 frames e o preenchimento vem logo depois.
 * `headX(f)` vem do filme, para a letra e a linha nunca se separarem.
 */
export const WrittenTitle: React.FC<{
  word: string;
  x: number;
  baseY: number;
  size: number;
  headX: (f: number) => number;
  color?: string;
  stroke?: string;
  /** frame a partir do qual a cabeça é procurada (para um título escrito no meio do filme) */
  from?: number;
  /** a palavra volta para dentro da linha de base (mesma mecânica das palavras N1) */
  out?: number;
}> = ({word, x, baseY, size, headX, color = C.cream, stroke = C.tealSoft, from = 0, out = 1e9}) => {
  const f = useCurrentFrame();
  const w = wordData(word);
  const hx = headX(f);
  // frame em que a cabeça passou pela borda esquerda de cada glifo (busca simples, frames inteiros)
  const passAt = (i: number) => {
    const gx = x + ((w.glyphs[i].x + w.glyphs[i].bbox[0]) / 1000) * size;
    for (let t = from; t < from + 400; t++) if (headX(t) >= gx) return t;
    return 1e9;
  };
  const capPx = CAP * size;
  const reveal = hx - x; // tudo à esquerda da cabeça existe
  const drop = ramp(f, out, out + 9, leave) * 1.08 * size;
  return (
    <div style={{position: 'absolute', left: x - size * 0.2, top: baseY - capPx - size * 0.3, width: Math.max(0, reveal + size * 0.2), height: capPx + size * 0.32, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: size * 0.2, top: capPx + size * 0.3 + drop}}>
        <GlyphWord
          word={word}
          size={size}
          color={color}
          strokeColor={stroke}
          stroke={1.6}
          draw={(i) => clamp01((f - passAt(i)) / 5)}
          fill={(i) => ramp(f, passAt(i) + 4, passAt(i) + 12, settle)}
        />
      </div>
    </div>
  );
};
