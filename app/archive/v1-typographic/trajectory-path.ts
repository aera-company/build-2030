/* ============================================================
   TRAJETÓRIA GAVEA
   Um gesto direcional persistente, derivado da ideia de
   trajetória / órbita presente na identidade (sem redesenhar o
   símbolo). Dois segmentos cúbicos (7 pontos) em coordenadas
   normalizadas da viewport, interpolados por jornada.
   Funções: horizonte (hero), baseline de tipo, caminho das
   palavras, arco de conexão, órbita (direction), bifurcação.
   ============================================================ */

import { EASE } from "@/motion/tokens";
import { clamp, cubicPoint, mixArray, lerp } from "@/motion/math";
import { BLOCKS } from "./journey";

/** 14 números: P0 C1 C2 P1 C3 C4 P2, em frações da viewport. */
export type Pts = number[];

type Key = { j: number; pts: Pts; rot?: number };

const H = BLOCKS.hero.start;
const C = BLOCKS.connect.start;
const D = BLOCKS.direction.start;
const T = BLOCKS.tease.start;

/** Órbita elíptica centrada: rx, ry em frações da viewport. */
const orbit = (cx: number, cy: number, rx: number, ry: number): Pts => {
  const k = 1.3333;
  return [
    cx, cy + ry,
    cx - k * rx, cy + ry,
    cx - k * rx, cy - ry,
    cx, cy - ry,
    cx + k * rx, cy - ry,
    cx + k * rx, cy + ry,
    cx, cy + ry,
  ];
};

/** Caminho principal. */
const MAIN: Key[] = [
  // escondido, dentro da área do logo
  { j: H + 0.0, pts: [0.66, 0.5, 0.66, 0.5, 0.67, 0.5, 0.67, 0.5, 0.68, 0.5, 0.68, 0.5, 0.69, 0.5] },
  { j: H + 0.86, pts: [0.66, 0.5, 0.66, 0.5, 0.67, 0.5, 0.67, 0.5, 0.68, 0.5, 0.68, 0.5, 0.69, 0.5] },
  // a linha deixa o logo e vira horizonte com leve queda (direção)
  { j: H + 1.35, pts: [-0.02, 0.56, 0.3, 0.56, 0.6, 0.57, 0.75, 0.575, 0.85, 0.58, 0.95, 0.585, 1.02, 0.59] },
  // baseline sob BUILD 2030
  { j: H + 1.95, pts: [-0.02, 0.69, 0.3, 0.69, 0.6, 0.69, 0.75, 0.69, 0.85, 0.69, 0.95, 0.69, 1.02, 0.69] },
  // caminho que as palavras percorrem: sobe à direita
  { j: H + 2.55, pts: [-0.02, 0.68, 0.3, 0.68, 0.55, 0.64, 0.7, 0.57, 0.85, 0.5, 0.95, 0.44, 1.05, 0.38] },
  // arco de conexão (swoosh aberto)
  { j: C + 0.15, pts: [-0.06, 0.6, 0.14, 0.68, 0.3, 0.2, 0.52, 0.3, 0.68, 0.36, 0.86, 0.5, 1.06, 0.22] },
  { j: C + 2.3, pts: [-0.06, 0.58, 0.14, 0.66, 0.3, 0.22, 0.52, 0.32, 0.68, 0.38, 0.86, 0.5, 1.06, 0.24] },
  // órbita (orquestração): só depois de `É sobre conectar.` sair
  { j: D + 0.35, pts: orbit(0.5, 0.52, 0.46, 0.3), rot: -9 },
  { j: D + 2.6, pts: orbit(0.5, 0.52, 0.44, 0.29), rot: -9 },
  // desenrola: a órbita vira um arco que parte da origem à esquerda
  { j: D + 2.95, pts: [-0.02, 0.62, 0.3, 0.62, 0.5, 0.6, 0.6, 0.58, 0.72, 0.56, 0.86, 0.54, 1.04, 0.52] },
  // ramo A: Marketing Direction (sobe)
  { j: T + 0.5, pts: [-0.02, 0.62, 0.3, 0.62, 0.5, 0.56, 0.6, 0.5, 0.72, 0.43, 0.86, 0.34, 1.04, 0.28] },
  { j: T + 1.6, pts: [-0.02, 0.62, 0.3, 0.62, 0.5, 0.56, 0.6, 0.5, 0.72, 0.43, 0.86, 0.34, 1.04, 0.28] },
];

/** Ramo B: AI & Intelligence (desce). Só existe no tease. */
const BRANCH: Key[] = [
  { j: T + 0.0, pts: [-0.02, 0.62, 0.3, 0.62, 0.5, 0.6, 0.6, 0.58, 0.72, 0.56, 0.86, 0.54, 1.04, 0.52] },
  { j: T + 0.5, pts: [-0.02, 0.62, 0.3, 0.62, 0.5, 0.68, 0.6, 0.74, 0.72, 0.8, 0.86, 0.88, 1.04, 0.94] },
  { j: T + 1.6, pts: [-0.02, 0.62, 0.3, 0.62, 0.5, 0.68, 0.6, 0.74, 0.72, 0.8, 0.86, 0.88, 1.04, 0.94] },
];

