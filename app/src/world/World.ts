import * as THREE from "three";
import { EASE } from "@/motion/tokens";
import { clamp, lerp, seg, pulse } from "@/motion/math";
import { CLIPS } from "@/lib/media";
import { cameraAt, atmosphereAt } from "./camera-path";
import { M, ZONES, SHARED_ROT_Y, type ZoneId } from "./moments";

/* ============================================================
   O SISTEMA GAVEA · greybox espacial
   Modelo de arquitetura, não digital twin: um cais (deck), o mar
   e o horizonte, um casco abstrato, quatro áreas (painéis, blocos
   de terminal, pórtico, nós) com orientação e ritmo próprios, e
   uma trajetória de luz que as conecta. Depois de DIRECTION, tudo
   compartilha um vetor e um ritmo.
   Materiais: grafite/aço. Informação: branco. Sinal: teal.
   ============================================================ */

const NAVY_DEEP = 0x050f1a;
const GRAPHITE = 0x1d2f3e;
const STEEL = 0x2a3f52;
const TEAL = 0x1b8fb5;
const TEAL_LIGHT = 0x7fc6dc;

export type Anchor = {
  id: string;
  x: number;
  y: number;
  /** 0 = fora da tela / atrás da câmera */
  visible: number;
  occluded: boolean;
};

type Zone = {
  id: ZoneId;
  group: THREE.Group;
  baseRotY: number;
  phase: number;
  edges: THREE.LineBasicMaterial;
  light: THREE.PointLight;
  anchor: THREE.Vector3;
  meshes: THREE.Object3D[];
};

const edgeMat = () =>
  new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.14 });

const solid = (color = GRAPHITE, roughness = 0.86, metalness = 0.18) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const withEdges = (mesh: THREE.Mesh, mat: THREE.LineBasicMaterial) => {
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), mat);
  mesh.add(e);
  return mesh;
};

export class World {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  private fog: THREE.FogExp2;
  private key: THREE.DirectionalLight;
  private fill: THREE.DirectionalLight;
  private ambient: THREE.AmbientLight;
  private zones: Zone[] = [];
  private trajectory!: THREE.Mesh;
  private trajIndexCount = 0;
  private trajCurve!: THREE.CatmullRomCurve3;
  private head: THREE.Mesh;
  private headLight: THREE.PointLight;
  private branches: { mesh: THREE.Mesh; count: number; end: THREE.Vector3 }[] = [];
  private panels: { mat: THREE.MeshBasicMaterial; video: HTMLVideoElement; a: number; b: number; c: number; d: number }[] = [];
  private occluders: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private camState = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  private vessel!: THREE.Group;
  private tmp = new THREE.Vector3();
  private lastP = 0;
  private reduced = false;

  constructor(canvas: HTMLCanvasElement) {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(NAVY_DEEP, 1);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 1400);
    this.fog = new THREE.FogExp2(NAVY_DEEP, 0.034);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(NAVY_DEEP);

    this.ambient = new THREE.AmbientLight(0x7f9db5, 0.06);
    this.scene.add(this.ambient);
    const hemi = new THREE.HemisphereLight(0x2b5473, 0x03080f, 0.95);
    this.scene.add(hemi);

    this.key = new THREE.DirectionalLight(0xd6e6ee, 0.12);
    this.key.position.set(-70, 90, 50);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    const sc = this.key.shadow.camera as THREE.OrthographicCamera;
    sc.left = -140; sc.right = 140; sc.top = 140; sc.bottom = -140; sc.near = 10; sc.far = 400;
    this.key.shadow.bias = -0.0008;
    this.scene.add(this.key);
    this.scene.add(this.key.target);

    this.fill = new THREE.DirectionalLight(TEAL, 0);
    this.fill.position.set(80, 20, -60);
    this.scene.add(this.fill);

