import * as THREE from "three";
import { EASE } from "@/motion/tokens";
import { clamp, lerp, seg } from "@/motion/math";
import { CLIPS } from "@/lib/media";
import { cameraAt, atmosphereAt } from "./camera-path";
import { M, PARTS, RING_R, ATTRS, BRANCH_A, BRANCH_B, type Part } from "./moments";

/* ============================================================
   O SISTEMA GAVEA · instalação arquitetônica (greybox)
   Um núcleo. Onze partes ao redor (quatro janelas para o negócio
   real, sete partes geométricas), cada uma com orientação, raio,
   ritmo e luz próprios. Uma lâmina de luz atravessa o sistema;
   o que ela toca se orienta, liga-se ao núcleo e passa a bater
   no mesmo ritmo. Uma trajetória atravessa o núcleo e bifurca.
   Materiais: grafite/aço. Informação: branco. Sinal: teal.
   ============================================================ */

const NAVY_DEEP = 0x050f1a;
const GRAPHITE = 0x1d2f3e;
const STEEL = 0x2a3f52;
const TEAL = 0x1b8fb5;
const TEAL_LIGHT = 0x7fc6dc;
const COOL = 0x7f9bb3;

export type Anchor = { id: string; x: number; y: number; visible: number; occluded: boolean };

type PartState = {
  def: Part;
  group: THREE.Group;
  edges: THREE.LineBasicMaterial;
  light: THREE.PointLight;
  link: { mesh: THREE.Mesh; count: number };
  video?: HTMLVideoElement;
  anchorLocal: THREE.Vector3;
  align: number;
};

type NodeState = { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; t: number; id: string };

const solid = (color = GRAPHITE, roughness = 0.86, metalness = 0.18) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const edgeMat = (opacity = 0.12) =>
  new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity });

const withEdges = (mesh: THREE.Mesh, mat: THREE.LineBasicMaterial) => {
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), mat));
  return mesh;
};

const tube = (pts: THREE.Vector3[], radius = 0.12, color = TEAL_LIGHT) => {
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
  const geo = new THREE.TubeGeometry(curve, Math.max(24, pts.length * 40), radius, 6, false);
  const count = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  return { mesh, count, curve };
};

