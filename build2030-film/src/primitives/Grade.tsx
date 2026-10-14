import React from 'react';
import {DUO} from '../motion/design';

/**
 * Grade comum do filme. Um gradient map de 3 paradas (navy → azul de aço → branco frio) em sRGB,
 * com contraste antes do mapa. Unifica footage real, IA e upscales sob a mesma luz.
 * Use `style={{filter: 'url(#duo)'}}` em qualquer camada de mídia.
 */
const tbl = (k: 0 | 1 | 2) => [DUO.lo[k], DUO.mid[k], DUO.hi[k]].map((v) => (v / 255).toFixed(4)).join(' ');
const c = DUO.contrast;

export const GradeDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="duo" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={c} intercept={-(c - 1) / 2} />
          <feFuncG type="linear" slope={c} intercept={-(c - 1) / 2} />
          <feFuncB type="linear" slope={c} intercept={-(c - 1) / 2} />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="table" tableValues={tbl(0)} />
          <feFuncG type="table" tableValues={tbl(1)} />
          <feFuncB type="table" tableValues={tbl(2)} />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

export const DUO_FILTER = 'url(#duo)';
