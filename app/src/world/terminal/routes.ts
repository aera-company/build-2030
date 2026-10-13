import * as THREE from "three";
import { EASE } from "@/motion/tokens";
import { seg } from "@/motion/math";
import { C } from "../materials";
import { M, ZONES } from "../moments";
import { L, type Built } from "./layout";

/* ============================================================
   A CAMADA DE SISTEMA · rotas teal no chão que ligam as zonas,
   nós nos pontos das capacidades, pulsos correndo pelas rotas.
   Desenha-se na ordem da travessia (Beat 05). Único uso do teal.
   ============================================================ */

const hdr = (hex: number, k: number) => new THREE.Color(hex).multiplyScalar(k);

const tube = (pts: THREE.Vector3[], radius = 0.45) => {
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.3);
  const geo = new THREE.TubeGeometry(curve, Math.max(40, pts.length * 30), radius, 6, false);
  const count = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: hdr(C.tealLight, 1.5), transparent: true, opacity: 0.85, fog: true }));
  mesh.renderOrder = 2;
  return { mesh, count, curve };
};

const v = (x: number, z: number, y = 0.9) => new THREE.Vector3(x, y, z);

export const buildRoutes = (): Built => {
  const group = new THREE.Group();
  const yF = L.roadFront;
  const yM = L.roadMid;
  const main = tube([v(40, yF), v(230, yF), v(400, yF), v(600, yF), v(760, yF), v(1000, yF), v(1090, yF)], 0.55);
  const branches = [
    { t: tube([v(110, yF), v(110, yM), v(390, yM), v(640, yM), v(640, yF)]), at: [0.1, 0.55] },
    { t: tube([v(760, yF), v(760, -10)]), at: [0.5, 0.75] },
    { t: tube([v(640, yF), v(640, -150), v(640, L.gate.z)]), at: [0.55, 0.85] },
    { t: tube([v(1000, yF), v(1000, -100), v(1040, -112)]), at: [0.75, 1] },
    { t: tube([v(600, yF), v(600, -58)]), at: [0.6, 0.85] },
  ];
  group.add(main.mesh);
  branches.forEach((b) => group.add(b.t.mesh));

  // nós nos pontos das capacidades
  const nodeMat = new THREE.MeshBasicMaterial({ color: hdr(C.tealLight, 1.6), transparent: true, opacity: 0, fog: true });
  const nodes = ZONES.map((z, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4, 0.3, 6, 40), nodeMat.clone());
    ring.rotation.x = Math.PI / 2;
    ring.position.set(z.node[0], 0.9, z.node[1]);
    group.add(ring);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), nodeMat.clone());
    dot.position.set(z.node[0], 1.2, z.node[1]);
    group.add(dot);
    return { ring, dot, at: 0.12 + (i / (ZONES.length - 1)) * 0.8 };
  });

  // pulsos
  const pulseMat = new THREE.MeshBasicMaterial({ color: hdr(C.tealLight, 2.6), transparent: true, opacity: 0, fog: true });
  const pulses = [0, 1, 2, 3, 4].map(() => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 10), pulseMat);
    group.add(m);
    return m;
  });

  const update = (t: number, p: number, sys: number) => {
    const draw = seg(p, M.routesStart, M.routesEnd, EASE.cinematic);
    main.mesh.geometry.setDrawRange(0, Math.floor(draw * main.count));
    branches.forEach((b) => {
      const d = seg(draw, b.at[0], b.at[1], EASE.out);
      b.t.mesh.geometry.setDrawRange(0, Math.floor(d * b.t.count));
    });
    nodes.forEach((n, i) => {
      const on = seg(draw, n.at - 0.08, n.at + 0.04, EASE.out);
      const pulse = 1 + Math.sin(t * 0.0025 + i * 1.1) * 0.12;
      n.ring.scale.setScalar(on * pulse);
      (n.ring.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
      (n.dot.material as THREE.MeshBasicMaterial).opacity = on;
      n.dot.scale.setScalar(0.6 + on * (0.8 + Math.sin(t * 0.004 + i) * 0.25));
    });
    const po = seg(p, M.pulses, M.pulses + 0.04) * sys;
    pulseMat.opacity = po;
    pulses.forEach((m, i) => {
      const u = ((t * 0.00007 + i / 5) % 1 + 1) % 1;
      const uu = Math.min(u, Math.max(0.001, draw - 0.001));
      main.curve.getPointAt(uu, m.position);
      m.position.y = 1.4;
      m.visible = po > 0.01;
    });
  };

  return { group, update };
};
