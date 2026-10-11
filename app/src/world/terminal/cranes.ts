import * as THREE from "three";
import { C, box, cyl, glow, sprite, std } from "../materials";
import { L, piece, type Built } from "./layout";

/* ============================================================
   GUINDASTES · STS no cais, RTG no pátio, móveis no segundo berço
   Cada um tem ciclo próprio e fase própria: a operação nunca
   para e nunca sincroniza.
   ============================================================ */

const steel = std(C.steel, 0.72, 0.3);
const dark = std(C.steelDark, 0.8, 0.2);
const contMat = (hex: number) => std(hex, 0.78, 0.18);

/** Barra entre dois pontos (cabos, estais). */
const bar = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
  const d = b.clone().sub(a);
  const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
};

type Sts = { group: THREE.Group; trolley: THREE.Group; hang: THREE.Group; cables: THREE.Mesh[]; top: THREE.Mesh; phase: number };

const buildSts = (x: number, phase: number, parent: THREE.Group, occ: THREE.Object3D[]): Sts => {
  const g = new THREE.Group();
  g.position.x = x;
  const [zA, zB] = L.sts.legZ;
  const H = 50;
  const legs: THREE.Mesh[] = [];
  [[-8, zA], [8, zA], [-8, zB], [8, zB]].forEach(([lx, lz]) => {
    const leg = box(2.2, H, 2.2, steel);
    leg.position.set(lx, H / 2, lz);
    g.add(leg);
    legs.push(leg);
  });
  // portais
  [zA, zB].forEach((z) => {
    const beam = box(20, 2.2, 2.2, steel);
    beam.position.set(0, H - 1, z);
    g.add(beam);
    const sill = box(20, 1.6, 1.6, dark);
    sill.position.set(0, 14, z);
    g.add(sill);
  });
  [-8, 8].forEach((lx) => {
    const beam = box(2.2, 2.2, Math.abs(zA - zB) + 2.2, steel);
    beam.position.set(lx, H - 1, (zA + zB) / 2);
    g.add(beam);
    const diag = bar(new THREE.Vector3(lx, 2, zA - 1), new THREE.Vector3(lx, H - 4, zB + 1), 0.45, dark);
    g.add(diag);
  });
  // lança: da retaguarda (z −42) até sobre a água (z +64)
  const boomZ0 = -42;
  const boomZ1 = 64;
  const boom = box(2.4, 2.6, boomZ1 - boomZ0, steel);
  boom.position.set(0, H + 2.5, (boomZ0 + boomZ1) / 2);
  g.add(boom);
  const boomRail = box(6, 0.5, boomZ1 - boomZ0, dark);
  boomRail.position.set(0, H + 1.2, (boomZ0 + boomZ1) / 2);
  g.add(boomRail);
  // pilone em A e estais
  const pyl = box(3, 30, 3, steel);
  pyl.position.set(0, H + 15, zB + 5);
  g.add(pyl);
  const apex = new THREE.Vector3(0, H + 30, zB + 5);
  [boomZ1 - 2, boomZ1 - 28, boomZ0 + 3].forEach((z) => g.add(bar(apex, new THREE.Vector3(0, H + 3.8, z), 0.22, dark)));
  // casa de máquinas na retaguarda
  const house = box(7, 4.5, 12, dark);
  house.position.set(0, H + 6.2, boomZ0 + 8);
  g.add(house);
  // holofotes sob a lança, luz de obstrução no topo
  [40, 14, -12].forEach((z) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.2), glow(C.warmWhite, 2.6, 0x111111));
    f.position.set(0, H + 0.6, z);
    g.add(f);
    const s = sprite(C.warmWhite, 14, 0.2);
    s.position.set(0, H + 0.2, z);
    g.add(s);
  });
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), glow(C.red, 3, 0x220000));
  top.position.copy(apex).setY(apex.y + 1);
  g.add(top);
  // trolley + spreader + contêiner
  const trolley = new THREE.Group();
  const tbody = box(5, 2, 5, dark);
  tbody.position.y = H - 0.2;
  trolley.add(tbody);
  const cab = box(3, 2, 3, steel);
  cab.position.set(0, H - 2.2, 2);
  trolley.add(cab);
  const hang = new THREE.Group();
  const spreader = box(2.8, 0.6, 13, dark);
  spreader.position.y = 1.6;
  hang.add(spreader);
  const cont = box(L.cont.w, L.cont.h, L.cont.l, contMat(0x6e4536));
  cont.position.y = 0;
  hang.add(cont);
  trolley.add(hang);
  const cables: THREE.Mesh[] = [];
  [[-1.1, -5], [1.1, -5], [-1.1, 5], [1.1, 5]].forEach(([cx, cz]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 4), dark);
    c.position.set(cx, 0, cz);
    trolley.add(c);
    cables.push(c);
  });
  g.add(trolley);
  parent.add(g);
  occ.push(...legs, boom, pyl, house);
  return { group: g, trolley, hang, cables, top, phase };
};

