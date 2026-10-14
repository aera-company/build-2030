/**
 * Geometria compartilhada entre beats: onde a linha está quando passa de uma cena para a outra.
 * A continuidade da linha depende destes números serem os mesmos dos dois lados do corte.
 */
import {CAP, glyphBox, glyphCenter, wordWidth} from '../components/GlyphWord';
import type {Pt} from './easing';
import {GRID, H, M, TYPE, W} from './design';

/** Costa acesa no frame 0 de VID_A1 (1920×1080), do sul para o norte. Traçada sobre a imagem. */
export const COAST: Pt[] = [
  [540, 1020], [570, 975], [600, 935], [625, 900], [650, 870], [680, 840], [720, 815], [760, 795],
  [805, 782], [850, 762], [900, 740], [940, 715], [970, 680], [995, 640], [1020, 610], [1040, 580],
  [1062, 540], [1068, 505], [1100, 470], [1150, 440], [1190, 418],
];

/** Câmera de B01: dolly lento que termina enquadrando a costa inteira. */
export const CAM01 = {s0: 1.22, s1: 1.04, tx0: 120, tx1: 30, ty0: -40, ty1: -10};

/** B02: marca e título, centrados. */
export const LOGO = {h: 80, ratio: 2901 / 563, baseY: 560};
export const LOGO_W = LOGO.h * LOGO.ratio;
export const TITLE = {
  size: TYPE.title,
  baseY: 770,
  x: (W - wordWidth('BUILD 2030') * TYPE.title) / 2,
};
export const TITLE_W = wordWidth('BUILD 2030') * TYPE.title;
/** Comprimento da linha logo depois do pivô (B01 → B02). */
export const PIVOT_HALF = LOGO_W / 2 + 40;

/** B03: horizonte no plano do mar (detectado na linha 447 do clipe a 1080p). */
export const HORIZON_Y = 447;

/** B04/B05: régua = linha de base das palavras-impacto. */
export const RULER_Y = GRID.baseline;
export const WORD_X = M - 6;
export const ANCHOR_Y = RULER_Y - CAP * TYPE.n1 - 58;

/** B06: mosaico, cinco telas 16:9 apoiadas na linha. */
export const TILE = {w: 336, h: 189, gap: 18};
export const STRIP_BASE = 640;
export const tileRect = (i: number) => {
  const total = TILE.w * 5 + TILE.gap * 4;
  const x0 = (W - total) / 2;
  return {x: x0 + i * (TILE.w + TILE.gap), y: STRIP_BASE - TILE.h, w: TILE.w, h: TILE.h};
};

/** B07: DIRECTION centrada; o I é o eixo. A linha de B06 converge exatamente no centro do I. */
export const DIR = {
  size: TYPE.direction,
  x: (W - wordWidth('DIRECTION') * TYPE.direction) / 2,
  baseY: STRIP_BASE + (CAP * TYPE.direction) / 2,
};
export const I_X = DIR.x + glyphCenter('DIRECTION', 1) * DIR.size;
export const I_HALF_W = ((glyphBox('DIRECTION', 1)[2] - glyphBox('DIRECTION', 1)[0]) / 2) * DIR.size;
export const I_TOP = DIR.baseY - CAP * DIR.size;
export const I_BOTTOM = DIR.baseY;
export const POINT: Pt = [I_X, STRIP_BASE];
export const AXIS = {top: I_TOP - 70, bottom: 1004, branch1: 860, branch2: 936, branchLen: 92};

/** B08: as três camadas. */
export const RAILS = [
  {y: 318, label: 'LIDERANÇA', note: 'aprova'},
  {y: 560, label: 'AERA · DIREÇÃO', note: 'define'},
  {y: 802, label: 'AGÊNCIA · EXECUÇÃO', note: 'executa'},
];

export const CENTER: Pt = [W / 2, H / 2];

/** B09: o grid (as camadas viram linhas do grid). */
export const GRID9 = {top: 250, mid: 590, bottom: 930, cols: 3, colW: (W - 2 * M) / 3};
export const cell9 = (i: number) => {
  const c = i % 3;
  const r = Math.floor(i / 3);
  const x = M + c * GRID9.colW;
  const y = r === 0 ? GRID9.top : GRID9.mid;
  return {x: x + 12, y: y + 12, w: GRID9.colW - 24, h: GRID9.mid - GRID9.top - 24};
};
/** B10: as camadas de novo, mais compactas. */
export const RAILS10 = [300, 560, 820];
export const CARD = {w: 208, h: 117};
export const CARD_X = [960, 1230, 1500];

/** B11: etiquetas sobre o real (coordenadas de tela). */
export const TAGS11 = [
  [{x: 640, y: 60, w: 470, h: 430, label: 'STATUS'}],
  [{x: 740, y: 250, w: 300, h: 260, label: 'PROPOSTA'}],
  [{x: 860, y: 180, w: 260, h: 200, label: 'DOCUMENTO'}, {x: 1260, y: 800, w: 460, h: 170, label: 'PRAZO'}],
];

/** B12: a barra de pergunta e a janela do GAVEA ONE. */
export const BAR = {cx: W / 2, y: 540, half: 470, h: 88, upY: 168};
export const HUB: Pt = [W / 2 - 470 + 48, 540];
export const ONE_WIN = {x: W / 2 - 680, y: 236, w: 1360, h: 765};

/** B14: panorama, linha d'água em y 360 com a imagem em cover. */
export const WATER_Y = 360;
export const STACK = {w: 640, h: 360};

/** B16: assinatura. */
export const SIG = {lineY: 650, half: 560, titleSize: 118, titleBase: 618, logoH: 72, logoBase: 488};

/* ------------------------------------------------------------------ V4 */

/** C · nós de informação na régua (sobre os ticks 2, 5 e 8) e os recortes extraídos do real. */
export const NODE_X = [2, 5, 8].map((i) => M + (i * (W - 2 * M)) / 12);
/** recorte na ponte do navio (oportunidades) que vira a janela do conhecimento; 16:9 */
export const CROP = {x: 790, y: 210, w: 480, h: 270};
export const TAG_K1 = {x: 760, y: 270, w: 380, h: 340, label: 'PROPOSTA'};
export const TAG_K2 = {x: 600, y: 40, w: 540, h: 460, label: 'STATUS'};

/** D · o encontro: centro na altura da camada AERA; três campos que se cruzam no centro. */
export const E0: Pt = [W / 2, 560];
export const FIELD = {r: 250, d: 140};
/** MARCA (alto, esquerda) · NEGÓCIO (alto, direita) · TECNOLOGIA (baixo) */
export const FIELD_ANG = [(-150 * Math.PI) / 180, (-30 * Math.PI) / 180, Math.PI / 2];