    this.buildGround();
    this.buildVessel();
    this.buildZones();
    this.buildTrajectory();
    this.buildPanels();

    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xf3f1ec }),
    );
    this.headLight = new THREE.PointLight(TEAL, 0, 46, 1.6);
    this.head.add(this.headLight);
    this.head.visible = false;
    this.scene.add(this.head);

    this.resize();
  }

  /* ---------------- construção ---------------- */

  private buildGround() {
    // cais / deck: o modelo de arquitetura
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(380, 280), solid(0x12263a, 0.95, 0.08));
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, 0, 30);
    deck.receiveShadow = true;
    this.scene.add(deck);

    const grid = new THREE.GridHelper(380, 38, 0x27405a, 0x1a2f42);
    grid.position.set(0, 0.03, 30);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    this.scene.add(grid);

    // borda do cais: uma aresta de luz muito baixa
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(380, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: STEEL, emissive: TEAL, emissiveIntensity: 0.25, roughness: 0.6 }),
    );
    edge.position.set(0, 0.25, -110);
    this.scene.add(edge);

    // mar
    const water = new THREE.Mesh(new THREE.PlaneGeometry(1600, 900), solid(0x061420, 0.32, 0.65));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.7, -560);
    this.scene.add(water);

    // horizonte: uma linha de luz fora da névoa
    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 2.4),
      new THREE.MeshBasicMaterial({ color: 0x8fc1d3, fog: false, transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
    );
    horizon.position.set(0, 1.2, -980);
    this.scene.add(horizon);
  }

  private buildVessel() {
    // casco abstrato: silhueta, não navio
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(-60, -8);
    shape.lineTo(42, -8);
    shape.quadraticCurveTo(66, -4, 72, 0);
    shape.quadraticCurveTo(66, 4, 42, 8);
    shape.lineTo(-60, 8);
    shape.quadraticCurveTo(-66, 0, -60, -8);
    const hull = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 7, bevelEnabled: false }),
      solid(0x1f3344, 0.75, 0.35),
    );
    hull.rotation.x = -Math.PI / 2;
    hull.position.y = -0.5;
    hull.castShadow = true;
    const hullEdges = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.28 });
    g.add(withEdges(hull, hullEdges));
    const house = new THREE.Mesh(new THREE.BoxGeometry(14, 9, 11), solid(STEEL));
    house.position.set(-44, 11, 0);
    house.castShadow = true;
    g.add(withEdges(house, edgeMat()));
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 16, 8), solid(STEEL));
    mast.position.set(-44, 23, 0);
    g.add(mast);
    const crane = new THREE.Mesh(new THREE.BoxGeometry(0.8, 26, 0.8), solid(STEEL));
    crane.position.set(10, 13, 0);
    crane.rotation.z = -0.35;
    g.add(crane);
    g.position.set(-14, 0, -106);
    g.rotation.y = 0.12;
    this.vessel = g;
    this.scene.add(g);
    this.occluders.push(hull, house);
  }

  private buildZones() {
    ZONES.forEach((z) => {
      const group = new THREE.Group();
      group.position.set(...z.pos);
      group.rotation.y = z.rotY;
      const edges = edgeMat();
      const meshes: THREE.Object3D[] = [];
      const add = (m: THREE.Mesh) => {
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(withEdges(m, edges));
        meshes.push(m);
      };

      if (z.id === "marketing") {
        // painéis em leque: comunicação, marca, campanhas
        for (let i = 0; i < 5; i++) {
          const h = 8.5 + (i % 3) * 1.6;
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 7), solid(i % 2 ? STEEL : GRAPHITE));
          const a = -0.9 + i * 0.45;
          m.position.set(Math.cos(a) * 7.5, h / 2, Math.sin(a) * 7.5);
          m.rotation.y = -a + 0.3;
          add(m);
        }
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 16), solid(GRAPHITE));
        plinth.position.set(0, 0.3, 0);
        add(plinth);
      } else if (z.id === "comercial") {
        // blocos de terminal: volumes, relações, mercado
        const sizes: [number, number, number][] = [
          [7, 3, 6], [5, 6, 5], [8, 2.2, 7], [4, 7.5, 4], [6, 4, 6], [5, 2.6, 8], [3.5, 5, 3.5], [7, 3.2, 5], [4.5, 6.4, 6],
        ];
        sizes.forEach((s, i) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(...s), solid(i % 3 === 0 ? STEEL : GRAPHITE));
          const col = i % 3;
          const row = Math.floor(i / 3);
          m.position.set(-9 + col * 9, s[1] / 2, -9 + row * 9);
          m.rotation.y = (i % 2 ? 0.12 : -0.08) * (1 + (i % 4));
          add(m);
        });
      } else if (z.id === "tecnologia") {
        // pórtico: estrutura, método, processo
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 15, 0.8), solid(STEEL));
        legL.position.set(-11, 7.5, 0);
        const legR = legL.clone();
        legR.position.set(11, 7.5, 0);
        const legL2 = legL.clone(); legL2.position.set(-11, 7.5, 7);
        const legR2 = legL.clone(); legR2.position.set(11, 7.5, 7);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 0.9, 0.9), solid(STEEL));
        beam.position.set(0, 15, 0);
        const beam2 = beam.clone(); beam2.position.set(0, 15, 7);
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 7.7), solid(STEEL));
        tie.position.set(-11, 15, 3.5);
        const tie2 = tie.clone(); tie2.position.set(11, 15, 3.5);
        const diag = new THREE.Mesh(new THREE.BoxGeometry(0.5, 17, 0.5), solid(STEEL));
        diag.position.set(-5, 7.5, 0); diag.rotation.z = -0.78;
        const diag2 = diag.clone(); diag2.position.set(5, 7.5, 7); diag2.rotation.z = 0.78;
        const load = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), solid(GRAPHITE));
        load.position.set(2, 9, 3.5);
        [legL, legR, legL2, legR2, beam, beam2, tie, tie2, diag, diag2, load].forEach(add);
      } else {
        // nós: conhecimento, dados, inteligência
        const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.08, 6, 64), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.35 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        group.add(ring);
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 13; i++) {
          const a = i * 2.4;
          const r = 2 + (i % 5) * 1.7;
          const h = 3 + ((i * 7) % 9);
          const p = new THREE.Vector3(Math.cos(a) * r, h, Math.sin(a) * r);
          pts.push(p);
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h, 6), solid(STEEL));
          stem.position.set(p.x, h / 2, p.z);
          group.add(stem);
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), new THREE.MeshStandardMaterial({ color: STEEL, emissive: TEAL, emissiveIntensity: 0.2, roughness: 0.4 }));
          node.position.copy(p);
          node.castShadow = true;
          group.add(node);
          meshes.push(node);
        }
        const linkPos: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i * 3 + 2) % pts.length];
          linkPos.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
        const links = new THREE.LineSegments(
          new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(linkPos, 3)),
          edges,
        );
        group.add(links);
      }

      const light = new THREE.PointLight(TEAL, 0, 34, 1.8);
      light.position.set(0, z.anchorY - 2, 0);
      group.add(light);

      this.scene.add(group);
      this.occluders.push(...meshes);
      this.zones.push({
        id: z.id,
        group,
        baseRotY: z.rotY,
        phase: z.phase,
        edges,
        light,
        anchor: new THREE.Vector3(z.pos[0], z.anchorY, z.pos[2]),
        meshes,
      });
    });
  }

  private buildTrajectory() {
    const z = (id: ZoneId) => ZONES.find((x) => x.id === id)!.pos;
    const [m, c, t, i] = [z("marketing"), z("comercial"), z("tecnologia"), z("inteligencia")];
    const pts = [
      new THREE.Vector3(-82, 1.0, 46),
      new THREE.Vector3(m[0], 1.0, m[2] + 1),
      new THREE.Vector3(-6, 1.0, 22),
      new THREE.Vector3(c[0], 1.0, c[2] + 2),
      new THREE.Vector3(10, 1.0, -10),
      new THREE.Vector3(t[0], 1.0, t[2] + 4),
      new THREE.Vector3(16, 1.0, -40),
      new THREE.Vector3(i[0], 1.0, i[2]),
      new THREE.Vector3(74, 1.0, -62),
    ];
    this.trajCurve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
    const geo = new THREE.TubeGeometry(this.trajCurve, 480, 0.14, 6, false);
    this.trajIndexCount = geo.index ? geo.index.count : 0;
    geo.setDrawRange(0, 0);
    this.trajectory = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: TEAL_LIGHT, transparent: true, opacity: 0.9 }));
    this.scene.add(this.trajectory);

    // bifurcação: Marketing Direction (sobe), AI & Intelligence (segue pelo mar)
    const end = pts[pts.length - 1];
    const mk: [THREE.Vector3, THREE.Vector3] = [end.clone(), new THREE.Vector3(102, 15, -86)];
    const ai: [THREE.Vector3, THREE.Vector3] = [end.clone(), new THREE.Vector3(100, 1.0, -44)];
    [mk, ai].forEach(([a, b]) => {
      const mid = a.clone().lerp(b, 0.5);
      mid.y += 2;
      const curve = new THREE.CatmullRomCurve3([a, mid, b], false, "centripetal");
      const g = new THREE.TubeGeometry(curve, 80, 0.14, 6, false);
      const count = g.index ? g.index.count : 0;
      g.setDrawRange(0, 0);
      const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: TEAL_LIGHT, transparent: true, opacity: 0.9 }));
      this.scene.add(mesh);
      this.branches.push({ mesh, count, end: b });
    });
  }

  private buildPanels() {
    // prova física: superfícies do modelo que, por um instante, mostram operação real
    const make = (src: string, pos: [number, number, number], rotY: number, a: number, b: number, c: number, d: number) => {
      const video = document.createElement("video");
      video.src = src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      const tex = new THREE.VideoTexture(video);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(12, 6.75), mat);
      const slab = new THREE.Mesh(new THREE.BoxGeometry(12.5, 7.25, 0.4), solid(STEEL, 0.7, 0.3));
      slab.castShadow = true;
      const g = new THREE.Group();
      plane.position.z = 0.26;
      g.add(slab, plane);
      g.position.set(...pos);
      g.rotation.y = rotY;
      this.scene.add(g);
      this.occluders.push(slab);
      this.panels.push({ mat, video, a, b, c, d });
    };
    make(CLIPS.porto.src, [58, 4.2, -12], -1.0, M.zone[1] + 0.02, M.zone[1] + 0.045, M.zone[1] + 0.085, M.zone[1] + 0.11);
    make(CLIPS.operacao.src, [-2, 5.5, -50], 0.25, M.zone[2] + 0.02, M.zone[2] + 0.045, M.zone[2] + 0.08, M.zone[2] + 0.105);
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

    // câmera
    cameraAt(p, tt, this.camState);
    this.camera.position.copy(this.camState.pos);
    this.camera.lookAt(this.camState.look);

    // atmosfera
    const atm = atmosphereAt(p);
    this.fog.density = atm.fog;
    this.key.intensity = atm.key;
    this.fill.intensity = atm.fill;
    this.ambient.intensity = atm.ambient;

    // zonas: ativação, orientação própria → vetor compartilhado, ritmo
    const align = seg(p, M.alignIn, M.alignOut, EASE.cinematic);
    const sharedBob = Math.sin(tt * 0.0011) * 0.18;
    this.zones.forEach((z, i) => {
      const act = seg(p, M.zone[i], M.zone[i] + M.zoneRamp, EASE.out);
      z.edges.opacity = 0.14 + act * 0.45 - align * 0.12;
      z.light.intensity = act * 2.4 * (1 - align * 0.45);
      const ownBob = Math.sin(tt * (0.0007 + i * 0.00023) + z.phase) * 0.35;
      z.group.position.y = lerp(ownBob, sharedBob, align);
      z.group.rotation.y = lerp(z.baseRotY, SHARED_ROT_Y, align);
      const ownSway = Math.sin(tt * 0.0005 + z.phase) * 0.03;
      z.group.rotation.z = lerp(ownSway, 0, align);
    });

    // trajetória: desenha ao ritmo das descobertas; depois, um pulso partilhado
    const draw = this.trajectoryDraw(p);
    this.trajectory.geometry.setDrawRange(0, Math.floor(draw * this.trajIndexCount));
    const full = draw >= 0.999;
    const headT = full ? (tt * 0.00006) % 1 : draw;
    this.trajCurve.getPointAt(clamp(headT, 0.001, 0.999), this.tmp);
    this.head.position.copy(this.tmp);
    this.head.visible = draw > 0.002;
    this.headLight.intensity = (full ? 1.6 : 3.2) * seg(p, M.zone[0], M.zone[0] + 0.03);

    // bifurcação
    const bd = seg(p, M.branchIn, M.branchFull, EASE.cinematic);
    this.branches.forEach((b, i) => {
      const d = clamp((bd - i * 0.12) / 0.88);
      b.mesh.geometry.setDrawRange(0, Math.floor(d * b.count));
    });

    // prova física
    this.panels.forEach((pn) => {
      const o = pulse(p, pn.a, pn.b, pn.c, pn.d, EASE.out, EASE.expoIn);
      pn.mat.opacity = o;
      const shouldPlay = o > 0.01 && !this.reduced;
      if (shouldPlay && pn.video.paused) pn.video.play().catch(() => {});
      if (!shouldPlay && !pn.video.paused) pn.video.pause();
    });

    // navio: uma deriva mínima
    this.vessel.position.y = Math.sin(tt * 0.0004) * 0.25;
    this.vessel.rotation.z = Math.sin(tt * 0.0003) * 0.006;

    this.renderer.render(this.scene, this.camera);
  }

  private trajectoryDraw(p: number) {
    // chega a cada área quando ela ativa
    const k: [number, number][] = [
      [M.zone[0] - 0.02, 0],
      [M.zone[0] + 0.03, 0.14],
      [M.zone[1] + 0.03, 0.4],
      [M.zone[2] + 0.03, 0.66],
      [M.zone[3] + 0.03, 0.87],
      [M.alignIn + 0.06, 1],
    ];
    for (let i = 0; i < k.length - 1; i++) {
      const [a, fa] = k[i];
      const [b, fb] = k[i + 1];
      if (p <= b) return lerp(fa, fb, EASE.inOut(clamp((p - a) / (b - a))));
    }
    return 1;
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
        const hit = this.raycaster.intersectObjects(this.occluders, false);
        occluded = hit.length > 0;
      }
      const margin = 40;
      const onScreen = inFront && x > -margin && x < vw + margin && y > -margin && y < vh + margin;
      out.push({ id, x, y, visible: onScreen ? 1 : 0, occluded });
    };
    this.zones.forEach((z) => {
      const w = z.anchor.clone();
      w.y += z.group.position.y;
      project(z.id, w, true);
    });
    this.branches.forEach((b, i) => project(i === 0 ? "branch-mk" : "branch-ai", b.end, false));
    return out;
  }

  debug() {
    const c = this.camera.position;
    return {
      P: this.lastP.toFixed(3),
      cam: `${c.x.toFixed(0)}, ${c.y.toFixed(0)}, ${c.z.toFixed(0)}`,
      fog: this.fog.density.toFixed(4),
      key: this.key.intensity.toFixed(2),
      draw: this.trajectoryDraw(this.lastP).toFixed(2),
    };
  }

  dispose() {
    this.panels.forEach((p) => {
      p.video.pause();
      p.video.src = "";
    });
    this.renderer.dispose();
  }
}
