/**
 * GAVEA / BUILD 2030 · V3.1 · tempo do filme em frames (30 fps). Fonte única.
 * Os beats seguem o Storyboard V3 travado; a partir da V3.1 os eventos que acompanham a voz
 * derivam do tempo real de cada palavra (src/data/voV3.json, gerado por scripts/fit-vo.py).
 */
import voManifest from '../data/voV3.json';

export const BEATS = {
  B01: [0, 120],
  B02: [120, 210],
  B03: [210, 300],
  B04: [300, 360],
  B05: [360, 615],
  B06: [615, 750],
  B07: [750, 870],
  B08: [870, 1000],
  B09: [1000, 1060],
  B10: [1060, 1185],
  B11: [1185, 1282],
  B12: [1282, 1392],
  B13: [1392, 1494],
  B14: [1494, 1576],
  B15: [1576, 1688],
  B16: [1688, 1800],
} as const;

/** Voz (ElevenLabs, GAVEA Narradora V6). Entradas pela referência V3.1; v06, v08 e v09 deslocadas para não se sobreporem. */
export const VO = {
  v01: 222,
  v02: 306,
  v03: 630,
  v04: 762,
  v05: 861,
  v06: 1036,
  v07: 1185,
  v08: 1394,
  v09: 1507,
  v10: 1576,
  v11: 1710,
} as const;

