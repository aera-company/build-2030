/* ============================================================
   MOMENTOS · a linha do tempo do hero, em P (0–1)
   Sete beats (docs/GAVEA_BUILD2030_HERO_STORYBOARD_V2.md).
   Um só lugar para todos os instantes: câmera, luz, rotas,
   labels e lockup leem daqui.
   ============================================================ */

export const M = {
  /** 01 · chegada */
  presentsIn: 0.012,
  presentsHold: 0.05,
  presentsOut: 0.065,
  logoIn: 0.065,
  logoHold: 0.115,
  logoOut: 0.135,
  buildIn: 0.09,
  /** 03–04 · labels de capacidade (ver ZONES) */
  labelRamp: 0.03,
  labelsOut: 0.885,
  /** 05 · a camada de sistema */
  routesStart: 0.64,
  routesEnd: 0.76,
  pulses: 0.7,
  /** 06 · direção estratégica */
  lines: [0.78, 0.81, 0.84, 0.87] as readonly number[],
  lineRamp: 0.01,
  lineHold: 0.008,
  /** 07 · lockup */
  lockupIn: 0.93,
} as const;

export type Zone = {
  id: string;
  label: string;
  /** quando a câmera chega */
  at: number;
  /** âncora do label no mundo */
  anchor: [number, number, number];
  /** nó da camada de sistema (x, z), no chão */
  node: [number, number];
};

/** Capacidades, presas ao mundo na ordem da travessia. */
export const ZONES: Zone[] = [
  { id: "operacao", label: "Operação", at: 0.31, anchor: [230, 66, -14], node: [230, -48] },
  { id: "logistica", label: "Logística", at: 0.38, anchor: [390, 14, -92], node: [390, -132] },
  { id: "terminais", label: "Terminais", at: 0.52, anchor: [812, 34, 6], node: [760, -10] },
  { id: "trade", label: "Trade", at: 0.56, anchor: [750, 18, -56], node: [750, -48] },
  { id: "tecnologia", label: "Tecnologia", at: 0.6, anchor: [600, 42, -62], node: [600, -48] },
  { id: "green", label: "Green", at: 0.64, anchor: [1000, 10, -78], node: [1000, -100] },
];

export type Line = { text: string; anchor: [number, number, number] };

/** Quatro linhas curtas, uma de cada vez, presas a quatro pontos do mundo. */
export const LINES: Line[] = [
  { text: "mais presença", anchor: [860, 38, -70] },
  { text: "mais conexão", anchor: [640, 32, -110] },
  { text: "mais oportunidades", anchor: [420, 36, -60] },
  { text: "mais inteligência", anchor: [600, 64, -62] },
];

export const LOCKUP = {
  title: "BUILD 2030",
  support: "Construir. Escalar. Liderar.",
} as const;
