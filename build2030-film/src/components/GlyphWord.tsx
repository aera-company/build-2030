import React from 'react';
import glyphData from '../data/glyphs.json';

type Glyph = {ch: string; x: number; adv: number; d: string; bbox: [number, number, number, number]};
type Word = {width: number; glyphs: Glyph[]};
const DATA = glyphData as unknown as {capHeight: number; words: Record<string, Word>};

export const CAP = DATA.capHeight / 1000;
export const wordData = (w: string): Word => DATA.words[w];
export const wordWidth = (w: string): number => DATA.words[w].width / 1000;
/** Centro horizontal (em) da haste do glifo de índice i. */
export const glyphCenter = (w: string, i: number): number => {
  const g = DATA.words[w].glyphs[i];
  return (g.x + (g.bbox[0] + g.bbox[2]) / 2) / 1000;
};
export const glyphBox = (w: string, i: number): [number, number, number, number] => {
  const g = DATA.words[w].glyphs[i];
  return [(g.x + g.bbox[0]) / 1000, g.bbox[1] / 1000, (g.x + g.bbox[2]) / 1000, g.bbox[3] / 1000];
};

/**
 * Palavra como vetor. Origem = baseline-esquerda. `size` em px.
 * Por glifo: `draw` 0..1 desenha o contorno; `fill` 0..1 preenche; `opacity`.
 */
export const GlyphWord: React.FC<{
  word: string;
  size: number;
  color: string;
  draw?: (i: number) => number;
  fill?: (i: number) => number;
  opacity?: (i: number) => number;
  stroke?: number;
}> = ({word, size, color, draw = () => 1, fill = () => 1, opacity = () => 1, stroke = 1.4}) => {
  const w = DATA.words[word];
  const k = size / 1000;
  const pad = 200;
  return (
    <svg
      width={(w.width + pad * 2) * k}
      height={1400 * k}
      viewBox={`${-pad} ${-1100} ${w.width + pad * 2} 1400`}
      style={{position: 'absolute', left: -pad * k, top: -1100 * k, overflow: 'visible'}}
    >
      {w.glyphs.map((g, i) => {
        const dr = draw(i);
        const fl = fill(i);
        const op = opacity(i);
        if (op <= 0) return null;
        return (
          <g key={i} transform={`translate(${g.x} 0)`} opacity={op}>
            {fl > 0 ? <path d={g.d} fill={color} fillOpacity={fl} /> : null}
            {dr > 0 && fl < 1 ? (
              <path
                d={g.d}
                fill="none"
                stroke={color}
                strokeWidth={stroke / k}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - dr}
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
