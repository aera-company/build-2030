/* ============================================================
   MOMENTOS · a linha do tempo da história, em P (0–1)
   Oito estados (docs/BUILD2030_SPATIAL_STORY_V1.md). Um só lugar
   para todos os instantes: câmera, luz, partes, lâmina,
   trajetória, ramos e anotações leem daqui.
   ============================================================ */

export const M = {
  /** 01 · GAVEA existe */
  presentsIn: 0.012,
  presentsHold: 0.06,
  presentsOut: 0.085,
  logoIn: 0.085,
  logoHold: 0.15,
  logoOut: 0.175,
  /** 02–03 · capacidades e correntes: cada parte é descoberta pela câmera */
  partRamp: 0.035,
  /** 04 · a lâmina atravessa o sistema (x de +150 a −150) */
  sweepStart: 0.44,
  sweepEnd: 0.6,
  /** 05 · a trajetória entra, atravessa o núcleo */
  trajIn: 0.55,
  trajFull: 0.66,
  /** 06 · o nome */
  directionLabel: 0.66,
  attrs: 0.68,
  attrStagger: 0.013,
  aera: 0.73,
  headIn: 0.75,
  headOut: 0.86,
  /** 07 · duas frentes */
  branchA: { draw: 0.76, full: 0.84, name: 0.79 },
  branchB: { draw: 0.84, full: 0.91, name: 0.87 },
  /** 08 · BUILD 2030 */
  finaleIn: 0.94,
} as const;

export type PartKind =
  | "window"
  | "gantry"
  | "panels"
  | "pillars"
  | "blocks"
  | "slabs"
  | "nodes"
  | "ring";

export type Part = {
  id: string;
  label: string;
  kind: PartKind;
  /** ângulo no anel (graus; 0 = +x, 90 = +z, para o visitante) */
  ang: number;
  /** raio próprio (antes de DIRECTION) */
  r: number;
  /** desvio de orientação próprio (rad) antes de DIRECTION */
  yaw: number;
  /** altura da âncora do label */
  anchorY: number;
  /** quando a câmera descobre a parte */
  at: number;
  /** clipe (só para janelas) */
  clip?: "operacao" | "porto" | "equipamento" | "equipe" | "mar" | "cais" | "aco";
  /** fase do movimento independente */
  phase: number;
};

/** Raio do anel ordenado, depois de DIRECTION. */
export const RING_R = 52;

export const PARTS: Part[] = [
  { id: "operacao", label: "Operação", kind: "window", ang: 12, r: 46, yaw: 0.55, anchorY: 11.5, at: 0.2, clip: "operacao", phase: 0.3 },
  { id: "comercial", label: "Comercial", kind: "window", ang: 58, r: 54, yaw: -0.7, anchorY: 12, at: 0.24, clip: "porto", phase: 1.7 },
  { id: "marketing", label: "Marketing", kind: "window", ang: 112, r: 48, yaw: 0.85, anchorY: 11.5, at: 0.27, clip: "equipamento", phase: 2.9 },
  { id: "pessoas", label: "Pessoas", kind: "window", ang: 160, r: 52, yaw: -0.5, anchorY: 11, at: 0.3, clip: "equipe", phase: 4.1 },
  { id: "tecnologia", label: "Tecnologia", kind: "gantry", ang: 36, r: 66, yaw: 0.6, anchorY: 15, at: 0.33, phase: 0.9 },
  { id: "agencia", label: "Agência", kind: "panels", ang: 86, r: 64, yaw: -0.8, anchorY: 11, at: 0.36, phase: 2.2 },
  { id: "time", label: "Time interno", kind: "pillars", ang: 136, r: 62, yaw: 0.7, anchorY: 10, at: 0.38, phase: 3.6 },
  { id: "parceiros", label: "Parceiros", kind: "blocks", ang: 206, r: 60, yaw: -0.6, anchorY: 9.5, at: 0.4, phase: 4.8 },
  { id: "projetos", label: "Projetos", kind: "slabs", ang: 250, r: 58, yaw: 0.9, anchorY: 8.5, at: 0.42, phase: 5.5 },
  { id: "conhecimento", label: "Conhecimento", kind: "nodes", ang: 294, r: 62, yaw: -0.75, anchorY: 13.5, at: 0.43, phase: 0.6 },
  { id: "ia", label: "IA", kind: "ring", ang: 336, r: 56, yaw: 0.5, anchorY: 9, at: 0.44, phase: 1.3 },
];

export const ATTRS = ["Planejar", "Priorizar", "Conectar", "Acompanhar"] as const;

export const BRANCH_A = {
  name: "MARKETING DIRECTION",
  nodes: ["Marca", "Posicionamento", "Planejamento", "Conteúdo", "Comercial", "Agência", "Parceiros"],
} as const;

export const BRANCH_B = {
  name: "AI & INTELLIGENCE",
  nodes: ["Conhecimento", "Processo", "Dados", "Automação", "Oportunidade", "Decisão"],
} as const;

export const SUPPORT_LINES = {
  a: "DIRECTION / MARKETING / INTELLIGENCE",
  b: "BUILD / SCALE / LEAD",
} as const;