const updateSts = (s: Sts, t: number) => {
  const H = 50;
  const u = ((t * 0.000055 + s.phase) % 1 + 1) % 1;
  // ciclo: desce ao navio, sobe, viaja à retaguarda, desce ao caminhão, sobe, volta
  const zShip = 30;
  const zQuay = -14;
  let z = zShip;
  let y = H - 4; // altura do contêiner (topo)
  const lowShip = 24;
  const lowQuay = 5;
  if (u < 0.16) y = H - 4 - (H - 4 - lowShip) * piece(u, 0, 0.16);
  else if (u < 0.26) y = lowShip + (H - 4 - lowShip) * piece(u, 0.16, 0.26);
  else if (u < 0.5) z = zShip + (zQuay - zShip) * piece(u, 0.26, 0.5);
  else if (u < 0.64) { z = zQuay; y = H - 4 - (H - 4 - lowQuay) * piece(u, 0.5, 0.64); }
  else if (u < 0.76) { z = zQuay; y = lowQuay + (H - 4 - lowQuay) * piece(u, 0.64, 0.76); }
  else z = zQuay + (zShip - zQuay) * piece(u, 0.76, 1);
  s.trolley.position.z = z;
  const hangTop = H - 1.2;
  const hangY = y + 1.9;
  const len = Math.max(0.5, hangTop - hangY);
  s.cables.forEach((c) => {
    c.scale.y = len;
    c.position.y = hangTop - len / 2;
  });
  s.hang.position.y = hangY;
  const blink = (Math.sin(t * 0.004 + s.phase * 10) > 0.6 ? 1 : 0.15) as number;
  (s.top.material as THREE.MeshStandardMaterial).emissiveIntensity = 3 * blink;
};

type Rtg = { group: THREE.Group; trolley: THREE.Group; x0: number; x1: number; z0: number; phase: number };

const buildRtg = (x0: number, z0: number, phase: number, parent: THREE.Group): Rtg => {
  const g = new THREE.Group();
  const H = 19;
  const span = L.cols * (L.cont.w + 0.1) + 6; // bloco + faixa do caminhão
  const zc = z0 - span / 2 + 2.5;
  const legs = [[-7, zc + span / 2 - 1], [7, zc + span / 2 - 1], [-7, zc - span / 2 + 1], [7, zc - span / 2 + 1]];
  legs.forEach(([lx, lz]) => {
    const leg = box(1.3, H, 1.3, steel);
    leg.position.set(lx, H / 2, lz);
    g.add(leg);
    const tyre = box(1.3, 1.6, 2.2, std(0x0f1113, 0.95, 0));
    tyre.position.set(lx, 0.8, lz);
    g.add(tyre);
  });
  [-7, 7].forEach((lx) => {
    const beam = box(1.4, 1.6, span, steel);
    beam.position.set(lx, H, zc);
    g.add(beam);
  });
  [zc + span / 2 - 1, zc - span / 2 + 1].forEach((lz) => {
    const beam = box(15.4, 1.4, 1.4, steel);
    beam.position.set(0, H, lz);
    g.add(beam);
  });
  const stripe = box(14.6, 0.5, 0.3, std(0x1f5a6a, 0.6, 0.2));
  stripe.position.set(0, H + 0.95, zc + span / 2 - 1);
  g.add(stripe);
  const trolley = new THREE.Group();
  const tb = box(4, 1.6, 4, dark);
  tb.position.y = H + 1;
  trolley.add(tb);
  const cab = box(2.4, 1.8, 2.4, steel);
  cab.position.set(3.2, H - 1.2, 0);
  trolley.add(cab);
  const spreader = box(L.cont.l + 0.4, 0.5, 2.4, dark);
  spreader.name = "spreader";
  trolley.add(spreader);
  const cont = box(L.cont.l, L.cont.h, L.cont.w, contMat(0x1e3348));
  cont.name = "cont";
  trolley.add(cont);
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 4), dark);
  c1.name = "cable";
  trolley.add(c1);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1), glow(C.warmWhite, 3, 0x111111));
  lamp.position.set(0, H - 1, 0);
  trolley.add(lamp);
  const s = sprite(C.warmWhite, 10, 0.25);
  s.position.set(0, H - 1.2, 0);
  trolley.add(s);
  g.add(trolley);
  g.position.set(x0 + L.blockLen / 2, 0, 0);
  parent.add(g);
  return { group: g, trolley, x0: x0 + 10, x1: x0 + L.blockLen - 10, z0: zc, phase };
};

