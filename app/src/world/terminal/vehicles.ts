import * as THREE from "three";
import { C, CONTAINER_PALETTE, box, glow, std } from "../materials";
import { L, type Built, wrap } from "./layout";

/* ============================================================
   VEÍCULOS · caminhões em seis faixas (três vias, dois sentidos),
   empilhadeiras no pátio. Faróis e lanternas acesos.
   ============================================================ */

const cabMat = std(0x2b3340, 0.6, 0.3);
const chassisMat = std(0x14181d, 0.9, 0.1);
const headMat = glow(0xfff1d6, 3.0, 0x111111);
const tailMat = glow(C.red, 2.2, 0x220000);

type Truck = { g: THREE.Group; x: number; v: number; dir: number; z: number };

const truck = (color: number): THREE.Group => {
  const g = new THREE.Group();
  const cab = box(3.2, 3.0, 2.5, cabMat);
  cab.position.set(7.5, 1.9, 0);
  g.add(cab);
  const chassis = box(14, 0.8, 2.4, chassisMat);
  chassis.position.set(0, 0.9, 0);
  g.add(chassis);
  const cont = box(L.cont.l, L.cont.h, L.cont.w, std(color, 0.78, 0.18));
  cont.position.set(-0.6, 1.3 + L.cont.h / 2, 0);
  g.add(cont);
  const wheelMat = std(0x0d0f12, 0.95, 0);
  [[6.5, 0], [-2, 0], [-4.5, 0]].forEach(([wx]) => {
    [-1.3, 1.3].forEach((wz) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8), wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.5, wz);
      g.add(w);
    });
  });
  [-0.8, 0.8].forEach((wz) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.4), headMat);
    h.position.set(9.15, 1.1, wz);
    g.add(h);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.4), tailMat);
    t.position.set(-7.05, 1.1, wz);
    g.add(t);
  });
  return g;
};

export const buildVehicles = (): Built => {
  const group = new THREE.Group();
  const lanes = [
    { z: L.roadFront + 2.8, dir: 1 },
    { z: L.roadFront - 2.8, dir: -1 },
    { z: L.roadMid + 2.8, dir: 1 },
    { z: L.roadMid - 2.8, dir: -1 },
    { z: L.roadBack + 2.8, dir: 1 },
    { z: L.roadBack - 2.8, dir: -1 },
  ];
  const trucks: Truck[] = [];
  for (let i = 0; i < 18; i++) {
    const lane = lanes[i % lanes.length];
    const g = truck(CONTAINER_PALETTE[(i * 3) % CONTAINER_PALETTE.length]);
    g.position.set(0, 0, lane.z);
    g.rotation.y = lane.dir > 0 ? 0 : Math.PI;
    group.add(g);
    trucks.push({ g, x: ((i * 173) % 1200) - 60, v: 8 + ((i * 7) % 6), dir: lane.dir, z: lane.z });
  }
  // empilhadeiras (reach stackers) nas faixas entre blocos
  const stackers: { g: THREE.Group; x0: number; x1: number; phase: number }[] = [];
  const stackerMat = std(0x8a6b3a, 0.7, 0.2);
  [[140, 240, -79], [400, 500, -131 + 6.5], [270, 370, -163]].forEach(([x0, x1, z], i) => {
    const g = new THREE.Group();
    const body = box(6, 2.2, 3, stackerMat);
    body.position.y = 1.8;
    g.add(body);
    const boomS = box(1.0, 1.0, 9, stackerMat);
    boomS.position.set(0, 4.2, -1);
    boomS.rotation.x = -0.5;
    g.add(boomS);
    const cabS = box(2, 2, 2.4, cabMat);
    cabS.position.set(1.5, 3.9, 0);
    g.add(cabS);
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.6), headMat);
    hl.position.set(3.1, 1.6, 0);
    g.add(hl);
    g.position.set(x0, 0, z);
    g.rotation.y = 0;
    group.add(g);
    stackers.push({ g, x0, x1, phase: i * 1.9 });
  });

  const update = (t: number) => {
    const s = t / 1000;
    trucks.forEach((tr) => {
      const x = wrap(tr.x + tr.dir * tr.v * s, -100, 1200);
      tr.g.position.x = x;
    });
    stackers.forEach((st) => {
      const k = 0.5 + 0.5 * Math.sin(t * 0.00018 + st.phase);
      st.g.position.x = st.x0 + (st.x1 - st.x0) * k;
      const dir = Math.cos(t * 0.00018 + st.phase) >= 0 ? 0 : Math.PI;
      st.g.rotation.y = dir;
    });
  };

  return { group, update };
};
