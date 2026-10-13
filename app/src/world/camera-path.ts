import * as THREE from "three";
import { EASE } from "@/motion/tokens";
import { clamp, lerp } from "@/motion/math";

/* ============================================================
   CÂMERA · uma travessia (docs/GAVEA_BUILD2030_HERO_CAMERA_PATH_V2.md)
   x ao longo do cais, y para cima, z para a água (+).
   Posição e alvo em Catmull-Rom; easing cinemático nas pontas,
   linear na travessia. Respiração permanente. Nunca corta.
   ============================================================ */

type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

const KEYS: Key[] = [
  { p: 0.0, pos: [20, 190, 430], look: [660, 0, -120] },
  { p: 0.14, pos: [90, 58, 250], look: [270, 14, -60] },
  { p: 0.22, pos: [80, 27, 100], look: [240, 20, -40] },
  { p: 0.3, pos: [200, 22, 110], look: [370, 12, -80] },
  { p: 0.38, pos: [310, 16, 10], look: [480, 10, -130] },
  { p: 0.44, pos: [385, 12.5, -132], look: [560, 9, -132] },
  { p: 0.5, pos: [545, 13, -132], look: [700, 12, -118] },
  { p: 0.56, pos: [645, 32, 60], look: [810, 12, -60] },
  { p: 0.66, pos: [805, 34, 160], look: [965, 12, -70] },
  { p: 0.78, pos: [985, 42, 200], look: [860, 10, -120] },
  { p: 0.9, pos: [560, 130, 430], look: [660, 4, -130] },
  { p: 1.0, pos: [100, 150, 340], look: [660, 0, -120] },
];

const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal", 0.5);
const lookCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.look)), false, "centripetal", 0.5);

/** P → u (parâmetro da curva). Entre 0.30 e 0.78 é linear: a travessia tem um ritmo. */
const toU = (p: number) => {
  const n = KEYS.length - 1;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  for (let i = 0; i < n; i++) {
    const a = KEYS[i].p;
    const b = KEYS[i + 1].p;
    if (p >= a && p <= b) {
      const raw = clamp((p - a) / (b - a));
      const steady = a >= 0.3 && b <= 0.78;
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
  _pos.y += Math.sin(t * 0.00037) * 0.35;
  _pos.x += Math.sin(t * 0.00023) * 0.3;
  _look.y += Math.sin(t * 0.00029 + 1.2) * 0.2;
  _look.x += Math.sin(t * 0.00019 + 0.4) * 0.6;
  out.pos.copy(_pos);
  out.look.copy(_look);
};

const ramp = (p: number, a: number, b: number, e = EASE.inOut) => e(clamp((p - a) / (b - a)));

/** Luz e névoa ao longo da travessia. O sol não muda: a hora do dia é uma só. */
/** Campo de visão: aberto nos planos gerais (chegada e lockup), 42° na travessia. */
export const fovAt = (p: number) => {
  let f = 52;
  f = lerp(f, 42, ramp(p, 0.12, 0.24));
  f = lerp(f, 52, ramp(p, 0.84, 0.96));
  return f;
};

export const atmosphereAt = (p: number) => {
  let fog = 0.00062;
  fog = lerp(fog, 0.0011, ramp(p, 0.14, 0.3));
  fog = lerp(fog, 0.0013, ramp(p, 0.38, 0.46));
  fog = lerp(fog, 0.0009, ramp(p, 0.52, 0.62));
  fog = lerp(fog, 0.00058, ramp(p, 0.8, 0.96));
  const fill = lerp(0, 0.55, ramp(p, 0.64, 0.74));
  const exposure = lerp(1.25, 1.3, ramp(p, 0.9, 0.98));
  const system = ramp(p, 0.64, 0.76, EASE.out);
  return { fog, fill, exposure, system };
};
