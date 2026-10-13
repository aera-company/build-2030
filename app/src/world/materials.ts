import * as THREE from "three";

/* ============================================================
   PALETA DO TERMINAL · seis famílias, nenhuma saturada
   Navy da marca para o céu e a água, concreto e aço para o
   lugar, âmbar para a luz artificial, teal só para o sinal.
   ============================================================ */

export const C = {
  navyDeep: 0x050f1a,
  concrete: 0x414a56,
  concreteLight: 0x4a535f,
  asphalt: 0x20262e,
  steel: 0x4c5967,
  steelDark: 0x242c35,
  hull: 0x121c28,
  hullBoot: 0x4a2a24,
  deckGreen: 0x1e5553,
  wall: 0x2a323c,
  roof: 0x3b444f,
  warm: 0xffb36a,
  warmWhite: 0xffe4c4,
  coolWhite: 0xd8e6f2,
  teal: 0x1b8fb5,
  tealLight: 0x7fc6dc,
  red: 0xff3b2f,
  water: 0x08182a,
  tree: 0x1d3a2b,
  trunk: 0x2b2420,
  sand: 0x8c8370,
} as const;

/** Contêineres: paleta contida, quase toda dessaturada. */
export const CONTAINER_PALETTE = [
  0x6e4536, 0x1e3348, 0x5c6670, 0x2d5f5c, 0xa39b88, 0x8a6b3a, 0xb6b2a6, 0x5b2f2f, 0x3a5a7a, 0x4c5b4a,
];

export const std = (color: number, roughness = 0.82, metalness = 0.12) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

/** Material que brilha (bloom lê emissive > 1). */
export const glow = (color: number, intensity = 2.4, base = 0x000000) =>
  new THREE.MeshStandardMaterial({ color: base, emissive: color, emissiveIntensity: intensity, roughness: 1, metalness: 0 });

export const box = (w: number, h: number, d: number, mat: THREE.Material, shadow = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  return m;
};

export const cyl = (rt: number, rb: number, h: number, mat: THREE.Material, seg = 10) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  return m;
};

/** Textura radial para sprites de luz. */
export const radialTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.55)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();

/** Textura de ruído discreto para concreto e asfalto. */
export const noiseTexture = (base: string, repeat: [number, number], contrast = 10) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * contrast;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const sprite = (color: number, size: number, opacity = 0.5) => {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: radialTexture(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: true }),
  );
  s.scale.set(size, size, 1);
  // Desligados: o bloom faz o halo e os sprites viram quadrados pretos no passe de normais do GTAO.
  s.visible = false;
  return s;
};