const updateRtg = (r: Rtg, t: number) => {
  const H = 19;
  const kx = 0.5 + 0.5 * Math.sin(t * 0.00011 + r.phase);
  r.group.position.x = r.x0 + (r.x1 - r.x0) * kx;
  const span = L.cols * (L.cont.w + 0.1) + 6;
  const kz = 0.5 + 0.5 * Math.sin(t * 0.00027 + r.phase * 2.3);
  r.trolley.position.z = r.z0 - span / 2 + 4 + (span - 8) * kz;
  const ky = 0.5 + 0.5 * Math.sin(t * 0.00045 + r.phase * 1.7);
  const y = 4 + (H - 8) * ky;
  const cont = r.trolley.getObjectByName("cont")!;
  const spr = r.trolley.getObjectByName("spreader")!;
  const cab = r.trolley.getObjectByName("cable") as THREE.Mesh;
  cont.position.y = y;
  spr.position.y = y + L.cont.h / 2 + 0.25;
  const top = H + 0.2;
  const len = Math.max(0.5, top - (y + L.cont.h / 2 + 0.5));
  cab.scale.y = len;
  cab.position.y = top - len / 2;
};

type Mobile = { pivot: THREE.Group; phase: number };

const buildMobile = (x: number, phase: number, parent: THREE.Group, occ: THREE.Object3D[]): Mobile => {
  const g = new THREE.Group();
  g.position.set(x, 0, -12);
  const base = box(12, 4, 12, dark);
  base.position.y = 2;
  g.add(base);
  const tower = cyl(2.6, 3.2, 14, steel, 12);
  tower.position.y = 11;
  g.add(tower);
  const pivot = new THREE.Group();
  pivot.position.y = 18;
  const cab = box(7, 4, 9, steel);
  cab.position.set(0, 2, -1);
  pivot.add(cab);
  const counter = box(6, 3, 4, dark);
  counter.position.set(0, 1.5, -7);
  pivot.add(counter);
  const boom = box(1.8, 1.8, 48, steel);
  boom.position.set(0, 0, 0);
  const boomPivot = new THREE.Group();
  boomPivot.position.set(0, 3.5, 3);
  boom.position.set(0, 0, 24);
  boomPivot.add(boom);
  boomPivot.rotation.x = -Math.PI * 0.3;
  pivot.add(boomPivot);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), glow(C.red, 2.5, 0x220000));
  tip.position.set(0, 0, 48);
  boomPivot.add(tip);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.2), glow(C.warmWhite, 3, 0x111111));
  lamp.position.set(0, 4.3, 3);
  pivot.add(lamp);
  g.add(pivot);
  parent.add(g);
  occ.push(base, tower, cab);
  return { pivot, phase };
};

export const buildCranes = (): Built => {
  const group = new THREE.Group();
  const occluders: THREE.Object3D[] = [];
  const sts = L.sts.xs.map((x, i) => buildSts(x, i * 0.27 + 0.1, group, occluders));
  const rtgs: Rtg[] = [];
  const rtgBlocks: [number, number][] = [[0, 0], [1, 1], [2, 0], [3, 2], [0, 3], [1, 4], [2, 5], [3, 4]];
  rtgBlocks.forEach(([bi, si], i) => rtgs.push(buildRtg(L.blockXs[bi], L.strips[si], i * 1.3, group)));
  const mobiles = L.mobileCranes.map((x, i) => buildMobile(x, i * 2.1, group, occluders));
  const update = (t: number) => {
    sts.forEach((s) => updateSts(s, t));
    rtgs.forEach((r) => updateRtg(r, t));
    mobiles.forEach((m) => {
      m.pivot.rotation.y = Math.sin(t * 0.00009 + m.phase) * 0.55 + 0.2;
    });
  };
  return { group, occluders, update };
};