type VoLine = {file: string; frames: number; words: Array<{w: string; f: number}>};
const VO_WORDS = (voManifest as {lines: Record<string, VoLine>}).lines;
/** Frame absoluto da palavra (prefixo, sem caixa) dentro da fala `id`; `nth` para repetições. */
export const vw = (id: keyof typeof VO, prefix: string, nth = 0, fallback = 0): number => {
  const l = VO_WORDS[id];
  if (!l) return VO[id] + fallback;
  const hits = l.words.filter((x) => x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  return VO[id] + (hits[nth]?.f ?? fallback);
};

export const PROOF_END = 930;
export const FILM_END = 1800;

/** B01 · a costa vira linha. */
export const T01 = {
  matterIn: [4, 70],
  presentsIn: 22,
  presentsOut: 96,
  trace: [30, 88],
  dim: [80, 118],
  straighten: [86, 106],
  pivot: [104, 130],
  cam: [0, 118],
};

/** B02 · a marca sobe da linha; a linha escreve BUILD 2030. */
export const T02 = {
  logoRise: [128, 148],
  lineDrop: [148, 162],
  write: [160, 198],
  stamp: 196,
  extend: [202, 216],
};

/** B03 · a linha encontra o horizonte. */
export const T03 = {
  rise: [220, 248], // a linha sobe varrendo o título e revelando o mar
  sky: [246, 266], // o céu abre a partir da linha
  sentence: 238,
  sentenceOut: 276,
  collapse: [282, 298], // a imagem fecha sobre a linha
  cam: [218, 300],
};

/** B04 · a linha vira régua. */
export const T04 = {
  toRuler: [296, 316],
  ticks: 310,
  index: 304,
  sentence: 306,
  sentenceOut: 356,
  anchor: 350, // MAIS
};

/** B05 · MAIS + palavra. Acumulação: cada plano um pouco mais curto. */
export const B05_DUR = [57, 53, 50, 48, 47];
export const B05_START = B05_DUR.reduce<number[]>((acc, d, i) => (i === 0 ? [360] : [...acc, acc[i - 1] + B05_DUR[i - 1]]), []);
export const B05_END = 615;

/** B06 · mosaico → nós → ponto. */
export const T06 = {
  pull: [615, 652],
  wordOut: 615,
  sentence: 636,
  fold: [668, 688],
  nodes: [684, 700],
  converge: [700, 728],
  hold: [728, 750], // controle; silêncio de 738 a 750
  silence: [738, 750],
};

/** B07 · inversão, eixo, DIRECTION, duas frentes. */
export const T07 = {
  invert: [750, 772],
  pivot: [764, 790],
  letters: [784, 808],
  iFill: [790, 800],
  sentence: 766,
  index: 772,
  axisDown: [804, 826],
  branch1: [818, 834],
  branch2: [828, 844],
  label1: 824,
  label2: 834,
  drift: [750, 870],
};

/** B08 (início) · o eixo cria as três camadas. */
export const T08 = {
  recede: [870, 886],
  rails: [882, 910],
  railStagger: 6,
  labels: [898, 904, 910],
  band: [908, 926],
};

/** B08 (resto) · a camada AERA recebe a direção: cada serviço nasce na régua quando é dito. */
export const T08B = {index: 878};
export const SERVICE_AT = [vw('v05', 'posicionamento', 0, 45), vw('v05', 'design', 0, 80), vw('v05', 'planejamento', 0, 114), vw('v05', 'critério', 0, 138)];

/** B09–B10 · direção → execução → aprovação. Os ativos atravessam as três camadas. */
export const T09 = {
  sentence: SERVICE_AT[3] + 8, // "Um sistema para todos os pontos de contato."
  sentenceOut: VO.v06 - 2,
  wire: SERVICE_AT[3] + 6, // wireframes desenhados a partir dos nós (direção)
  wireStep: 5,
  drop: SERVICE_AT[3] + 18, // descem até a agência
  dropDur: 20,
};
export const T10 = {
  sentence: VO.v06 + 2, // "A agência segue no dia a dia."
  sentenceOut: vw('v06', 'conecta', 0, 59) - 4,
  fill: vw('v06', 'agência', 0, 2) + 8, // execução: o wireframe vira imagem real
  fillStep: 6,
  connect: vw('v06', 'direção', 0, 70), // a AERA conecta: a direção desce até cada peça
  exec: vw('v06', 'execução', 0, 88),
  approve: vw('v06', 'aprovação', 0, 108), // sobem pela camada AERA (critério) até a liderança
  board: vw('v06', 'diretoria', 0, 129),
  riseDur: 22,
  riseStep: 5,
};

/** B11 · o check final inverte o campo de volta ao navy; o real vira informação. */
export const T11 = {invert: [1185, 1203], lineDown: [1191, 1211], index: 1195, clips: [1201, 1228, 1255], freeze: 10, tag: [11, 18], detach: [19, 27]};
export const B11_END = 1282;

/** B12 · GAVEA Trade (em uso) → futuro Portal GAVEA (protótipo). */
export const T12 = {
  collapse: [1276, 1288],
  rulerUp: [1282, 1298],
  trade: [1298, 1314],
  tradeLabel: vw('v07', 'GAVEA', 0, 134),
  tradeSwap: 1324,
  toBar: [1334, 1346],
  barOpen: [1345, 1346],
  type: [1346, 1362],
  enter: 1364,
  barUp: [1364, 1378],
  window: [1366, 1382],
  labels: [vw('v07', 'Portal', 0, 174), vw('v07', 'Portal', 0, 174) + 6],
  close: [1386, 1396],
};

/** B13 · um sistema, duas expressões. As frases entram com as palavras. */
export const T13 = {pivot: [1392, 1408], panels: [1400, 1416], logo: 1406, index: 1408, sent: [vw('v08', 'comunicar', 0, 5), vw('v08', 'operar', 0, 64)], out: [1478, 1494]};

/** B14 · as duas trilhas convergem fisicamente; memória vira pilha; a cor chega. */
export const T14 = {
  tracks: [1494, 1506],
  cards: [1480, 1508],
  cardStep: 2.4,
  top: [1506, 1518],
  open: [1520, 1542],
  toWater: [vw('v09', 'Uma', 0, 32) - 2, vw('v09', 'Uma', 0, 32) + 18],
  sentence: VO.v09,
  sentenceStagger: vw('v09', 'Uma', 0, 32) - VO.v09,
  index: 1514,
  cam: [1520, 1578],
};

/** B15 · três verbos; cada corte cai na palavra falada. */
export const T15 = {verbs: [vw('v10', 'Construir'), vw('v10', 'Escalar', 0, 41), vw('v10', 'Liderar', 0, 67)], lineDrop: [1566, 1578], silence: [1676, 1688]};

/** B16 · assinatura. */
export const T16 = {collapse: [1688, 1702], line: [1702, 1716], logo: 1708, title: 1716, sentence: VO.v11 + 4, labels: [1730, 1736], aera: 1752};

