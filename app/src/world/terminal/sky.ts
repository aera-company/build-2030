import * as THREE from "three";
import { C, std } from "../materials";
import { L, type Built } from "./layout";

/* ============================================================
   CÉU, SOL, SERRA, CIDADE, VIADUTO · o "atrás" do terminal
   Entardecer: navy no zênite, âmbar no horizonte do lado do sol.
   O domo segue a câmera. A cidade é uma faixa de pontos quentes.
   O viaduto cruza a baía com faróis passando (Asset C).
   ============================================================ */

export const SUN_DIR = new THREE.Vector3(0.62, 0.09, -0.8).normalize();

export const buildSky = (): Built & { dome: THREE.Mesh } => {
  const group = new THREE.Group();
  const uniforms = {
    zenith: { value: new THREE.Color(0x07111f) },
    mid: { value: new THREE.Color(0x182a4a) },
    horizon: { value: new THREE.Color(0x4a4360) },
    sun: { value: new THREE.Color(0xe08a58) },
    sunDir: { value: SUN_DIR.clone() },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(2600, 48, 24),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 zenith, mid, horizon, sun, sunDir;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.1, h));
          col = mix(col, zenith, smoothstep(0.07, 0.4, h));
          vec3 flat_ = normalize(vec3(vDir.x, 0.0, vDir.z));
          vec3 sflat = normalize(vec3(sunDir.x, 0.0, sunDir.z));
          float s = max(dot(flat_, sflat), 0.0);
          float band = (1.0 - smoothstep(-0.02, 0.15, h)) * smoothstep(-0.08, 0.0, h);
          col += sun * pow(s, 5.0) * band * 0.45;
          col += sun * pow(s, 14.0) * band * 0.4;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  group.add(dome);

  // Serra em duas silhuetas
  const ridge = (z: number, hmax: number, color: number, seed: number) => {
    const shape = new THREE.Shape();
    const w = 9000;
    shape.moveTo(-w / 2, -40);
    const n = 80;
    for (let i = 0; i <= n; i++) {
      const x = -w / 2 + (i / n) * w;
      const a = Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 0.37 + seed * 2.1) * 0.35 + Math.sin(i * 2.3 + seed) * 0.15;
      shape.lineTo(x, Math.max(6, (0.55 + a) * hmax));
    }
    shape.lineTo(w / 2, -40);
    shape.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, fog: true }));
    m.position.set(600, 0, z);
    return m;
  };
  group.add(ridge(-1500, 170, 0x0c1829, 1.3), ridge(-2300, 300, 0x111e33, 4.7));

  // Ilhas na baía (Asset A / C)
  const island = (x: number, z: number, sx: number, sy: number, sz: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10), std(0x0e1d22, 0.95, 0));
    m.scale.set(sx, sy, sz);
    m.position.set(x, -6, z);
    return m;
  };
  group.add(island(-480, -560, 220, 40, 150), island(1560, -600, 260, 52, 170), island(-250, -1100, 400, 60, 220));

  // Cidade: faixa de luzes quentes na margem oposta e subindo o morro
  const cityPos: number[] = [];
  const cityCol: number[] = [];
  const warm = new THREE.Color(0xffc48a);
  const white = new THREE.Color(0xe8eef5);
  const tmp = new THREE.Color();
  for (let i = 0; i < 2600; i++) {
    const x = -900 + Math.random() * 3000;
    const y = 1 + Math.pow(Math.random(), 3.2) * 70;
    const z = L.shoreZ - 10 - Math.random() * 220 - y * 2;
    cityPos.push(x, y, z);
    tmp.copy(Math.random() < 0.7 ? warm : white).multiplyScalar(0.6 + Math.random() * 0.9);
    cityCol.push(tmp.r, tmp.g, tmp.b);
  }
  const cityGeo = new THREE.BufferGeometry();
  cityGeo.setAttribute("position", new THREE.Float32BufferAttribute(cityPos, 3));
  cityGeo.setAttribute("color", new THREE.Float32BufferAttribute(cityCol, 3));
  const city = new THREE.Points(cityGeo, new THREE.PointsMaterial({ size: 2.4, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  group.add(city);
  const shoreGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3200, 26),
    new THREE.MeshBasicMaterial({ color: 0xd99a62, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  shoreGlow.position.set(600, 9, L.shoreZ - 30);
  group.add(shoreGlow);
  // quarteirões em silhueta na margem
  const blockMat = std(0x0b141f, 0.95, 0);
  const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), blockMat, 160);
  const bm = new THREE.Matrix4();
  for (let i = 0; i < 160; i++) {
    const w = 18 + Math.random() * 40;
    const h = 8 + Math.pow(Math.random(), 2) * 70;
    const x = -900 + Math.random() * 3000;
    const z = L.shoreZ - 40 - Math.random() * 160;
    bm.makeScale(w, h, w).setPosition(x, h / 2, z);
    blocks.setMatrixAt(i, bm);
  }
  group.add(blocks);

  // Viaduto cruzando a baía, com faróis
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3000, 2.4, 16), std(0x2b333d, 0.9, 0.05));
  deck.position.set(600, 26, L.viaductZ);
  group.add(deck);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(3000, 1.0, 0.5), std(0x3a434e, 0.9, 0.05));
  rail.position.set(600, 27.6, L.viaductZ + 7.8);
  group.add(rail);
  for (let x = -900; x <= 2100; x += 70) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(3.2, 30, 3.2), std(0x252d36, 0.95, 0));
    pier.position.set(x, 11, L.viaductZ);
    group.add(pier);
  }
  const lampPos: number[] = [];
  const lampCol: number[] = [];
  for (let x = -900; x <= 2100; x += 32) {
    lampPos.push(x, 31, L.viaductZ + 7.5);
    lampCol.push(1.0, 0.78, 0.5);
  }
  const lampGeo = new THREE.BufferGeometry();
  lampGeo.setAttribute("position", new THREE.Float32BufferAttribute(lampPos, 3));
  lampGeo.setAttribute("color", new THREE.Float32BufferAttribute(lampCol, 3));
  group.add(new THREE.Points(lampGeo, new THREE.PointsMaterial({ size: 3.6, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));

  const carN = 44;
  const carPos = new Float32Array(carN * 3);
  const carCol: number[] = [];
  const cars: { x: number; dir: number; v: number }[] = [];
  for (let i = 0; i < carN; i++) {
    const dir = i % 2 ? 1 : -1;
    cars.push({ x: -900 + Math.random() * 3000, dir, v: 22 + Math.random() * 10 });
    carCol.push(...(dir > 0 ? [1.0, 0.95, 0.85] : [1.0, 0.25, 0.18]));
  }
  const carGeo = new THREE.BufferGeometry();
  carGeo.setAttribute("position", new THREE.BufferAttribute(carPos, 3));
  carGeo.setAttribute("color", new THREE.Float32BufferAttribute(carCol, 3));
  const carPts = new THREE.Points(carGeo, new THREE.PointsMaterial({ size: 3.4, vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  group.add(carPts);

  const update = (t: number) => {
    for (let i = 0; i < carN; i++) {
      const c = cars[i];
      const x = -900 + ((((c.x + c.dir * c.v * (t / 1000)) + 900) % 3000) + 3000) % 3000;
      carPos[i * 3] = x;
      carPos[i * 3 + 1] = 28.2;
      carPos[i * 3 + 2] = L.viaductZ + (c.dir > 0 ? 3.5 : -3.5);
    }
    carGeo.attributes.position.needsUpdate = true;
  };

  return { group, dome, update };
};

export { C as SKY_C };
