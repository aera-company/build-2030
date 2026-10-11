import * as THREE from "three";
import { EASE } from "@/motion/tokens";
import { clamp, lerp } from "@/motion/math";

/* ============================================================
   CÂMERA · um caminho (docs/BUILD2030_CAMERA_PATH_V1.md)
   Posição e alvo em Catmull-Rom; tempo entre keyframes com
   easing cinemático. Respiração permanente. Nunca corta.
   ============================================================ */

type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

const KEYS: Key[] = [
  { p: 0.0, pos: [0, 3, 170], look: [0, 6, 0] },
  { p: 0.17, pos: [10, 4, 150], look: [0, 6, 0] },
  { p: 0.26, pos: [34, 9, 96], look: [26, 5, 30] },
  { p: 0.34, pos: [58, 7, 38], look: [44, 6, 10] },
  { p: 0.4, pos: [74, 11, 50], look: [10, 7, 4] },
  { p: 0.46, pos: [-10, 14, -84], look: [0, 6, 0] },
  { p: 0.54, pos: [-60, 18, -20], look: [0, 8, 0] },
  { p: 0.64, pos: [-70, 22, 60], look: [0, 8, 0] },
  { p: 0.74, pos: [-36, 12, 64], look: [0, 9, 0] },
  { p: 0.82, pos: [-12, 11, 4], look: [-62, 4, -36] },
  { p: 0.9, pos: [14, 11, 2], look: [62, 4, -38] },
  { p: 1.0, pos: [0, 70, 150], look: [0, 6, -10] },
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

/** P → u (parâmetro da curva), com easing entre keyframes. Entre 0.54 e 0.74 é linear: um ritmo. */
const toU = (p: number) => {
  const n = KEYS.length - 1;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  for (let i = 0; i < n; i++) {
    const a = KEYS[i].p;
    const b = KEYS[i + 1].p;
    if (p >= a && p <= b) {
      const raw = clamp((p - a) / (b - a));
      const steady = a >= 0.54 && b <= 0.74;
      const t = steady ? raw : EASE.inOut(raw);
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
  _pos.y += Math.sin(t * 0.00037) * 0.22;
  _pos.x += Math.sin(t * 0.00023) * 0.18;
  _look.y += Math.sin(t * 0.00029 + 1.2) * 0.12;
  out.pos.copy(_pos);
  out.look.copy(_look);
};

const ramp = (p: number, a: number, b: number, e = EASE.inOut) => e(clamp((p - a) / (b - a)));

export const atmosphereAt = (p: number) => {
  let fog = 0.03;
  fog = lerp(fog, 0.016, ramp(p, 0.17, 0.27));
  fog = lerp(fog, 0.013, ramp(p, 0.3, 0.4));
  fog = lerp(fog, 0.011, ramp(p, 0.5, 0.58));
  fog = lerp(fog, 0.0095, ramp(p, 0.72, 0.8));
  fog = lerp(fog, 0.0055, ramp(p, 0.92, 1.0));
  let key = 0.25;
  key = lerp(key, 2.6, ramp(p, 0.17, 0.27));
  key = lerp(key, 3.9, ramp(p, 0.3, 0.44));
  const fill = lerp(0, 1.1, ramp(p, 0.56, 0.66));
  const ambient = lerp(0.12, 0.45, ramp(p, 0.17, 0.44));
  return { fog, key, fill, ambient };
};
