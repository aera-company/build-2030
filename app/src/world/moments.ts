/* ============================================================
   MOMENTOS · a linha do tempo do mundo, em P (0–1 da jornada)
   Um só lugar para todos os instantes. Câmera, luz, zonas,
   trajetória e anotações leem daqui.
   ============================================================ */

export const M = {
  /** 01 · escuro. `AERA apresenta` entra e some. */
  presentsIn: 0.012,
  presentsHold: 0.07,
  presentsOut: 0.1,
  /** 02 · marca oficial, pequena/média, e some. */
  logoIn: 0.105,
  logoHold: 0.19,
  logoOut: 0.225,
  /** 03 · a câmera começa; a estrutura aparece; `GAVEA / BUILD 2030`. */
  structureIn: 0.2,
  titleLabel: 0.25,
  /** 04–06 · áreas ativam, uma a uma; conexões se formam. */
  zone: [0.37, 0.49, 0.6, 0.7] as const,
  zoneRamp: 0.05,
  /** 07 · tudo encontra um vetor. */
  connectHeadIn: 0.74,
  connectHeadOut: 0.84,
  alignIn: 0.79,
  alignOut: 0.9,
  directionIn: 0.87,
  /** hint · bifurcação. */
  branchIn: 0.93,
  branchFull: 0.985,
  branchLabelA: 0.95,
  branchLabelB: 0.97,
} as const;

export type ZoneId = "marketing" | "comercial" | "tecnologia" | "inteligencia";

export const ZONES: {
  id: ZoneId;
  index: string;
  label: string;
  /** posição no mundo */
  pos: [number, number, number];
  /** orientação própria antes de DIRECTION (rad) */
  rotY: number;
  /** altura da âncora do label */
  anchorY: number;
  /** fase do movimento independente */
  phase: number;
}[] = [
  { id: "marketing", index: "01", label: "Marketing", pos: [-40, 0, 20], rotY: 0.62, anchorY: 11.5, phase: 0.0 },
  { id: "comercial", index: "02", label: "Comercial", pos: [30, 0, 8], rotY: -0.38, anchorY: 9.5, phase: 1.9 },
  { id: "tecnologia", index: "03", label: "Tecnologia", pos: [-12, 0, -30], rotY: 0.28, anchorY: 17, phase: 3.4 },
  { id: "inteligencia", index: "04", label: "Inteligência", pos: [44, 0, -38], rotY: -0.72, anchorY: 13.5, phase: 5.1 },
];

/** Orientação compartilhada depois de DIRECTION: o vetor da trajetória. */
export const SHARED_ROT_Y = -0.18;
