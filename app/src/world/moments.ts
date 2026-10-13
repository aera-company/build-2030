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
  /** 03–04 · labels de capacidade (ver ZONES) */
  labelRamp: 0.03,
  labelsOut: 0.885,
  /** 05 · a camada de sistema */
  routesStart: 0.64,
  routesEnd: 0.76,
  pulses: 0.7,
  /** 06 · integração: a síntese, uma linha de cada vez, e a saída antes do lockup */
  synth: { one: 0.8, many: 0.835, oss: 0.875, out: 0.915 },
  /** 07 · BUILD 2030 */
  lockupIn: 0.93,
  lockupLine: 0.955,
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

/** Síntese (Ato 04). Sentence case; "One stop shop" só como conclusão, pequena. */
export const SYNTH = {
  one: "Uma GAVEA.",
  many: "Múltiplas capacidades.",
  oss: "One stop shop",
} as const;

export const LOCKUP = {
  title: "BUILD 2030",
  support: "Construir. Escalar. Liderar.",
  line: "A próxima fase começa com integração.",
} as const;
