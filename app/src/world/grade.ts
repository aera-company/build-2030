import * as THREE from "three";

/* ============================================================
   GRADING · o tom do Asset C: sombras para navy, altas luzes
   para âmbar, contraste leve, saturação contida, vinheta.
   Roda em HDR, antes do tone mapping (OutputPass).
   ============================================================ */

export const GradeShader = {
  name: "GradeShader",
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    contrast: { value: 1.08 },
    saturation: { value: 0.95 },
    shadowTint: { value: new THREE.Color(0x0b1a2e) },
    highlightTint: { value: new THREE.Color(0xffc48a) },
    tintAmount: { value: 0.16 },
    vignette: { value: 0.32 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float contrast, saturation, tintAmount, vignette;
    uniform vec3 shadowTint, highlightTint;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(lum), col, saturation);
      col = (col - 0.18) * contrast + 0.18;
      float k = clamp(lum / (lum + 0.6), 0.0, 1.0);
      vec3 tint = mix(shadowTint, highlightTint, k);
      col = mix(col, col * (0.6 + tint * 0.8), tintAmount);
      vec2 d = vUv - 0.5;
      float v = 1.0 - smoothstep(0.35, 0.95, dot(d, d) * 2.6);
      col *= mix(1.0, v, vignette);
      gl_FragColor = vec4(max(col, 0.0), c.a);
    }`,
};