const sample = (keys: Key[], j: number): { pts: Pts; rot: number } => {
  if (j <= keys[0].j) return { pts: keys[0].pts, rot: keys[0].rot ?? 0 };
  const last = keys[keys.length - 1];
  if (j >= last.j) return { pts: last.pts, rot: last.rot ?? 0 };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (j >= a.j && j <= b.j) {
      const t = EASE.inOut((j - a.j) / (b.j - a.j));
      return {
        pts: mixArray(a.pts, b.pts, t),
        rot: lerp(a.rot ?? 0, b.rot ?? 0, t),
      };
    }
  }
  return { pts: last.pts, rot: last.rot ?? 0 };
};

export type TrajectoryState = {
  pts: Pts;
  rot: number;
  opacity: number;
  /** fração desenhada 0–1 */
  drawn: number;
  /** posição do ponto-guia ao longo do caminho 0–1 */
  head: number;
  headOpacity: number;
  branch: { pts: Pts; opacity: number; drawn: number } | null;
};

const s = (j: number, a: number, b: number, e = EASE.out) =>
  e(clamp((j - a) / (b - a)));

export const trajectoryAt = (j: number): TrajectoryState => {
  const main = sample(MAIN, j);

  // opacidade: nasce quando deixa o logo; some nos últimos instantes do tease
  const opacity = s(j, H + 0.86, H + 1.05) * (1 - s(j, T + 1.45, T + 1.6, EASE.expoIn));

  // desenho: hero desenha de 0 a 1; depois fica inteiro
  const drawn = s(j, H + 0.86, H + 1.5, EASE.cinematic);

  // ponto-guia
  let head = 0;
  let headOpacity = 0;
  if (j < C) {
    head = drawn;
    headOpacity = s(j, H + 0.9, H + 1.0) * (1 - s(j, H + 2.9, H + 3.1));
  } else if (j < D) {
    // varre o campo enquanto os elementos se alinham
    head = s(j, C + 0.3, C + 2.0, EASE.cinematic);
    headOpacity = s(j, C + 0.25, C + 0.4) * (1 - s(j, D - 0.35, D - 0.1));
  } else if (j < T) {
    // órbita contínua, levemente acelerando
    const pD = j - D;
    head = (0.25 + pD * (0.16 + pD * 0.02)) % 1;
    headOpacity = s(j, D + 0.3, D + 0.5) * (1 - s(j, T - 0.3, T - 0.05));
  } else {
    head = s(j, T + 0.0, T + 0.5, EASE.cinematic);
    headOpacity = s(j, T + 0.05, T + 0.2) * (1 - s(j, T + 0.6, T + 0.8));
  }

  let branch: TrajectoryState["branch"] = null;
  if (j >= T - 0.01) {
    const b = sample(BRANCH, j);
    branch = {
      pts: b.pts,
      opacity: s(j, T + 0.05, T + 0.25) * (1 - s(j, T + 1.45, T + 1.6, EASE.expoIn)),
      drawn: s(j, T + 0.05, T + 0.55, EASE.cinematic),
    };
  }

  return { pts: main.pts, rot: main.rot, opacity, drawn, head, headOpacity, branch };
};

/** Converte para px, com rotação opcional em torno do centro da viewport. */
export const toPx = (pts: Pts, rot: number, vw: number, vh: number): [number, number][] => {
  const out: [number, number][] = [];
  const cx = vw / 2;
  const cy = vh / 2;
  const a = (rot * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] * vw - cx;
    const y = pts[i + 1] * vh - cy;
    out.push([cx + x * cos - y * sin, cy + x * sin + y * cos]);
  }
  return out;
};

export const dAttr = (p: [number, number][]) =>
  `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} C ${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)} ${p[2][0].toFixed(1)} ${p[2][1].toFixed(1)} ${p[3][0].toFixed(1)} ${p[3][1].toFixed(1)} C ${p[4][0].toFixed(1)} ${p[4][1].toFixed(1)} ${p[5][0].toFixed(1)} ${p[5][1].toFixed(1)} ${p[6][0].toFixed(1)} ${p[6][1].toFixed(1)}`;

/** Ponto ao longo do caminho (t 0–1, por segmento, não por comprimento de arco). */
export const pointOn = (p: [number, number][], t: number): [number, number] => {
  const u = ((t % 1) + 1) % 1;
  if (u < 0.5) return cubicPoint(p[0], p[1], p[2], p[3], u * 2);
  return cubicPoint(p[3], p[4], p[5], p[6], (u - 0.5) * 2);
};

/** Normal aproximada (para offsets perpendiculares, ex.: palavras acima/abaixo). */
export const normalOn = (p: [number, number][], t: number): [number, number] => {
  const a = pointOn(p, clamp(t - 0.01, 0, 1));
  const b = pointOn(p, clamp(t + 0.01, 0, 1));
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
};
