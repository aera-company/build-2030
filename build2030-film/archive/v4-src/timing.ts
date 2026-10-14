/**
 * GAVEA / BUILD 2030 · V4 · tempo do filme em frames (30 fps). Fonte única.
 * A voz (AERA Narradora F1, src/data/voV4.json) é a âncora: cada frase entra num frame escolhido,
 * e os eventos que acompanham a fala derivam do tempo real das palavras (vw).
 * Atos: A abertura · B marca · C conhecimento · D AERA/sistema · E tecnologia · F convergência e verbos.
 */
import voManifest from '../data/voV4.json';

/** Entrada de cada frase (frame absoluto do início do arquivo). */
export const VO = {
  a1: 72,
  a2: 138,
  b1: 367,
  b2: 468,
  b3: 563,
  c1: 682,
  c2: 760,
  c3: 840,
  d1: 986,
  e1: 1196,
  e2: 1290,
  f1: 1910,
  g1: 2008,
  g2: 2072,
  g3: 2136,
} as const;

type VoLine = {file: string; frames: number; words: Array<{w: string; f: number}>; env: string};
export const VO_LINES = (voManifest as unknown as {lines: Record<string, VoLine>}).lines;
/** Frame absoluto da palavra (prefixo, sem caixa) dentro da fala `id`; `nth` para repetições. */
export const vw = (id: keyof typeof VO, prefix: string, nth = 0, fallback = 0): number => {
  const l = VO_LINES[id];
  if (!l) return VO[id] + fallback;
  const hits = l.words.filter((x) => x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  return VO[id] + (hits[nth]?.f ?? fallback);
};
/** 1 se há fala neste frame (envelope real da voz, palavra a palavra). */
export const speaking = (fr: number): number => {
  for (const [id, l] of Object.entries(VO_LINES)) {
    const s = VO[id as keyof typeof VO];
    if (s === undefined || fr < s || fr >= s + l.frames) continue;
    if (l.env[fr - s] === '1') return 1;
  }
  return 0;
};

export const FILM_END = 2280;
export const HALF = 1050; // 00:35

/* ================================================================== A · abertura */

/** A1 · a costa vive; só depois vira linha. */
export const T01 = {
  matterIn: [4, 96],
  presentsIn: 24,
  presentsOut: 124,
  trace: [44, 118],
  dim: [108, 158],
  straighten: [116, 138],
  pivot: [136, 166],
  cam: [0, 160],
};

/** A2 · a marca sobe da linha; a linha escreve BUILD 2030. */
export const T02 = {
  logoRise: [168, 192],
  lineDrop: [198, 212],
  write: [210, 254],
  stamp: 252,
  extend: [258, 274],
};

/** A3 · a linha varre o título e encontra o horizonte. */
export const T03 = {
  rise: [288, 318],
  sky: [316, 336],
  collapse: [348, 364],
  cam: [286, 368],
};

/** A4 · a linha vira régua. */
export const T04 = {toRuler: [362, 382], ticks: 376};

/* ================================================================== B · marca, presença, oportunidades */

/** Cada corte cai na palavra falada; o plano respira 3,3 s. */
export const B05_START = [vw('b1', 'marca', 0, 26) - 1, vw('b2', 'presença', 0, 23) - 1, vw('b3', 'oportunidades', 0, 26) - 1];
export const B05_OUT = 664; // OPORTUNIDADES volta para a régua

/* ================================================================== C · o real vira informação */

export const T06 = {
  freeze: 660, // o porto congela
  crop: [666, 678], // um recorte é desenhado nele
  window: [vw('c1', 'conhecimento', 0, 13) - 14, vw('c1', 'conhecimento', 0, 13) + 6], // o recorte cresce e vira janela
  k1: {freeze: 726, tag: 728, detach: [744, 756]}, // conhecimento → nó
  p2: vw('c2', 'processos', 0, 29) - 18, // processos sobe da régua
  k2: {freeze: 804, tag: 806, detach: [820, 832]},
  p3: vw('c3', 'inteligência', 0, 23) - 16, // cortina da inteligência
  node3: vw('c3', 'inteligência', 0, 23) + 6,
  value: vw('c3', 'valor', 0, 77),
  collapse: [vw('c3', 'valor', 0, 77) - 4, vw('c3', 'valor', 0, 77) + 12], // a imagem fecha sobre a régua
  rise: [vw('c3', 'valor', 0, 77) + 2, vw('c3', 'valor', 0, 77) + 26], // a régua sobe e contrai
  converge: [vw('c3', 'valor', 0, 77) + 12, vw('c3', 'valor', 0, 77) + 34],
  silence: [956, 970],
};

/** frame em que o nó k (conhecimento, processos, inteligência) pousa na régua */
export const nodeLand = (k: number) => (k === 0 ? T06.k1.detach[1] : k === 1 ? T06.k2.detach[1] : T06.node3 + 14);

/* ================================================================== D · AERA, sistema, movimento */

/** D1 · inversão; MARCA, NEGÓCIO, TECNOLOGIA; a linha cruza; AERA na interseção. */
export const T07 = {
  invert: [970, 992],
  fields: [vw('d1', 'marca', 0, 39) - 3, vw('d1', 'negócio', 0, 58) - 3, vw('d1', 'tecnologia', 0, 83) - 3],
  cross: [vw('d1', 'AERA', 0, 128) - 34, vw('d1', 'AERA', 0, 128)], // a linha entra pela esquerda e chega ao centro na palavra
  aera: vw('d1', 'AERA', 0, 128),
  open: [vw('d1', 'atuar', 0, 150), vw('d1', 'atuar', 0, 150) + 20], // "atuar": a cruz se abre
  absorb: [1172, 1194], // os campos voltam para o centro
  slide: [1180, 1208], // a cruz vai para o eixo
};

/** D2 · "Transformando estratégia em sistema." Fragmentos soltos → travam no sistema. */
export const T08 = {
  index: vw('e1', 'estratégia', 0, 12) + 30,
  scatter: vw('e1', 'estratégia', 0, 12) - 2,
  scatterStep: 4,
  snap: [vw('e1', 'sistema', 0, 44) - 2, vw('e1', 'sistema', 0, 44) + 18],
  rails: [vw('e1', 'sistema', 0, 44) - 4, vw('e1', 'sistema', 0, 44) + 16],
  band: [vw('e1', 'sistema', 0, 44) + 10, vw('e1', 'sistema', 0, 44) + 26],
  labels: [vw('e1', 'sistema', 0, 44) + 14, vw('e1', 'sistema', 0, 44) + 18, vw('e1', 'sistema', 0, 44) + 22],
};

/** D3 · "E sistema em movimento." Direção → execução → validação. */
export const T10 = {
  packets: [VO.e2 + 8, VO.e2 + 28], // a direção sai do eixo até cada peça
  drop: vw('e2', 'movimento', 0, 35), // descem até a agência
  dropDur: 18,
  dropStep: 4,
  fill: vw('e2', 'movimento', 0, 35) + 16, // execução: o wireframe vira imagem real
  fillStep: 6,
  exec: vw('e2', 'movimento', 0, 35) + 58,
  connect: vw('e2', 'movimento', 0, 35) + 66, // a AERA conecta
  approve: vw('e2', 'movimento', 0, 35) + 78, // sobem e são validadas na camada AERA
  riseDur: 22,
  riseStep: 5,
  board: vw('e2', 'movimento', 0, 35) + 114,
  silence: [1446, 1456],
};

/* ================================================================== E · novas tecnologias e IA (sem voz) */

export const T11 = {invert: [1456, 1474], lineDown: [1462, 1482], index: 1468, row: 1484, rowStep: 6, clip: 1506, freeze: 24, tag: [26, 32], detach: [40, 50]};
export const B11_END = 1584;

export const T12 = {
  collapse: [1572, 1584],
  rulerUp: [1578, 1594],
  trade: [1594, 1610],
  tradeLabel: 1604,
  tradeSwap: 1622,
  toBar: [1640, 1652],
  barOpen: [1651, 1652],
  type: [1652, 1670],
  enter: 1672,
  barUp: [1672, 1686],
  window: [1674, 1690],
  labels: [1688, 1694],
  close: [1724, 1734],
  silence: [1563, 1572],
};

/** E3 · a barra volta a ser linha e costura o split (sem frases). */
export const T13 = {pivot: [1730, 1746], panels: [1738, 1754], logo: 1746, index: 1748, out: [1800, 1816]};

/* ================================================================== F · convergência, BUILD 2030, verbos, assinatura */

export const T14 = {
  tracks: [1816, 1828],
  cards: [1802, 1830],
  cardStep: 2.4,
  top: [1828, 1840],
  open: [1842, 1864],
  toWater: [1872, 1892],
  index: 1834,
  cam: [1842, 2000],
  silence: [1897, 1908],
};

/** F2 · a linha desce e escreve BUILD 2030 (o gesto da abertura), com a voz. */
export const T14B = {
  lineDrop: [1896, 1910],
  write: [vw('f1', 'Build', 0, 0) + 2, vw('f1', 'Build', 0, 0) + 40],
  out: vw('g1', 'Construir', 0, 2) - 12,
};

/** F3 · três verbos; cada corte cai na palavra falada e respira 2,1 s. */
export const T15 = {verbs: [vw('g1', 'Construir', 0, 2), vw('g2', 'Escalar', 0, 4), vw('g3', 'Liderar', 0, 4)], silence: [2190, 2200]};

/** F4 · assinatura. */
export const T16 = {collapse: [2200, 2214], line: [2214, 2228], logo: 2220, title: 2228, labels: [2240, 2246], aera: 2252};
