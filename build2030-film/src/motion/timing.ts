/**
 * GAVEA / BUILD 2030 · V5 · tempo do filme em frames (30 fps). Fonte única.
 * Grade musical: 90 BPM, uma batida = 20 frames, um compasso = 80 frames (scripts/make-music-v5.py usa os mesmos números).
 * A voz (AERA Narradora F1, src/data/voV5.json) corre quase contínua; os eventos derivam das palavras (vw).
 * Atos: A abertura · B frente 01 (marca e marketing) · C frente 02 (tecnologia e IA)
 *       D o encontro (MARCA · NEGÓCIO · TECNOLOGIA → AERA) · E estratégia em sistema, sistema em movimento · F verbos e assinatura.
 */
import voManifest from '../data/voV5.json';

export const BEAT = 20;
export const BAR = 80;

/** Entrada de cada bloco de voz (frame absoluto). Pausas entre blocos: 350–650 ms. */
export const VO = {
  v1: 20,
  v2: 142,
  v3: 420,
  v4: 798,
  v5: 1226,
  v6: 1500,
  va: 1660, // "A AERA estrutura a direção. A agência segue na execução…"
  g1: 1896,
  g2: 1956,
  g3: 2014,
  v8r: 2055, // o MESMO "Gávia Build 2030" da abertura (recortado de v1)
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
/** 1 se há fala neste frame (envelope real da voz). */
export const speaking = (fr: number): number => {
  for (const [id, l] of Object.entries(VO_LINES)) {
    const s = VO[id as keyof typeof VO];
    if (s === undefined || fr < s || fr >= s + l.frames) continue;
    if (l.env[fr - s] === '1') return 1;
  }
  return 0;
};

export const FILM_END = 2160;
export const HALF = 1050; // 00:35

/* ================================================================== A · abertura */

export const T01 = {matterIn: [0, 30], presentsIn: 6, presentsOut: 74, trace: [14, 56], dim: [46, 82], straighten: [48, 64], pivot: [62, 84], cam: [0, 84]};
export const T02 = {logoRise: [vw('v1', 'Gávia', 0, 54) - 6, vw('v1', 'Gávia', 0, 54) + 14], lineDrop: [86, 96], write: [92, 126], extend: [128, 142]};
export const T03 = {rise: [158, 182], sky: [180, 198], collapse: [206, 220], cam: [156, 224]};
export const T04 = {toRuler: [216, 234], ticks: 228};
/** MARCA · PRESENÇA · OPORTUNIDADES em tempos fortes (2 batidas cada); o porto segura até a frente 01. */
export const PLANES = [240, 280, 320];
export const PLANES_OUT = 392;
export const T05 = {collapse: [386, 400], rise: [394, 410], open: [402, 426]};

/* ================================================================== B · frente 01 · marca e marketing (campo claro) */

export const T_B = {
  index: vw('v3', 'marketing', 0, 24) - 6,
  enter: vw('v3', 'AERA', 0, 54), // a AERA entra na régua
  services: [vw('v3', 'posicionamento', 0, 104), vw('v3', 'design', 0, 144), vw('v3', 'planejamento', 0, 182), vw('v3', 'direção', 0, 209)],
  connect: vw('v3', 'conectando', 0, 258),
  dest: [vw('v3', 'comunicação', 0, 275), vw('v3', 'comercial', 0, 309), vw('v3', 'oportunidades', 0, 336)],
  invert: [800, 820], // volta ao navy a partir do nó "Oportunidades"
};

/* ================================================================== C · frente 02 · novas tecnologias e IA */

export const T_C = {
  index: 812,
  line: [806, 826],
  need: 820, // o real (operação) sobe da régua
  freeze: vw('v4', 'AERA', 0, 57) - 8,
  tag: vw('v4', 'AERA', 0, 57) - 6,
  detach: [vw('v4', 'conduz', 0, 75) - 4, vw('v4', 'conduz', 0, 75) + 8], // a necessidade vira oportunidade (nó)
  ai: vw('v4', 'soluções', 0, 88) - 4, // a inteligência
  aiNode: vw('v4', 'I.A', 0, 111),
  link: vw('v4', 'negócio', 0, 139), // os nós se ligam: sistema
  row: [vw('v4', 'sistemas', 0, 171), vw('v4', 'automações', 0, 195), vw('v4', 'conhecimento', 0, 227), vw('v4', 'processos', 0, 261)],
  tools: vw('v4', 'novas', 1, 289), // "novas ferramentas": implementação
};
export const T12 = {
  collapse: [T_C.tools - 6, T_C.tools + 6],
  rulerUp: [T_C.tools, T_C.tools + 14],
  trade: [T_C.tools + 14, T_C.tools + 28],
  tradeLabel: T_C.tools + 18,
  tradeSwap: T_C.tools + 36,
  toBar: [T_C.tools + 48, T_C.tools + 58],
  barOpen: [T_C.tools + 57, T_C.tools + 58],
  type: [T_C.tools + 58, T_C.tools + 74],
  enter: T_C.tools + 76,
  barUp: [T_C.tools + 76, T_C.tools + 88],
  window: [T_C.tools + 78, T_C.tools + 92],
  labels: [T_C.tools + 88, T_C.tools + 92],
  close: [T_C.tools + 120, T_C.tools + 130],
};

/* ================================================================== D · o encontro (benchmark) */

export const T_D = {
  contract: [T12.close[1], T12.close[1] + 18], // "Duas frentes": a linha desce e se fecha num ponto
  invert: [T12.close[1] + 16, T12.close[1] + 38],
  converge: [T12.close[1] + 36, vw('v5', 'ponto', 0, 68)], // duas linhas, uma de cada lado, chegam juntas ao ponto
  fields: [vw('v5', 'marca', 0, 95) - 3, vw('v5', 'negócio', 0, 112) - 3, vw('v5', 'tecnologia', 0, 135) - 3],
  together: [vw('v5', 'trabalhando', 0, 164), vw('v5', 'juntos', 0, 185) + 6],
  pulse: [1418, 1440], // a luz corre pela linha, dos dois lados, até a interseção
  aera: 1440, // compasso 18, tempo 1: o logo da AERA nasce da linha
};

/* ================================================================== E · estratégia em sistema · sistema em movimento */

export const T_E = {
  absorb: [1490, 1512],
  scatter: vw('v6', 'estratégia', 0, 11) - 2,
  scatterStep: 1.5,
  split: [vw('v6', 'sistema', 0, 51) - 4, vw('v6', 'sistema', 0, 51) + 14], // a linha do encontro se divide nas duas frentes
  snap: [vw('v6', 'sistema', 0, 51) - 2, vw('v6', 'sistema', 0, 51) + 18],
  axis: [vw('v6', 'sistema', 0, 51) + 4, vw('v6', 'sistema', 0, 51) + 20],
  labels: vw('v6', 'sistema', 0, 51) + 16,
  flow: vw('v6', 'movimento', 0, 121) - 34, // "E sistema": começa a correr
  arcs: vw('v6', 'movimento', 0, 121) - 24,
  travel: vw('v6', 'movimento', 0, 121), // imagens começam a viajar
  hero: [1872, 1900], // uma imagem sai do centro e vira o plano do CONSTRUIR
};

/** E2 · a agência segue: a AERA estrutura a direção; a agência segue na execução (esclarecimento, não capítulo). */
export const T_A = {
  lift: [VO.va, VO.va + 24], // o sistema sobe um pouco e abre espaço embaixo
  direction: vw('va', 'direção', 0, 33),
  agency: vw('va', 'agência', 0, 61),
  exec: vw('va', 'execução', 0, 84),
  marks: [vw('va', 'planejamento', 0, 107), vw('va', 'critérios', 0, 130), vw('va', 'visão', 0, 155)],
  out: 1866,
};

/* ================================================================== F · verbos e assinatura */

export const T15 = {verbs: [1900, 1960, 2020], line: [1900, 1912]};
export const T16 = {
  collapse: [2042, 2056],
  line: [2056, 2070],
  logo: vw('v8r', 'Gávia', 0, 4) - 2,
  title: vw('v8r', 'Build', 0, 17) - 1,
  landing: 2080, // o pouso musical em "2030"
  labels: [2090, 2096],
  aera: 2104,
};

/** campo claro: frente 01 e encontro/sistema */
export const CREAM = [
  [T05.open[0], T_B.invert[1]],
  [T_D.invert[0], T_E.hero[1]],
] as const;
