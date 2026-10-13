/** Linha do tempo da prova (frames a 30 fps). Fonte: docs/GAVEA_BUILD2030_60S_MOTION_MAP_V1.md */
export const PROOF_DURATION = 810; // 27 s: 25 s de prova + 2 s de amostra do bloco 05

/** Sprint físico: oito fragmentos reais, variância de 0.4–0.6 s. */
export const SPRINT: Array<{clip: string; at: number; dur: number; pos?: string; scale?: number}> = [
  {clip: 'yt/crew_cable', at: 8, dur: 14, scale: 1.06},
  {clip: 'yt/crew_deck', at: 22, dur: 14},
  {clip: 'yt/grab', at: 36, dur: 14},
  {clip: 'yt/stacker', at: 50, dur: 12, scale: 1.05},
  {clip: 'yt/crane_reel', at: 62, dur: 12},
  {clip: 'yt/yard_rows', at: 74, dur: 14},
  {clip: 'yt/aerial_bay', at: 88, dur: 62, scale: 1.08},
];

export const T = {
  presentsIn: 20,
  presentsOut: 96,
  dim: 100,
  mark: 104,
  build: 122,
  world: 150,
  labels: [165, 180, 195, 225, 240, 255],
  punch1: {clip: 'yt/orange_crew', at: 210, dur: 15},
  punch2: {clip: 'yt/workers_quay', at: 270, dur: 15},
  system: 285,
  synthOne: 330,
  synthMany: 348,
  oss: 372,
  invert: 420,
  line: 420,
  q1: 438,
  q2: 462,
  qOut: 570,
  direction: 600,
  board: 612,
  fronts: [640, 652, 664, 676, 688],
  verbs: [720, 735, 750, 765],
  cut: 790,
  brand: 790,
} as const;

/** Âncoras no plano geral da plate "chegada" (P 0.00–0.05, quase parada): berço à esquerda, cais fugindo para a direita. */
export const LABELS = [
  {text: 'Operação', x: 430, y: 590},
  {text: 'Logística', x: 690, y: 520},
  {text: 'Terminais', x: 930, y: 478},
  {text: 'Trade', x: 1090, y: 452},
  {text: 'Tecnologia', x: 820, y: 440},
  {text: 'Green', x: 1230, y: 426},
];

export const FRONTS = ['AGÊNCIA', 'TIME INTERNO', 'COMERCIAL', 'PARCEIROS', 'TECNOLOGIA'];
export const VERBS = ['Planejar.', 'Priorizar.', 'Conectar.', 'Acompanhar.'];
