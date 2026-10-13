import * as THREE from "three";
import { C, cyl, glow, sprite, std } from "../materials";
import { pbr, waterNormals } from "../textures";
import { Water } from "three/addons/objects/Water.js";
import { SUN_DIR } from "./sky";
import { L, type Built } from "./layout";

/* ============================================================
   CHÃO E ÁGUA · pátio de concreto, vias, linha do cais,
   defensas, postes, torres de iluminação, árvores, a baía e os
   reflexos das luzes na água.
   ============================================================ */

const streakTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "rgba(255,255,255,0.0)");
    grd.addColorStop(0.18, "rgba(255,255,255,0.7)");
    grd.addColorStop(0.5, "rgba(255,255,255,0.35)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 32, 256);
    const h = g.createLinearGradient(0, 0, 32, 0);
    h.addColorStop(0, "rgba(0,0,0,1)");
    h.addColorStop(0.5, "rgba(0,0,0,0)");
    h.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = h;
    g.fillRect(0, 0, 32, 256);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();

export const buildGround = (): Built & { lampPoints: THREE.Vector3[] } => {
  const group = new THREE.Group();
  const lampPoints: THREE.Vector3[] = [];

  // Pátio de concreto
  const ap = L.apron;
  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(ap.x1 - ap.x0, ap.z1 - ap.z0),
    new THREE.MeshStandardMaterial({ color: 0x6a7079, roughness: 0.97, metalness: 0.0, ...pbr("concrete_floor_02", [118, 32]), normalScale: new THREE.Vector2(0.5, 0.5) }),
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.set((ap.x0 + ap.x1) / 2, 0, (ap.z0 + ap.z1) / 2);
  apron.receiveShadow = true;
  group.add(apron);

  // Vias: três ao longo do cais, três transversais
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x6b6f75, roughness: 0.97, metalness: 0.0, ...pbr("asphalt_02", [112, 1]), normalScale: new THREE.Vector2(0.5, 0.5) });
  const road = (x0: number, x1: number, z0: number, z1: number) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), roadMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set((x0 + x1) / 2, 0.06, (z0 + z1) / 2);
    r.receiveShadow = true;
    group.add(r);
  };
  [L.roadFront, L.roadMid, L.roadBack].forEach((z) => road(-120, 1220, z - 6, z + 6));
  [110, 640, 880, 1120].forEach((x) => road(x - 6, x + 6, -300, L.roadFront));
  // faixa central tracejada (um só mesh por via)
  const dashMat = std(0x4a515b, 1, 0);
  const dashes = (x0: number, x1: number, z: number) => {
    const n = Math.floor((x1 - x0) / 14);
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(5, 0.04, 0.3), dashMat, n);
    const mt = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      mt.makeTranslation(x0 + i * 14 + 2.5, 0.09, z);
      m.setMatrixAt(i, mt);
    }
    group.add(m);
  };
  [L.roadFront, L.roadMid, L.roadBack].forEach((z) => dashes(-120, 1220, z));

  // Linha do cais, meio-fio, defensas, cabeços
  const curb = new THREE.Mesh(new THREE.BoxGeometry(1420, 1.1, 2.4), std(C.concreteLight, 0.9, 0.05));
  curb.position.set(550, 0.55, -0.2);
  curb.receiveShadow = true;
  group.add(curb);
  const edgeLine = new THREE.Mesh(new THREE.BoxGeometry(1420, 0.08, 0.5), std(0x6c6a5c, 1, 0));
  edgeLine.position.set(550, 1.12, -1.4);
  group.add(edgeLine);
  const fenderMat = std(0x111417, 0.9, 0.1);
  const fenders = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 2.2, 1.4), fenderMat, 60);
  const bollards = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.65, 1.1, 10), std(0x202428, 0.6, 0.4), 60);
  const mt = new THREE.Matrix4();
  for (let i = 0; i < 60; i++) {
    mt.makeTranslation(-100 + i * 22, 0.2, 1.3);
    fenders.setMatrixAt(i, mt);
    mt.makeTranslation(-100 + i * 22 + 11, 1.6, -1.2);
    bollards.setMatrixAt(i, mt);
  }
  group.add(fenders, bollards);

  // Trilhos dos STS
  L.sts.legZ.forEach((z) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(420, 0.25, 0.5), std(0x4a5059, 0.5, 0.6));
    rail.position.set(200, 0.14, z);
    group.add(rail);
  });

  // Postes de pátio: cabeça quente + sprite
  const poleMat = std(C.steelDark, 0.8, 0.2);
  const headMat = glow(C.warm, 3.2, 0x111111);
  const post = (x: number, z: number, h = 12) => {
    const p = cyl(0.22, 0.3, h, poleMat, 8);
    p.position.set(x, h / 2, z);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2.6), poleMat);
    arm.position.set(x, h - 0.2, z + 1.2);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.6), headMat);
    head.position.set(x, h - 0.45, z + 2.2);
    const s = sprite(C.warm, 9, 0.2);
    s.position.set(x, h - 0.5, z + 2.2);
    group.add(p, arm, head, s);
    lampPoints.push(new THREE.Vector3(x, h, z));
  };
  for (let x = 30; x <= 1120; x += 52) post(x, L.roadFront + 8);
  for (let x = 90; x <= 1120; x += 64) post(x, L.roadMid + 8);
  for (let x = 160; x <= 1100; x += 80) post(x, L.roadBack + 8);
  for (let z = -90; z >= -290; z -= 48) post(118, z);

  // Torres de iluminação do pátio (35 m, quatro cabeças)
  const mast = (x: number, z: number) => {
    const p = cyl(0.5, 0.9, 35, poleMat, 8);
    p.position.set(x, 17.5, z);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), glow(C.warmWhite, 2.4, 0x222222));
    crown.position.set(x, 35, z);
    const s = sprite(C.warmWhite, 22, 0.16);
    s.position.set(x, 35, z);
    group.add(p, crown, s);
  };
  [[122, -70], [636, -70], [122, -214], [636, -214], [870, -80], [1100, -140]].forEach(([x, z]) => mast(x, z));

  // Árvores (portaria e área técnica)
  const treeMat = std(C.tree, 0.95, 0);
  const trunkMat = std(C.trunk, 0.95, 0);
  const tree = (x: number, z: number, r = 3) => {
    const t = cyl(0.25, 0.35, 3, trunkMat, 6);
    t.position.set(x, 1.5, z);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), treeMat);
    c.position.set(x, 3 + r * 0.8, z);
    c.castShadow = true;
    group.add(t, c);
  };
  for (let i = 0; i < 14; i++) tree(560 + ((i * 37) % 170), -262 - ((i * 23) % 36), 2.4 + (i % 3));
  for (let i = 0; i < 7; i++) tree(1104 + (i % 2) * 7, -62 - i * 11, 2.2 + (i % 3) * 0.8);

  // Água: a bacia na frente reflete o mundo (Water.js); a baía atrás reflete o céu
  const water = new Water(new THREE.PlaneGeometry(6000, 2400), {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals: waterNormals(),
    sunDirection: SUN_DIR.clone(),
    sunColor: 0x9a6a48,
    waterColor: 0x071527,
    distortionScale: 3.0,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(600, -1.2, 1200);
  (water.material as THREE.ShaderMaterial).uniforms.size.value = 0.9;
  group.add(water);
  const bay = new THREE.Mesh(new THREE.PlaneGeometry(6000, 2600), new THREE.MeshStandardMaterial({ color: 0x071527, roughness: 0.72, metalness: 0.5 }));
  bay.rotation.x = -Math.PI / 2;
  bay.position.set(600, -1.2, L.apron.z0 - 1300);
  group.add(bay);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1420, 4, 2), std(0x1b2129, 0.9, 0.05));
  wall.position.set(550, -2, L.apron.z0);
  group.add(wall);
  const quayWall = new THREE.Mesh(new THREE.BoxGeometry(1420, 4, 2), std(0x1b2129, 0.9, 0.05));
  quayWall.position.set(550, -1.5, 1);
  group.add(quayWall);

  // Reflexos das luzes do cais na água
  const streakMat = new THREE.MeshBasicMaterial({ map: streakTexture(), color: C.warm, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
  const streaks: THREE.Mesh[] = [];
  const streak = (x: number, len: number, w: number, color?: number, opacity?: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), color || opacity ? streakMat.clone() : streakMat);
    if (color) (m.material as THREE.MeshBasicMaterial).color.setHex(color);
    if (opacity) (m.material as THREE.MeshBasicMaterial).opacity = opacity;
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.PI;
    m.position.set(x, -1.0, len / 2 + 2);
    group.add(m);
    streaks.push(m);
  };
  L.sts.xs.forEach((x) => streak(x, 90, 4, C.warmWhite, 0.06));
  // Clarão do sol na água, à direita
  const sunGlow = sprite(0xe7935f, 700, 0.1);
  sunGlow.position.set(2600, 0, 240);
  group.add(sunGlow);

  const update = (t: number) => {
    const k = 0.05 + Math.sin(t * 0.0013) * 0.01;
    streakMat.opacity = k;
    (water.material as THREE.ShaderMaterial).uniforms.time.value = t * 0.00045;
    for (let i = 0; i < streaks.length; i++) {
      const s = streaks[i];
      s.scale.x = 1 + Math.sin(t * 0.0017 + i * 1.3) * 0.25;
    }
  };

  return { group, lampPoints, update };
};
