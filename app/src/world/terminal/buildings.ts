import * as THREE from "three";
import { C, box, cyl, glow, sprite, std } from "../materials";
import { L, type Built } from "./layout";

/* ============================================================
   EDIFÍCIOS · galpões com docas acesas, torre de controle,
   portaria, tanques, campo solar. Luz artificial quente nas
   docas e janelas; a torre tem luz fria (é a Tecnologia).
   ============================================================ */

const wallMat = std(C.wall, 0.9, 0.05);
const roofMat = std(C.roof, 0.85, 0.08);
const doorLit = glow(C.warm, 2.6, 0x1a1208);
const doorDark = std(0x171b20, 0.9, 0.05);

const warehouse = (parent: THREE.Group, occ: THREE.Object3D[], x0: number, x1: number, z0: number, z1: number, h: number, seed: number) => {
  const w = x1 - x0;
  const d = z0 - z1;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const body = box(w, h, d, wallMat);
  body.position.set(cx, h / 2, cz);
  parent.add(body);
  occ.push(body);
  const roof = box(w + 1, 0.6, d + 1, roofMat);
  roof.position.set(cx, h + 0.3, cz);
  parent.add(roof);
  // claraboias no telhado
  for (let i = 0; i < Math.floor(w / 30); i++) {
    const sk = box(16, 1.2, d - 8, std(0x46505c, 0.7, 0.1));
    sk.position.set(x0 + 15 + i * 30, h + 1.2, cz);
    parent.add(sk);
  }
  // docas na frente (z0, lado do cais)
  const n = Math.floor(w / 12);
  for (let i = 0; i < n; i++) {
    const lit = (i * 7 + seed) % 5 !== 0;
    const door = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 0.4), lit ? doorLit : doorDark);
    door.position.set(x0 + 6 + i * 12, 2.6, z0 + 0.1);
    parent.add(door);
    if (lit && i % 2 === 0) {
      const s = sprite(C.warm, 9, 0.22);
      s.position.set(x0 + 6 + i * 12, 3.2, z0 + 2);
      parent.add(s);
    }
  }
  const canopy = box(w - 4, 0.5, 5, roofMat);
  canopy.position.set(cx, 6.2, z0 + 2.5);
  parent.add(canopy);
  // fileira de janelas altas, separadas
  const nw = Math.floor((w - 8) / 6);
  const win = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, 1.1, 0.3), glow(C.warmWhite, 1.5, 0x111111), nw * 2);
  const wm = new THREE.Matrix4();
  for (let i = 0; i < nw; i++) {
    wm.makeTranslation(x0 + 5.6 + i * 6, h - 2.2, z0 + 0.1);
    win.setMatrixAt(i, wm);
    wm.makeTranslation(x0 + 5.6 + i * 6, h - 2.2, z1 - 0.1);
    win.setMatrixAt(nw + i, wm);
  }
  parent.add(win);
};

