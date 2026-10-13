import * as THREE from "three";
import { CONTAINER_PALETTE } from "../materials";
import { normalOnly } from "../textures";
import { L, type Built } from "./layout";

/* ============================================================
   CONTÊINERES · instanciados (um draw call para o pátio inteiro)
   Blocos em seis faixas, quatro blocos por faixa, até quatro
   alturas com perfil aleatório mas estável (semente fixa).
   ============================================================ */

let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const geometry = () => {
  const g = new THREE.BoxGeometry(L.cont.l, L.cont.h, L.cont.w);
  return g;
};

const material = () =>
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0.3, normalMap: normalOnly("corrugated_iron_02", [5, 1]), normalScale: new THREE.Vector2(0.9, 0.9) });

type Slot = { x: number; y: number; z: number };

const fill = (slots: Slot[], parent: THREE.Object3D) => {
  const mesh = new THREE.InstancedMesh(geometry(), material(), slots.length);
  const mt = new THREE.Matrix4();
  const col = new THREE.Color();
  slots.forEach((s, i) => {
    mt.makeTranslation(s.x, s.y, s.z);
    mesh.setMatrixAt(i, mt);
    col.setHex(CONTAINER_PALETTE[Math.floor(rnd() * CONTAINER_PALETTE.length)]);
    const v = 0.85 + rnd() * 0.3;
    col.multiplyScalar(v);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

export const buildYard = (): Built => {
  const group = new THREE.Group();
  const slots: Slot[] = [];
  const bays = Math.floor(L.blockLen / (L.cont.l + 0.4));
  L.strips.forEach((z0, si) => {
    L.blockXs.forEach((x0, bi) => {
      // perfil de alturas por baia, contínuo
      let h = 1 + Math.floor(rnd() * 3);
      for (let b = 0; b < bays; b++) {
        if (rnd() < 0.35) h = Math.max(0, Math.min(4, h + (rnd() < 0.5 ? -1 : 1)));
        if ((si + bi) % 5 === 3 && b > bays - 3) h = 0; // vãos
        for (let c = 0; c < L.cols; c++) {
          const hc = Math.max(0, h - (rnd() < 0.18 ? 1 : 0));
          for (let t = 0; t < hc; t++) {
            slots.push({
              x: x0 + b * (L.cont.l + 0.4) + L.cont.l / 2,
              y: L.cont.h / 2 + t * L.cont.h,
              z: z0 - c * (L.cont.w + 0.1) - L.cont.w / 2,
            });
          }
        }
      }
    });
  });
  const mesh = fill(slots, group);
  return { group, occluders: [mesh] };
};

/** Contêineres no convés de um navio (em coordenadas locais do navio). */
export const buildDeckStack = (parent: THREE.Object3D, x0: number, x1: number, zCenter: number, cols: number, tiersMax: number, deckY: number) => {
  const slots: Slot[] = [];
  const bays = Math.floor((x1 - x0) / (L.cont.l + 0.5));
  let h = tiersMax - 1;
  for (let b = 0; b < bays; b++) {
    if (rnd() < 0.4) h = Math.max(1, Math.min(tiersMax, h + (rnd() < 0.5 ? -1 : 1)));
    for (let c = 0; c < cols; c++) {
      const hc = Math.max(1, h - (rnd() < 0.15 ? 1 : 0));
      for (let t = 0; t < hc; t++) {
        slots.push({
          x: x0 + b * (L.cont.l + 0.5) + L.cont.l / 2,
          y: deckY + L.cont.h / 2 + t * L.cont.h,
          z: zCenter + (c - (cols - 1) / 2) * (L.cont.w + 0.08),
        });
      }
    }
  }
  return fill(slots, parent);
};
