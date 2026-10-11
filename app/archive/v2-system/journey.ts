/* ============================================================
   JORNADA
   Um só palco fixo. O scroll é medido em unidades de viewport
   (j = scrollY / vh). A experiência é um só mundo; os "blocos"
   existem só para o índice da barra e para o debug.
   Toda a coreografia usa P = j / JOURNEY_TOTAL (0–1).
   ============================================================ */

export type BlockId = "entrada" | "sistema" | "direction" | "frentes" | "build";

export type Block = { id: BlockId; index: number; start: number; len: number };

/** 11 viewports ≈ 36 s num scroll calmo. */
const LENS: Record<BlockId, number> = {
  entrada: 1.9, // P 0–0.17: GAVEA existe
  sistema: 3.0, // P 0.17–0.44: capacidades e correntes
  direction: 3.7, // P 0.44–0.78: a lâmina, o sistema se orienta, o nome
  frentes: 1.5, // P 0.78–0.92: duas frentes
  build: 0.9, // P 0.92–1: BUILD 2030
};

const ORDER: BlockId[] = ["entrada", "sistema", "direction", "frentes", "build"];

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
  sistema: "02 / Sistema",
  direction: "03 / Direction",
  frentes: "04 / Frentes",
  build: "05 / BUILD 2030",
};
