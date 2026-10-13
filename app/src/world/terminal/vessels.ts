import * as THREE from "three";
import { C, box, cyl, glow, sprite, std } from "../materials";
import { buildDeckStack } from "./containers";
import { L, type Built, wrap } from "./layout";

/* ============================================================
   EMBARCAÇÕES · porta-contêiner no berço 1 (proa para +x),
   graneleiro no berço 2 (proa para −x), dois rebocadores com esteira.
   Casco por extrusão de um perfil em planta.
   ============================================================ */

const hullMat = std(C.hull, 0.7, 0.3);
const bootMat = std(C.hullBoot, 0.8, 0.2);
const houseMat = std(0x6e6c66, 0.85, 0.1);
const deckMat = std(0x30383f, 0.96, 0.05);

/** Perfil em planta: popa em u=0, proa em u=len. v = meio-boca. */
const hullShape = (len: number, beam: number, bowAtPlusX: boolean) => {
  const s = new THREE.Shape();
  const b = beam / 2;
  const pts: [number, number][] = [
    [0, -b * 0.92], [len * 0.72, -b], [len * 0.9, -b * 0.7], [len, 0], [len * 0.9, b * 0.7], [len * 0.72, b], [0, b * 0.92], [-len * 0.03, 0],
  ];
  const map = (p: [number, number]): [number, number] => (bowAtPlusX ? p : [len - p[0], p[1]]);
  const first = map(pts[0]);
  s.moveTo(first[0], first[1]);
  pts.slice(1).forEach((p) => {
    const q = map(p);
    s.lineTo(q[0], q[1]);
  });
  s.closePath();
  return s;
};

const hull = (len: number, beam: number, height: number, bowAtPlusX: boolean) => {
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape(len, beam, bowAtPlusX), { depth: height, bevelEnabled: false }), hullMat);
  m.rotation.x = -Math.PI / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

const windows = (parent: THREE.Object3D, w: number, rows: number, y0: number, z: number, x: number, color = C.warmWhite) => {
  for (let r = 0; r < rows; r++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w - 8, 0.45, 0.3), glow(color, 0.6, 0x111111));
    strip.position.set(x, y0 + r * 2.6, z);
    parent.add(strip);
  }
};

