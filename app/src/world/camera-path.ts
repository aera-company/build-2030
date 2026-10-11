import * as THREE from "three";
import { EASE } from "@/motion/tokens";
import { clamp, lerp } from "@/motion/math";

/* ============================================================
   CÂMERA · a protagonista
   Keyframes (P → posição, alvo). A posição e o alvo passam por
   Catmull-Rom (caminho espacial suave); o tempo entre keyframes
   é controlado por easing (chega, segura, parte).
   ============================================================ */

type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

const KEYS: Key[] = [
  // 01 · escuro, longe e baixo, olhando o mundo
  { p: 0.0, pos: [6, 3.2, 150], look: [0, 4, 0] },
  // 02 · marca: a câmera quase parada, deriva mínima
  { p: 0.16, pos: [-6, 4.2, 128], look: [0, 4.5, 0] },
  // 03 · começa a mover; a estrutura aparece
  { p: 0.28, pos: [-46, 8.5, 62], look: [-36, 5, 20] },
  // 04 · Marketing: aproxima e orbita um pouco
  { p: 0.4, pos: [-56, 6.5, 38], look: [-40, 5, 18] },
  // passa entre as áreas (oclusão)
  { p: 0.46, pos: [-18, 5.5, 34], look: [8, 4, 12] },
  // 05 · Comercial
  { p: 0.53, pos: [50, 11, 44], look: [28, 4, 4] },
  // 06 · Tecnologia: sobe e passa por trás do pórtico
  { p: 0.63, pos: [-30, 15, -2], look: [-12, 8, -30] },
  // Inteligência
  { p: 0.73, pos: [26, 11, -10], look: [44, 6, -38] },
  // 07 · recua e sobe: o sistema inteiro, o navio, o horizonte
  { p: 0.86, pos: [2, 46, 90], look: [4, 2, -26] },
  // hint · um pouco mais alto, a bifurcação à direita
  { p: 1.0, pos: [-6, 42, 100], look: [18, 3, -38] },
];

const posCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.pos)),
  false,
  "centripetal",
  0.5,
);
const lookCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.look)),
  false,
  "centripetal",
  0.5,
);

/** P → u (parâmetro da curva), com easing cinemático entre keyframes. */
const toU = (p: number) => {
  const n = KEYS.length - 1;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  for (let i = 0; i < n; i++) {
    const a = KEYS[i].p;
    const b = KEYS[i + 1].p;
    if (p >= a && p <= b) {
      const t = EASE.inOut(clamp((p - a) / (b - a)));
      return (i + t) / n;
    }
  }
  return 1;
};

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export const cameraAt = (p: number, t: number, out: { pos: THREE.Vector3; look: THREE.Vector3 }) => {
  const u = toU(p);
  posCurve.getPoint(u, _pos);
  lookCurve.getPoint(u, _look);
  // respiração mínima: a câmera nunca está morta
  _pos.y += Math.sin(t * 0.00037) * 0.22;
  _pos.x += Math.sin(t * 0.00023) * 0.18;
  _look.y += Math.sin(t * 0.00029 + 1.2) * 0.12;
  out.pos.copy(_pos);
  out.look.copy(_look);
};

/* ------------------------------------------------------------
   LUZ E NÉVOA · a revelação
   O ambiente nunca está todo visível. A névoa abre com o scroll;
   a luz-chave sobe quando a estrutura aparece.
   ------------------------------------------------------------ */

const ramp = (p: number, a: number, b: number, e = EASE.inOut) => e(clamp((p - a) / (b - a)));

export const atmosphereAt = (p: number) => {
  let fog = 0.03;
  fog = lerp(fog, 0.015, ramp(p, 0.18, 0.3));
  fog = lerp(fog, 0.011, ramp(p, 0.36, 0.6));
  fog = lerp(fog, 0.0062, ramp(p, 0.78, 0.9));
  let key = 0.25;
  key = lerp(key, 2.6, ramp(p, 0.19, 0.29));
  key = lerp(key, 3.9, ramp(p, 0.34, 0.5));
  key = lerp(key, 3.8, ramp(p, 0.8, 0.9));
  const fill = lerp(0, 1.1, ramp(p, 0.79, 0.9));
  const ambient = lerp(0.12, 0.45, ramp(p, 0.2, 0.5));
  return { fog, key, fill, ambient };
};