export class World {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  private fog: THREE.FogExp2;
  private key: THREE.DirectionalLight;
  private fill: THREE.DirectionalLight;
  private ambient: THREE.AmbientLight;
  private core!: THREE.Group;
  private coreEdges!: THREE.LineBasicMaterial;
  private coreLight!: THREE.PointLight;
  private parts: PartState[] = [];
  private sweep!: THREE.Group;
  private sweepMats: THREE.MeshBasicMaterial[] = [];
  private traj!: { mesh: THREE.Mesh; count: number; curve: THREE.CatmullRomCurve3 };
  private branches: { mesh: THREE.Mesh; count: number; curve: THREE.CatmullRomCurve3; nodes: NodeState[]; end: THREE.Vector3; draw: number; full: number }[] = [];
  private head: THREE.Mesh;
  private headLight: THREE.PointLight;
  private vessel!: THREE.Group;
  private occluders: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private camState = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  private lastP = 0;
  private reduced = false;
  readyFrames = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(NAVY_DEEP, 1);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 1400);
    this.fog = new THREE.FogExp2(NAVY_DEEP, 0.03);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(NAVY_DEEP);

    this.ambient = new THREE.AmbientLight(0x7f9db5, 0.12);
    this.scene.add(this.ambient);
    this.scene.add(new THREE.HemisphereLight(0x2b5473, 0x03080f, 0.95));

    this.key = new THREE.DirectionalLight(0xd6e6ee, 0.25);
    this.key.position.set(-70, 90, 50);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    const sc = this.key.shadow.camera as THREE.OrthographicCamera;
    sc.left = -150; sc.right = 150; sc.top = 150; sc.bottom = -150; sc.near = 10; sc.far = 400;
    this.key.shadow.bias = -0.0008;
    this.scene.add(this.key, this.key.target);

    this.fill = new THREE.DirectionalLight(TEAL, 0);
    this.fill.position.set(80, 20, -60);
    this.scene.add(this.fill);

    this.buildGround();
    this.buildVessel();
    this.buildCore();
    this.buildParts();
    this.buildSweep();
    this.buildTrajectory();

    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf3f1ec }));
    this.headLight = new THREE.PointLight(TEAL, 0, 46, 1.6);
    this.head.add(this.headLight);
    this.head.visible = false;
    this.scene.add(this.head);

    this.resize();
  }

  /* ---------------- construção ---------------- */

  private buildGround() {
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), solid(0x12263a, 0.95, 0.08));
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, 0, 20);
    deck.receiveShadow = true;
    this.scene.add(deck);

    const grid = new THREE.GridHelper(400, 40, 0x27405a, 0x1a2f42);
    grid.position.set(0, 0.03, 20);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    this.scene.add(grid);

    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(400, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: STEEL, emissive: TEAL, emissiveIntensity: 0.25, roughness: 0.6 }),
    );
    edge.position.set(0, 0.25, -130);
    this.scene.add(edge);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(1600, 900), solid(0x061420, 0.32, 0.65));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.7, -580);
    this.scene.add(water);

    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 2.4),
      new THREE.MeshBasicMaterial({ color: 0x8fc1d3, fog: false, transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
    );
    horizon.position.set(0, 1.2, -980);
    this.scene.add(horizon);
  }

  private buildVessel() {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(-60, -8);
    shape.lineTo(42, -8);
    shape.quadraticCurveTo(66, -4, 72, 0);
    shape.quadraticCurveTo(66, 4, 42, 8);
    shape.lineTo(-60, 8);
    shape.quadraticCurveTo(-66, 0, -60, -8);
    const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 7, bevelEnabled: false }), solid(0x1f3344, 0.75, 0.35));
    hull.rotation.x = -Math.PI / 2;
    hull.position.y = -0.5;
    hull.castShadow = true;
    g.add(withEdges(hull, edgeMat(0.28)));
    const house = new THREE.Mesh(new THREE.BoxGeometry(14, 9, 11), solid(STEEL));
    house.position.set(-44, 11, 0);
    g.add(withEdges(house, edgeMat(0.2)));
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 16, 8), solid(STEEL));
    mast.position.set(-44, 23, 0);
    g.add(mast);
    g.position.set(-20, 0, -160);
    g.rotation.y = 0.1;
    this.vessel = g;
    this.scene.add(g);
    this.occluders.push(hull, house);
  }

  private buildCore() {
    const g = new THREE.Group();
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 1.0, 64), solid(0x1a2c3b, 0.9, 0.1));
    platform.position.y = 0.5;
    platform.receiveShadow = true;
    platform.castShadow = true;
    g.add(platform);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(16, 0.08, 6, 96), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.25 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.02;
    g.add(rim);
    this.coreEdges = edgeMat(0.1);
    const block = new THREE.Mesh(new THREE.BoxGeometry(9, 14, 9), solid(0x16283a, 0.8, 0.25));
    block.position.y = 8;
    block.rotation.y = 0.35;
    block.castShadow = true;
    g.add(withEdges(block, this.coreEdges));
    this.coreLight = new THREE.PointLight(TEAL, 0, 60, 1.5);
    this.coreLight.position.set(0, 17, 0);
    g.add(this.coreLight);
    this.core = g;
    this.scene.add(g);
    this.occluders.push(block, platform);
  }

  private buildPartGeometry(def: Part, group: THREE.Group, edges: THREE.LineBasicMaterial): THREE.Object3D[] {
    const meshes: THREE.Object3D[] = [];
    const add = (m: THREE.Mesh) => {
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(withEdges(m, edges));
      meshes.push(m);
    };
    switch (def.kind) {
      case "window": {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(14.6, 8.5, 0.4), solid(STEEL, 0.7, 0.3));
        slab.position.y = 6;
        add(slab);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 1.2), solid(GRAPHITE));
        foot.position.y = 0.9;
        add(foot);
        break;
      }
      case "gantry": {
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 12, 0.7), solid(STEEL));
        legL.position.set(-8, 6, 0);
        const legR = legL.clone(); legR.position.set(8, 6, 0);
        const legL2 = legL.clone(); legL2.position.set(-8, 6, 5);
        const legR2 = legL.clone(); legR2.position.set(8, 6, 5);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(19, 0.8, 0.8), solid(STEEL));
        beam.position.set(0, 12, 0);
        const beam2 = beam.clone(); beam2.position.set(0, 12, 5);
        const diag = new THREE.Mesh(new THREE.BoxGeometry(0.45, 14, 0.45), solid(STEEL));
        diag.position.set(-4, 6, 0); diag.rotation.z = -0.72;
        const load = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 4), solid(GRAPHITE));
        load.position.set(2, 7.5, 2.5);
        [legL, legR, legL2, legR2, beam, beam2, diag, load].forEach(add);
        break;
      }
      case "panels": {
        for (let i = 0; i < 3; i++) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8 - i * 0.8, 5), solid(i === 1 ? STEEL : GRAPHITE));
          m.position.set(-3.5 + i * 3.5, (8 - i * 0.8) / 2, i * 0.6);
          m.rotation.y = (i - 1) * 0.18;
          add(m);
        }
        break;
      }
      case "pillars": {
        for (let i = 0; i < 5; i++) {
          const h = 6 + (i % 2) * 1.4;
          const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.2), solid(i % 2 ? STEEL : GRAPHITE));
          m.position.set(-5 + i * 2.5, h / 2, (i % 2) * 1.5);
          add(m);
        }
        break;
      }
      case "blocks": {
        const sizes: [number, number, number][] = [[6, 4, 5], [4, 6, 4], [5, 3, 6]];
        sizes.forEach((s, i) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(...s), solid(i === 1 ? STEEL : GRAPHITE));
          m.position.set(-8 + i * 8, s[1] / 2, (i - 1) * 2);
          m.rotation.y = (i - 1) * 0.25;
          add(m);
        });
        break;
      }
      case "slabs": {
        for (let i = 0; i < 5; i++) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 6), solid(i % 2 ? STEEL : GRAPHITE));
          m.position.set((i % 2) * 1.2 - 0.6, 0.3 + i * 1.5, (i % 3) * 0.8);
          m.rotation.y = (i % 2 ? 1 : -1) * 0.08 * i;
          add(m);
        }
        break;
      }
      case "nodes": {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 9; i++) {
          const a = i * 2.4;
          const r = 1.5 + (i % 4) * 1.6;
          const h = 3 + ((i * 7) % 8);
          const p = new THREE.Vector3(Math.cos(a) * r, h, Math.sin(a) * r);
          pts.push(p);
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, h, 6), solid(STEEL));
          stem.position.set(p.x, h / 2, p.z);
          group.add(stem);
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), new THREE.MeshStandardMaterial({ color: STEEL, emissive: TEAL, emissiveIntensity: 0.25, roughness: 0.4 }));
          node.position.copy(p);
          group.add(node);
          meshes.push(node);
        }
        const linkPos: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i * 3 + 2) % pts.length];
          linkPos.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
        group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(linkPos, 3)), edges));
        break;
      }
      case "ring": {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.08, 6, 64), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.4 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 3.5;
        group.add(ring);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), new THREE.MeshStandardMaterial({ color: STEEL, emissive: TEAL, emissiveIntensity: 0.3, roughness: 0.4 }));
          node.position.set(Math.cos(a) * 5.5, 3.5, Math.sin(a) * 5.5);
          group.add(node);
          meshes.push(node);
        }
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 3.5, 8), solid(STEEL));
        post.position.y = 1.75;
        add(post);
        break;
      }
    }
    return meshes;
  }

  private buildParts() {
    const coreTop = new THREE.Vector3(0, 14, 0);
    PARTS.forEach((def) => {
      const group = new THREE.Group();
      const a = (def.ang * Math.PI) / 180;
      group.position.set(Math.cos(a) * def.r, 0, Math.sin(a) * def.r);
      const edges = edgeMat(0.12);
      const meshes = this.buildPartGeometry(def, group, edges);

      let video: HTMLVideoElement | undefined;
      if (def.kind === "window" && def.clip) {
        video = document.createElement("video");
        video.src = CLIPS[def.clip].src;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        const tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace;
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(14, 7.9), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, toneMapped: false }));
        plane.position.set(0, 6, 0.26);
        group.add(plane);
        const shade = new THREE.Mesh(new THREE.PlaneGeometry(14, 7.9), new THREE.MeshBasicMaterial({ color: NAVY_DEEP, transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
        shade.position.set(0, 6, 0.3);
        group.add(shade);
      }

      const light = new THREE.PointLight(COOL, 0.5, 30, 1.8);
      light.position.set(0, def.anchorY - 2, 0);
      group.add(light);

      const anchorLocal = new THREE.Vector3(0, def.anchorY, 0);
      const linkEnd = new THREE.Vector3(Math.cos(a) * RING_R, def.anchorY - 3, Math.sin(a) * RING_R);
      const mid = coreTop.clone().lerp(linkEnd, 0.5);
      mid.y = def.anchorY + 3;
      const link = tube([coreTop.clone(), mid, linkEnd], 0.07, TEAL);
      this.scene.add(link.mesh);

      this.scene.add(group);
      this.occluders.push(...meshes);
      this.parts.push({ def, group, edges, light, link: { mesh: link.mesh, count: link.count }, video, anchorLocal, align: 0 });
    });
  }

  private buildSweep() {
    const g = new THREE.Group();
    const wide = new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const line = new THREE.MeshBasicMaterial({ color: TEAL_LIGHT, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(280, 60), wide);
    sheet.position.y = 30;
    const core = new THREE.Mesh(new THREE.PlaneGeometry(280, 1.2), line);
    core.position.y = 2.2;
    g.add(sheet, core);
    g.rotation.y = Math.PI / 2;
    g.position.x = 150;
    this.sweepMats = [wide, line];
    this.sweep = g;
    this.scene.add(g);
  }

  private buildTrajectory() {
    // AERA / DIRECTION: a trajetória entra com a lâmina e passa POR Tecnologia,
    // Comercial, Agência, Time interno e Parceiros antes de chegar ao núcleo.
    const main = tube(
      [
        new THREE.Vector3(150, 1.6, 24),
        new THREE.Vector3(60, 1.6, 36),
        new THREE.Vector3(32, 1.6, 52),
        new THREE.Vector3(4, 1.6, 58),
        new THREE.Vector3(-42, 1.6, 42),
        new THREE.Vector3(-54, 1.6, -26),
        new THREE.Vector3(-20, 1.6, -8),
        new THREE.Vector3(0, 1.6, 0),
      ],
      0.14,
    );
    this.traj = main;
    this.scene.add(main.mesh);

    const mkBranch = (pts: THREE.Vector3[], names: readonly string[], prefix: string, draw: number, full: number) => {
      const b = tube(pts, 0.14);
      this.scene.add(b.mesh);
      const nodes: NodeState[] = [];
      names.forEach((name, i) => {
        const t = 0.22 + (i / (names.length - 1)) * 0.74;
        const pos = b.curve.getPointAt(t);
        const mat = new THREE.MeshStandardMaterial({ color: STEEL, emissive: TEAL, emissiveIntensity: 0, roughness: 0.4 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), mat);
        mesh.position.copy(pos).setY(pos.y + 3.2);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6), solid(STEEL));
        stem.position.copy(pos).setY(pos.y + 1.6);
        this.scene.add(mesh, stem);
        nodes.push({ mesh, mat, pos: mesh.position.clone(), t, id: `${prefix}-${i}` });
      });
      this.branches.push({ mesh: b.mesh, count: b.count, curve: b.curve, nodes, end: pts[pts.length - 1].clone(), draw, full });
    };
    mkBranch(
      [new THREE.Vector3(0, 1.6, 0), new THREE.Vector3(-30, 1.6, -4), new THREE.Vector3(-56, 1.6, -28), new THREE.Vector3(-84, 1.6, -56)],
      BRANCH_A.nodes, "a", M.branchA.draw, M.branchA.full,
    );
    mkBranch(
      [new THREE.Vector3(0, 1.6, 0), new THREE.Vector3(30, 1.6, -6), new THREE.Vector3(56, 1.6, -30), new THREE.Vector3(84, 1.6, -58)],
      BRANCH_B.nodes, "b", M.branchB.draw, M.branchB.full,
    );
  }

  /* ---------------- ciclo ---------------- */

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(p: number, t: number) {
    this.lastP = p;
    const tt = this.reduced ? 0 : t;

    cameraAt(p, tt, this.camState);
    this.camera.position.copy(this.camState.pos);
    this.camera.lookAt(this.camState.look);

    const atm = atmosphereAt(p);
    this.fog.density = atm.fog;
    this.key.intensity = atm.key;
    this.fill.intensity = atm.fill;
    this.ambient.intensity = atm.ambient;

    // 04 · a lâmina atravessa o sistema
    const sw = seg(p, M.sweepStart, M.sweepEnd, EASE.linear);
    const sweepX = lerp(150, -150, sw);
    this.sweep.position.x = sweepX;
    const swOn = seg(p, M.sweepStart, M.sweepStart + 0.02) * (1 - seg(p, M.sweepEnd - 0.02, M.sweepEnd));
    this.sweepMats[0].opacity = 0.07 * swOn;
    this.sweepMats[1].opacity = 0.75 * swOn;

    // núcleo acende quando a lâmina o atravessa
    const coreLit = seg(10 - sweepX, 0, 20, EASE.out);
    this.coreEdges.opacity = 0.1 + coreLit * 0.55;
    this.coreLight.intensity = coreLit * 4.2;
    this.core.rotation.y = Math.sin(tt * 0.00012) * 0.02;

    // 02–05 · partes: descoberta, movimento próprio, alinhamento
    const sharedBob = Math.sin(tt * 0.0011) * 0.25;
    this.parts.forEach((ps) => {
      const d = ps.def;
      const found = seg(p, d.at - 0.02, d.at + M.partRamp, EASE.out);
      const a = (d.ang * Math.PI) / 180;
      const px0 = Math.cos(a) * d.r;
      const align = seg(px0 + 12 - sweepX, 0, 24, EASE.cinematic);
      ps.align = align;

      const ownAng = a + (1 - align) * Math.sin(tt * 0.00019 + d.phase) * 0.035;
      const r = lerp(d.r, RING_R, align);
      ps.group.position.set(Math.cos(ownAng) * r, 0, Math.sin(ownAng) * r);
      const ownBob = Math.sin(tt * (0.0007 + (d.phase % 1) * 0.0004) + d.phase) * 0.4;
      ps.group.position.y = lerp(ownBob, sharedBob, align);
      const radial = Math.atan2(ps.group.position.x, ps.group.position.z);
      const ownYaw = radial + d.yaw + (1 - align) * Math.sin(tt * 0.0004 + d.phase) * 0.12;
      ps.group.rotation.y = lerp(ownYaw, radial, align);
      ps.group.rotation.z = (1 - align) * Math.sin(tt * 0.0005 + d.phase) * 0.025;

      ps.edges.opacity = 0.05 + found * 0.1 + align * 0.42;
      ps.light.intensity = found * (0.6 + align * 1.6);
      ps.light.color.setHex(align > 0.5 ? TEAL : COOL);
      ps.link.mesh.geometry.setDrawRange(0, Math.floor(seg(align, 0.35, 1) * ps.link.count));

      if (ps.video) {
        const play = found > 0.05 && !this.reduced;
        if (play && ps.video.paused) ps.video.play().catch(() => {});
        if (!play && !ps.video.paused) ps.video.pause();
      }
      ps.group.visible = found > 0.001 || p > d.at;
    });

    // 05 · trajetória atravessa o núcleo
    const td = seg(p, M.trajIn, M.trajFull, EASE.cinematic);
    this.traj.mesh.geometry.setDrawRange(0, Math.floor(td * this.traj.count));

    // 07 · ramos e nós
    this.branches.forEach((b) => {
      const bd = seg(p, b.draw, b.full, EASE.cinematic);
      b.mesh.geometry.setDrawRange(0, Math.floor(bd * b.count));
      b.nodes.forEach((n) => {
        const on = seg(bd, n.t - 0.03, n.t + 0.03, EASE.out);
        n.mat.emissiveIntensity = on * 0.9;
        n.mesh.scale.setScalar(0.4 + on * 0.6);
      });
    });

    // ponto-guia: percorre a trajetória e depois os ramos, em pulso
    const pulseOn = seg(p, M.trajIn + 0.02, M.trajIn + 0.06);
    if (pulseOn > 0) {
      let pt: THREE.Vector3;
      if (td < 0.999) pt = this.traj.curve.getPointAt(clamp(td, 0.001, 0.999));
      else {
        const cyc = (tt * 0.00009) % 2;
        const b = this.branches[cyc < 1 ? 0 : 1];
        const bd = seg(p, b.draw, b.full, EASE.cinematic);
        pt = bd > 0.01 ? b.curve.getPointAt(clamp((cyc % 1) * bd, 0.001, 0.999)) : this.traj.curve.getPointAt(0.999);
      }
      this.head.position.copy(pt);
      this.head.visible = true;
      this.headLight.intensity = 2.2 * pulseOn;
    } else this.head.visible = false;

    this.vessel.position.y = Math.sin(tt * 0.0004) * 0.25;
    this.vessel.rotation.z = Math.sin(tt * 0.0003) * 0.006;

    this.renderer.render(this.scene, this.camera);
    this.readyFrames++;
  }

  /** Âncoras projetadas para as anotações HTML. */
  anchors(vw: number, vh: number): Anchor[] {
    const out: Anchor[] = [];
    const camPos = this.camera.position;
    const project = (id: string, world: THREE.Vector3, checkOcclusion: boolean) => {
      const v = world.clone().project(this.camera);
      const inFront = v.z < 1;
      const x = ((v.x + 1) / 2) * vw;
      const y = ((1 - v.y) / 2) * vh;
      let occluded = false;
      if (checkOcclusion && inFront) {
        const dir = world.clone().sub(camPos);
        const dist = dir.length();
        this.raycaster.set(camPos, dir.normalize());
        this.raycaster.far = dist - 1.2;
        occluded = this.raycaster.intersectObjects(this.occluders, false).length > 0;
      }
      const margin = 40;
      const onScreen = inFront && x > -margin && x < vw + margin && y > -margin && y < vh + margin;
      out.push({ id, x, y, visible: onScreen ? 1 : 0, occluded });
    };
    this.parts.forEach((ps) => {
      const w = ps.anchorLocal.clone();
      ps.group.localToWorld(w);
      project(ps.def.id, w, true);
    });
    project("core", new THREE.Vector3(0, 17.5, 0), false);
    ATTRS.forEach((_, i) => {
      const a = Math.PI / 4 + i * (Math.PI / 2);
      project(`attr-${i}`, new THREE.Vector3(Math.cos(a) * 24, 2.6, Math.sin(a) * 24), false);
    });
    project("aera", this.traj.curve.getPointAt(0.62).clone().setY(2.4), false);
    project("headline", new THREE.Vector3(-34, 6, 28), false);
    this.branches.forEach((b, i) => {
      project(i === 0 ? "branch-a" : "branch-b", b.end.clone().setY(6), false);
      b.nodes.forEach((n) => project(n.id, n.pos.clone().setY(n.pos.y + 1.2), false));
    });
    return out;
  }

  debug() {
    const c = this.camera.position;
    return {
      P: this.lastP.toFixed(3),
      cam: `${c.x.toFixed(0)}, ${c.y.toFixed(0)}, ${c.z.toFixed(0)}`,
      fog: this.fog.density.toFixed(4),
      aligned: this.parts.filter((x) => x.align > 0.5).length,
    };
  }

  dispose() {
    this.parts.forEach((ps) => {
      if (ps.video) {
        ps.video.pause();
        ps.video.src = "";
      }
    });
    this.renderer.dispose();
  }
}