export const buildVessels = (): Built => {
  const group = new THREE.Group();
  const occluders: THREE.Object3D[] = [];

  // Berço 1: porta-contêiner
  const s1 = L.ship1;
  const ship1 = new THREE.Group();
  ship1.position.set(s1.x0, -7, s1.z0 + s1.beam / 2);
  const h1 = hull(s1.len, s1.beam, 21, true);
  ship1.add(h1);
  const boot = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape(s1.len, s1.beam + 0.3, true), { depth: 2.2, bevelEnabled: false }), bootMat);
  boot.rotation.x = -Math.PI / 2;
  boot.position.y = 5.2;
  ship1.add(boot);
  const deck1 = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape(s1.len, s1.beam - 1, true), { depth: 0.6, bevelEnabled: false }), deckMat);
  deck1.rotation.x = -Math.PI / 2;
  deck1.position.y = 21;
  ship1.add(deck1);
  const house1 = box(18, 24, s1.beam - 6, houseMat);
  house1.position.set(36, 21 + 12, 0);
  ship1.add(house1);
  windows(house1, s1.beam - 8, 5, -8, (s1.beam - 6) / 2 + 0.1, 0);
  const bridge1 = box(22, 3.4, s1.beam + 4, houseMat);
  bridge1.position.set(36, 21 + 25.5, 0);
  ship1.add(bridge1);
  const funnel = box(6, 9, 8, std(0x1f3348, 0.7, 0.2));
  funnel.position.set(22, 21 + 16, 0);
  ship1.add(funnel);
  const mast1 = cyl(0.3, 0.5, 16, std(C.steel), 6);
  mast1.position.set(36, 21 + 35, 0);
  ship1.add(mast1);
  const mastLight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), glow(C.warmWhite, 3, 0x111111));
  mastLight.position.set(36, 21 + 43.5, 0);
  ship1.add(mastLight);
  const bowMast = cyl(0.25, 0.4, 10, std(C.steel), 6);
  bowMast.position.set(s1.len - 6, 21 + 5, 0);
  ship1.add(bowMast);
  const stack1 = buildDeckStack(ship1, 50, s1.len - 14, 0, 13, 5, 21.6);
  // luzes de convés
  [70, 120, 170, 220].forEach((x) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), glow(C.warmWhite, 2.5, 0x111111));
    l.position.set(x, 21 + 1, -s1.beam / 2 + 1.2);
    ship1.add(l);
    const sp = sprite(C.warm, 8, 0.2);
    sp.position.copy(l.position);
    ship1.add(sp);
  });
  group.add(ship1);
  occluders.push(h1, house1, stack1);

  // Berço 2: graneleiro, convés verde
  const s2 = L.ship2;
  const ship2 = new THREE.Group();
  ship2.position.set(s2.x0, -6, s2.z0 + s2.beam / 2);
  const h2 = hull(s2.len, s2.beam, 16, false);
  ship2.add(h2);
  const deck2 = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape(s2.len, s2.beam - 1, false), { depth: 0.6, bevelEnabled: false }), std(C.deckGreen, 0.95, 0.05));
  deck2.rotation.x = -Math.PI / 2;
  deck2.position.y = 16;
  ship2.add(deck2);
  for (let i = 0; i < 5; i++) {
    const hatch = box(22, 1.6, s2.beam - 10, std(0x26605f, 0.8, 0.1));
    hatch.position.set(24 + i * 28, 17.4, 0);
    ship2.add(hatch);
  }
  for (let i = 0; i < 4; i++) {
    const post = cyl(0.9, 1.1, 14, std(C.steel), 8);
    post.position.set(38 + i * 28, 16 + 7, -s2.beam / 2 + 5);
    ship2.add(post);
    const jib = box(0.8, 0.8, 16, std(C.steel));
    jib.position.set(38 + i * 28, 16 + 15, -s2.beam / 2 + 5 + 7);
    jib.rotation.x = -0.55;
    ship2.add(jib);
  }
  const house2 = box(14, 16, s2.beam - 6, houseMat);
  house2.position.set(s2.len - 22, 16 + 8, 0);
  ship2.add(house2);
  windows(house2, s2.beam - 8, 4, -5, (s2.beam - 6) / 2 + 0.1, 0);
  const funnel2 = cyl(2.2, 2.6, 8, std(0x1f3348, 0.7, 0.2), 10);
  funnel2.position.set(s2.len - 12, 16 + 18, 0);
  ship2.add(funnel2);
  const mast2 = cyl(0.3, 0.5, 14, std(C.steel), 6);
  mast2.position.set(s2.len - 22, 16 + 23, 0);
  ship2.add(mast2);
  group.add(ship2);
  occluders.push(h2, house2);

  // Rebocadores
  const tugMat = std(0x101820, 0.7, 0.3);
  const tug = (parent: THREE.Group) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape(26, 10, true), { depth: 5, bevelEnabled: false }), tugMat);
    body.rotation.x = -Math.PI / 2;
    body.position.set(-13, -2.5, 0);
    body.castShadow = true;
    g.add(body);
    const house = box(7, 4, 6, houseMat);
    house.position.set(-2, 4.5, 0);
    g.add(house);
    const w = new THREE.Mesh(new THREE.BoxGeometry(5, 0.9, 0.3), glow(C.warmWhite, 2.4, 0x111111));
    w.position.set(-2, 5.3, 3.1);
    g.add(w);
    const stack = cyl(0.6, 0.8, 4, std(0x1f3348), 8);
    stack.position.set(-6, 7, 0);
    g.add(stack);
    const nav = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), glow(C.warmWhite, 3, 0x111111));
    nav.position.set(-2, 8.5, 0);
    g.add(nav);
    // esteira
    const wake = new THREE.Shape();
    wake.moveTo(-8, -2.5);
    wake.lineTo(-8, 2.5);
    wake.lineTo(-70, 11);
    wake.lineTo(-70, -11);
    wake.closePath();
    const wk = new THREE.Mesh(new THREE.ShapeGeometry(wake), new THREE.MeshBasicMaterial({ color: 0x9fb8c8, transparent: true, opacity: 0.05, depthWrite: false, fog: true }));
    wk.visible = false;
    wk.rotation.x = -Math.PI / 2;
    wk.position.y = -0.9;
    g.add(wk);
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0.07, depthWrite: false, fog: true }));
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(-14, -0.85, 0);
    g.add(foam);
    parent.add(g);
    return g;
  };
  const tugA = tug(group);
  const tugB = tug(group);
  tugB.position.set(640, 0, 46);
  tugB.rotation.y = Math.PI * 0.55;
  const tugC = tug(group);

  const update = (t: number) => {
    ship1.position.y = -7 + Math.sin(t * 0.00031) * 0.18;
    ship1.rotation.x = Math.sin(t * 0.00023) * 0.003;
    ship2.position.y = -6 + Math.sin(t * 0.00027 + 1) * 0.15;
    const xa = wrap(1300 - (t / 1000) * 7.5, -300, 1500);
    tugA.position.set(xa, Math.sin(t * 0.0012) * 0.12, 120);
    tugA.rotation.y = Math.PI;
    tugA.rotation.z = Math.sin(t * 0.0009) * 0.01;
    const xc = wrap(-200 + (t / 1000) * 6.2, -300, 1500);
    tugC.position.set(xc, Math.sin(t * 0.0011 + 2) * 0.12, 260);
    tugC.rotation.z = Math.sin(t * 0.0008 + 1) * 0.01;
    tugB.position.y = Math.sin(t * 0.001 + 3) * 0.1;
  };

  return { group, occluders, update };
};
