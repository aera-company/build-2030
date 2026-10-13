/* ============================================================
   JORNADA · o hero inteiro
   Um só palco fixo. O scroll é medido em unidades de viewport
   (j = scrollY / vh). Os "beats" existem só para o índice da
   barra e para o debug. Toda a coreografia usa P = j / JOURNEY_TOTAL.
   ============================================================ */

export type BlockId =
  | "chegada"
  | "entrada"
  | "operacao"
  | "capacidades"
  | "sistema"
  | "direcao"
  | "build";

export type Block = { id: BlockId; index: number; start: number; len: number };

/** 9 viewports ≈ 30 s num scroll calmo (docs/GAVEA_BUILD2030_HERO_STORYBOARD_V2.md). */
const LENS: Record<BlockId, number> = {
  chegada: 1.26, // P 0–0.14
  entrada: 1.44, // P 0.14–0.30
  operacao: 1.8, // P 0.30–0.50
  capacidades: 1.26, // P 0.50–0.64
  sistema: 1.26, // P 0.64–0.78
  direcao: 1.08, // P 0.78–0.90 · integração / síntese
  build: 0.9, // P 0.90–1
};

const ORDER: BlockId[] = ["chegada", "entrada", "operacao", "capacidades", "sistema", "direcao", "build"];

export const BLOCKS: Record<BlockId, Block> = (() => {
  let acc = 0;
  const out = {} as Record<BlockId, Block>;
  ORDER.forEach((id, index) => {
    out[id] = { id, index, start: acc, len: LENS[id] };
    acc += LENS[id];
  });
  return out;
})();

export const JOURNEY_TOTAL = ORDER.reduce((a, id) => a + LENS[id], 0);

export const SPACER_VH = (JOURNEY_TOTAL + 1) * 100;

export const progressOf = (j: number) => Math.min(1, Math.max(0, j / JOURNEY_TOTAL));

export const activeBlock = (j: number): Block => {
  for (let i = ORDER.length - 1; i >= 0; i--) {
    const b = BLOCKS[ORDER[i]];
    if (j >= b.start) return b;
  }
  return BLOCKS.chegada;
};

export const BLOCK_LABELS: Record<BlockId, string> = {
  chegada: "01 / Chegada",
  entrada: "02 / Entrada",
  operacao: "03 / Operação",
  capacidades: "04 / Capacidades",
  sistema: "05 / Sistema",
  direcao: "06 / Integração",
  build: "07 / BUILD 2030",
};