export const buildBuildings = (): Built & { towerLight: THREE.PointLight } => {
  const group = new THREE.Group();
  const occluders: THREE.Object3D[] = [];
  L.warehouses.forEach((w, i) => warehouse(group, occluders, w.x0, w.x1, w.z0, w.z1, w.h, i));

  // Torre de controle: a Tecnologia
  const tw = L.tower;
  const shaft = box(14, tw.h - 8, 14, std(0x2d3540, 0.85, 0.1));
  shaft.position.set(tw.x, (tw.h - 8) / 2, tw.z);
  group.add(shaft);
  occluders.push(shaft);
  const cabin = box(20, 7, 20, std(0x1b2b3b, 0.3, 0.5));
  cabin.position.set(tw.x, tw.h - 4.5, tw.z);
  group.add(cabin);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(20.2, 3.2, 20.2), glow(0xbfe3f0, 1.5, 0x08202c));
  glass.position.set(tw.x, tw.h - 4.2, tw.z);
  group.add(glass);
  const roofT = box(22, 0.8, 22, roofMat);
  roofT.position.set(tw.x, tw.h - 0.6, tw.z);
  group.add(roofT);
  const antenna = cyl(0.15, 0.3, 12, std(C.steel), 6);
  antenna.position.set(tw.x + 6, tw.h + 6, tw.z - 6);
  group.add(antenna);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), glow(C.red, 3, 0x220000));
  beacon.position.set(tw.x + 6, tw.h + 12.4, tw.z - 6);
  beacon.name = "beacon";
  group.add(beacon);
  const dish = cyl(2.4, 0.4, 1.2, std(0x8b8f94, 0.6, 0.3), 12);
  dish.rotation.z = Math.PI * 0.4;
  dish.position.set(tw.x - 7, tw.h + 2.4, tw.z + 6);
  group.add(dish);
  const towerLight = new THREE.PointLight(0xbfe3f0, 0, 140, 1.8);
  towerLight.position.set(tw.x, tw.h - 3, tw.z + 12);
  group.add(towerLight);

  // Portaria: cobertura sobre a via de trás, cabines, luz
  const gt = L.gate;
  const canopy = box(44, 1.2, 14, roofMat);
  canopy.position.set(gt.x, 8, gt.z);
  group.add(canopy);
  [-18, -6, 6, 18].forEach((dx) => {
    const p = cyl(0.4, 0.5, 8, std(C.steel), 8);
    p.position.set(gt.x + dx, 4, gt.z - 6);
    group.add(p);
    const q = p.clone();
    q.position.z = gt.z + 6;
    group.add(q);
  });
  const under = new THREE.Mesh(new THREE.BoxGeometry(42, 0.3, 1.2), glow(C.warmWhite, 2.4, 0x111111));
  under.position.set(gt.x, 7.3, gt.z);
  group.add(under);
  [-12, 0, 12].forEach((dx) => {
    const booth = box(3, 3.2, 3, std(0x3a434e, 0.8, 0.1));
    booth.position.set(gt.x + dx, 1.6, gt.z);
    group.add(booth);
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 3.2), glow(C.warmWhite, 1.6, 0x111111));
    win.position.set(gt.x + dx, 2.2, gt.z);
    group.add(win);
  });
  const admin = box(30, 9, 16, wallMat);
  admin.position.set(gt.x + 48, 4.5, gt.z - 14);
  group.add(admin);
  for (let r = 0; r < 2; r++) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(26, 1.0, 0.3), glow(C.warmWhite, 1.6, 0x111111));
    w.position.set(gt.x + 48, 2.4 + r * 3.4, gt.z - 14 + 8.1);
    group.add(w);
  }

  // Área técnica: tanques, subestação, campo solar (Green)
  const tankMat = std(0x9da3a8, 0.5, 0.35);
  L.tanks.forEach((x) => {
    const t = cyl(11, 11, 12, tankMat, 24);
    t.position.set(x, 6, -112);
    group.add(t);
    const ring = cyl(11.2, 11.2, 0.5, std(0x6c7378, 0.6, 0.3), 24);
    ring.position.set(x, 8, -112);
    group.add(ring);
    occluders.push(t);
  });
  const sub = box(14, 5, 10, std(0x3a434e, 0.8, 0.1));
  sub.position.set(1050, 2.5, -112);
  group.add(sub);
  const subLight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), glow(C.teal, 2.2, 0x111111));
  subLight.position.set(1050, 5.6, -107);
  group.add(subLight);
  const gr = L.green;
  const rows = 6;
  const perRow = 30;
  const panels = new THREE.InstancedMesh(new THREE.BoxGeometry(5.6, 0.12, 2.6), std(0x10262f, 0.25, 0.6), rows * perRow);
  const mt = new THREE.Matrix4();
  const rot = new THREE.Matrix4().makeRotationX(-0.42);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < perRow; c++) {
      mt.makeTranslation(gr.x0 + 4 + c * 6.2, 1.6, gr.z0 - 4 - r * 6.5).multiply(rot);
      panels.setMatrixAt(i++, mt);
    }
  }
  panels.castShadow = true;
  group.add(panels);
  const legMat = std(C.steelDark, 0.8, 0.2);
  const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 1.6, 0.25), legMat, rows * perRow);
  i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < perRow; c++) {
      mt.makeTranslation(gr.x0 + 4 + c * 6.2, 0.8, gr.z0 - 4 - r * 6.5);
      legs.setMatrixAt(i++, mt);
    }
  }
  group.add(legs);
  // ponto de energia de cais (shore power)
  const shore = box(5, 3.5, 3, std(0x3a434e, 0.8, 0.1));
  shore.position.set(1010, 1.75, -16);
  group.add(shore);
  const shoreLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), glow(C.teal, 2.4, 0x111111));
  shoreLight.position.set(1010, 3.9, -14.4);
  group.add(shoreLight);

  const update = (t: number) => {
    const b = group.getObjectByName("beacon") as THREE.Mesh | null;
    if (b) (b.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(t * 0.003) > 0.5 ? 3 : 0.2;
  };

  return { group, occluders, update, towerLight };
};
