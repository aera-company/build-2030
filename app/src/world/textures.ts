import * as THREE from "three";

/* ============================================================
   TEXTURAS PBR · Poly Haven (CC0), 1k, em public/tex
   Carregadas uma vez; repetição definida por uso.
   ============================================================ */

let loaderRef: THREE.TextureLoader | null = null;
const loader = () => (loaderRef ??= new THREE.TextureLoader());
const cache = new Map<string, THREE.Texture>();

const load = (file: string, srgb: boolean, repeat: [number, number]) => {
  const key = `${file}|${repeat[0]}x${repeat[1]}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = loader().load(`/tex/${file}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

export type PbrSet = { map: THREE.Texture; roughnessMap: THREE.Texture; normalMap: THREE.Texture };

/** Conjunto diff + rough + normal (OpenGL) de um asset Poly Haven. */
export const pbr = (name: string, repeat: [number, number], withRoughness = false): Partial<PbrSet> => ({
  map: load(`${name}_diff_1k.jpg`, true, repeat),
  normalMap: load(`${name}_nor_gl_1k.jpg`, false, repeat),
  ...(withRoughness ? { roughnessMap: load(`${name}_rough_1k.jpg`, false, repeat) } : {}),
});

export const normalOnly = (name: string, repeat: [number, number]) => load(`${name}_nor_gl_1k.jpg`, false, repeat);

export const waterNormals = () => {
  const t = loader().load("/tex/waternormals.jpg");
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
