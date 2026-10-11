/* ============================================================
   JORNADA
   Um só palco fixo. O scroll é medido em unidades de viewport
   (j = scrollY / vh). A experiência inteira é um só mundo; os
   "blocos" existem só para o índice da barra e para o debug.
   Toda a coreografia usa P = j / JOURNEY_TOTAL (0–1).
   ============================================================ */

export type BlockId = "entrada" | "descoberta" | "direction" | "tease";

export type Block = { id: BlockId; index: number; start: number; len: number };

const LENS: Record<BlockId, number> = {
  entrada: 2.0, // escuro, AERA apresenta, marca, câmera começa
  descoberta: 3.2, // quatro áreas do sistema, conexões
  direction: 1.6, // um vetor
  tease: 1.2, // bifurcação
};

const ORDER: BlockId[] = ["entrada", "descoberta", "direction", "tease"];

export const BLOCKS: Record<BlockId, Block> = (() => {
  let acc = 0;
  const out = {} as Record<BlockId, Block>;
  ORDER.forEach((id, index) => {
    out[id] = { id, index, start: acc, len: LENS[id] };
    acc += LENS[id];
  });
  return out;
})();

/** Comprimento total da jornada em viewports (scroll máximo). */
export const JOURNEY_TOTAL = ORDER.reduce((a, id) => a + LENS[id], 0);

/** Altura do spacer: jornada + 1 viewport, para j alcançar JOURNEY_TOTAL. */
export const SPACER_VH = (JOURNEY_TOTAL + 1) * 100;

/** Progresso global 0–1. */
export const progressOf = (j: number) =>
  Math.min(1, Math.max(0, j / JOURNEY_TOTAL));

export const activeBlock = (j: number): Block => {
  for (let i = ORDER.length - 1; i >= 0; i--) {
    const b = BLOCKS[ORDER[i]];
    if (j >= b.start) return b;
  }
  return BLOCKS.entrada;
};

export const BLOCK_LABELS: Record<BlockId, string> = {
  entrada: "01 / Entrada",
  descoberta: "02 / Sistema",
  direction: "03 / Direction",
  tease: "04 / Próxima fase",
};
