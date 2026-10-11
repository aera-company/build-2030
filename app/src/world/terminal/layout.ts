import type * as THREE from "three";

/* ============================================================
   PLANTA DO TERMINAL · metros
   x ao longo do cais (0 → 1 100), z para a água (+) e para a
   retroárea (−). Linha do cais em z = 0. Ordem das zonas
   (Asset A/B): berço STS → pátio → galpões e torre → segundo
   berço → área técnica (Green). Ao fundo: viaduto, cidade, serra.
   ============================================================ */

export const L = {
  roadFront: -48,
  roadMid: -132,
  roadBack: -236,
  apron: { x0: -160, x1: 1260, z0: -380, z1: 0 },
  sts: { xs: [70, 150, 230, 310], legZ: [-5, -23] },
  cont: { l: 12.2, h: 2.6, w: 2.44 },
  /** faixas de blocos: z da borda da frente; cada bloco tem 6 colunas (15 m) */
  strips: [-58, -84, -110, -142, -168, -194],
  blockXs: [130, 260, 390, 520],
  blockLen: 110,
  cols: 6,
  ship1: { x0: 40, len: 262, beam: 40, z0: 3 },
  ship2: { x0: 680, len: 180, beam: 30, z0: 3 },
  mobileCranes: [720, 820],
  warehouses: [
    { x0: 660, x1: 840, z0: -58, z1: -108, h: 14 },
    { x0: 660, x1: 840, z0: -142, z1: -192, h: 12 },
    { x0: 880, x1: 1060, z0: -150, z1: -250, h: 17 },
  ],
  tower: { x: 600, z: -62, h: 36 },
  gate: { x: 640, z: -250 },
  green: { x0: 900, x1: 1090, z0: -58, z1: -128 },
  tanks: [930, 962, 994],
  viaductZ: -520,
  shoreZ: -660,
} as const;

export type Built = {
  group: THREE.Group;
  occluders?: THREE.Object3D[];
  /** t em ms; p em 0–1; sys = presença da camada de sistema (0–1) */
  update?: (t: number, p: number, sys: number) => void;
};

/** 0→1 dentro de [a, b], suavizado. */
export const piece = (u: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (u - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export const wrap = (v: number, min: number, max: number) => {
  const r = max - min;
  return min + ((((v - min) % r) + r) % r);
};
