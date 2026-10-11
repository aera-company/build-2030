import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { cameraAt, atmosphereAt, fovAt } from "./camera-path";
import { C } from "./materials";
import { ZONES, LINES } from "./moments";
import { SUN_DIR, buildSky } from "./terminal/sky";
import { buildGround } from "./terminal/ground";
import { buildYard } from "./terminal/containers";
import { buildCranes } from "./terminal/cranes";
import { buildVessels } from "./terminal/vessels";
import { buildBuildings } from "./terminal/buildings";
import { buildVehicles } from "./terminal/vehicles";
import { buildRoutes } from "./terminal/routes";
import type { Built } from "./terminal/layout";

/* ============================================================
   O TERMINAL GAVEA · um mundo vivo ao entardecer
   docs/GAVEA_BUILD2030_HERO_DIRECTION_V2.md
   Sol baixo à direita, luz artificial quente, teal só no sinal.
   A câmera viaja ao longo do cais (camera-path.ts). Tudo o que
   se move, move-se desde o primeiro frame e nunca para.
   ============================================================ */

const FOG = 0x1f2a48;

export type Anchor = { id: string; x: number; y: number; visible: number; occluded: boolean };

export class World {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private fog: THREE.FogExp2;
  private sun: THREE.DirectionalLight;
  private fill: THREE.DirectionalLight;
  private parts: Built[] = [];
  private sky: ReturnType<typeof buildSky>;
  private towerLight: THREE.PointLight;
  private occluders: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private camState = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  private lastP = 0;
  private fov = 42;
  private reduced = false;
  readyFrames = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(C.navyDeep, 1);

    this.camera = new THREE.PerspectiveCamera(42, 1, 1, 7000);
    this.fov = 42;
    this.fog = new THREE.FogExp2(FOG, 0.0007);
    this.scene.fog = this.fog;

    this.scene.add(new THREE.HemisphereLight(0x6479a3, 0x1a2432, 5.0));
    this.scene.add(new THREE.AmbientLight(0x56688a, 0.9));

    this.sun = new THREE.DirectionalLight(0xffb078, 3.8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -380; sc.right = 380; sc.top = 380; sc.bottom = -380; sc.near = 10; sc.far = 2200;
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.6;
    this.scene.add(this.sun, this.sun.target);

    this.fill = new THREE.DirectionalLight(C.teal, 0);
    this.fill.position.set(-600, 300, 500);
    this.scene.add(this.fill);

    // luzes quentes nos pontos por onde a câmera passa perto
    const warm = (x: number, y: number, z: number, i = 260) => {
      const l = new THREE.PointLight(C.warm, i, 120, 1.7);
      l.position.set(x, y, z);
      this.scene.add(l);
    };
    warm(230, 18, -40);
    warm(392, 16, -132);
    warm(548, 16, -132);
    warm(760, 14, -30);
    warm(1000, 12, -70, 180);

    this.sky = buildSky();
    this.scene.add(this.sky.group);
    const ground = buildGround();
    const yard = buildYard();
    const cranes = buildCranes();
    const vessels = buildVessels();
    const buildings = buildBuildings();
    const vehicles = buildVehicles();
    const routes = buildRoutes();
    this.towerLight = buildings.towerLight;
    this.parts = [this.sky, ground, yard, cranes, vessels, buildings, vehicles, routes];
    this.parts.forEach((b) => {
      this.scene.add(b.group);
      if (b.occluders) this.occluders.push(...b.occluders);
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.42, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(p: number, t: number) {
    this.lastP = p;
    const tt = this.reduced ? 0 : t;

    cameraAt(p, tt, this.camState);
    this.camera.position.copy(this.camState.pos);
    this.camera.lookAt(this.camState.look);
    const fov = fovAt(p);
    if (Math.abs(fov - this.fov) > 0.01) {
      this.fov = fov;
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    const atm = atmosphereAt(p);
    this.fog.density = atm.fog;
    this.fill.intensity = atm.fill;
    this.renderer.toneMappingExposure = atm.exposure;
    this.towerLight.intensity = 60 + atm.system * 160;

    // o sol acompanha o alvo (sombras nítidas onde a câmera olha); o céu acompanha a câmera
    this.sun.target.position.copy(this.camState.look);
    this.sun.position.copy(this.camState.look).addScaledVector(SUN_DIR, 900);
    this.sky.dome.position.copy(this.camera.position);

    this.parts.forEach((b) => b.update?.(tt, p, atm.system));

    this.composer.render();
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
        this.raycaster.far = dist - 3;
        occluded = this.raycaster.intersectObjects(this.occluders, false).length > 0;
      }
      const margin = 40;
      const onScreen = inFront && x > -margin && x < vw + margin && y > -margin && y < vh + margin;
      out.push({ id, x, y, visible: onScreen ? 1 : 0, occluded });
    };
    const tmp = new THREE.Vector3();
    ZONES.forEach((z) => project(z.id, tmp.set(...z.anchor), true));
    LINES.forEach((l, i) => project(`line-${i}`, tmp.set(...l.anchor), false));
    return out;
  }

  debug() {
    const c = this.camera.position;
    return {
      P: this.lastP.toFixed(3),
      cam: `${c.x.toFixed(0)}, ${c.y.toFixed(0)}, ${c.z.toFixed(0)}`,
      fog: this.fog.density.toFixed(5),
      calls: this.renderer.info.render.calls,
      tris: this.renderer.info.render.triangles,
    };
  }

  dispose() {
    this.renderer.dispose();
  }
}
