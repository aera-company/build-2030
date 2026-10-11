"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { seg, pulse, lerp } from "@/motion/math";
import { EASE, DEPTH } from "@/motion/tokens";
import { setOpacity, setTransform, setVisible } from "@/motion/dom";
import type { ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "../layer";
import { BLOCKS, localRaw } from "../journey";
import { trajectoryAt, toPx, pointOn, normalOn } from "../trajectory-path";

/* ------------------------------------------------------------
   CAMPO · 02 / CONECTAR (e continua dentro de 03 / DIRECTION)
   Oito frentes que já existem habitam o espaço em profundidades
   diferentes. `Não é sobre substituir.` O sistema se move e as
   frentes encontram a trajetória. `É sobre conectar.`
   Em DIRECTION as mesmas frentes orbitam: orquestração, não
   organograma. Na saída, fluem para a origem da direção.
   ------------------------------------------------------------ */

type Depth = keyof typeof DEPTH;

const WORDS: {
  t: string;
  depth: Depth;
  x: number;
  y: number;
  dx: number;
  dy: number;
  slot: number;
  side: 1 | -1;
}[] = [
  { t: "Marketing", depth: "near", x: 12, y: 30, dx: -2.5, dy: 1.5, slot: 0.26, side: -1 },
  { t: "Comercial", depth: "mid", x: 70, y: 22, dx: 1.8, dy: 2.2, slot: 0.47, side: 1 },
  { t: "Agência", depth: "far", x: 38, y: 16, dx: 1, dy: 1, slot: 0.16, side: 1 },
  { t: "Time interno", depth: "mid", x: 16, y: 70, dx: 2, dy: -1.5, slot: 0.36, side: 1 },
  { t: "Parceiros", depth: "far", x: 80, y: 68, dx: -1.5, dy: -1, slot: 0.68, side: -1 },
  { t: "Tecnologia", depth: "near", x: 56, y: 78, dx: -2, dy: -2, slot: 0.79, side: 1 },
  { t: "IA", depth: "mid", x: 46, y: 48, dx: 1.5, dy: 1, slot: 0.57, side: -1 },
  { t: "Projetos", depth: "far", x: 86, y: 42, dx: -1, dy: 1.5, slot: 0.9, side: -1 },
];

const D = BLOCKS.direction.start;
const T = BLOCKS.tease.start;

export const FieldLayer = forwardRef<LayerHandle, object>(function FieldLayer(
  _props,
  ref,
) {
  const root = useRef<HTMLDivElement | null>(null);
  const words = useRef<(HTMLDivElement | null)[]>([]);
  const ticks = useRef<(HTMLSpanElement | null)[]>([]);
  const blurLevel = useRef<number[]>(WORDS.map(() => -1));
  const head1 = useRef<HTMLDivElement | null>(null);
  const head2 = useRef<HTMLDivElement | null>(null);
  const orbitTime = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const j = s.j;
        const pc = localRaw(j, "connect");
        const pd = localRaw(j, "direction");
        const on = j > BLOCKS.connect.start - 0.3 && j < T + 0.2;
        setVisible(root.current, on);
        if (!on) return;
        const W = s.vw;
        const H = s.vh;
        const traj = trajectoryAt(j);
        const px = toPx(traj.pts, traj.rot, W, H);
        const inDir = seg(pd, 0.0, 0.3, EASE.inOut);
        const collapse = seg(pd, 0.88, 1.0, EASE.expoIn);
        // órbita: avança com o scroll e, devagar, com o tempo (uma volta ≈ 90 s)
        if (pd > 0 && pd < 0.95) orbitTime.current += s.dt;
        const orbitOffset = j >= D ? 0.17 * (j - D) + 0.011 * (orbitTime.current / 1000) : 0;
        const origin = pointOn(px, 0.25);

        WORDS.forEach((w, i) => {
          const el = words.current[i];
          if (!el) return;
          const dp = DEPTH[w.depth];
          const ap = seg(pc, 0.02 + i * 0.03, 0.09 + i * 0.03, EASE.expoOut);
          const al = seg(pc, 0.5 + i * 0.02, 0.8 + i * 0.02, EASE.cinematic);

          // posição livre (deriva lenta por profundidade)
          const fx = ((w.x + w.dx * pc * 6) / 100) * W;
          const fy = ((w.y + w.dy * pc * 6) / 100) * H;

          // posição na trajetória (com deslocamento perpendicular alternado)
          const t = w.slot + orbitOffset;
          const pt = pointOn(px, t);
          const n = normalOn(px, t);
          const off = 0.03 * H * w.side;
          const sx = pt[0] + n[0] * off;
          const sy = pt[1] + n[1] * off;

          let x = lerp(fx, sx, al);
          let y = lerp(fy, sy, al);
          let scale = lerp(dp.scale, 1, al) * lerp(1, 0.8, inDir);
          let opacity = lerp(dp.opacity, 1, al) * ap * lerp(1, 0.78, inDir);

          if (collapse > 0) {
            x = lerp(x, origin[0], collapse);
            y = lerp(y, origin[1], collapse);
            scale *= 1 - 0.55 * collapse;
            opacity *= 1 - collapse;
          }

          setOpacity(el, opacity);
          setTransform(el, `translate3d(${(x - 0.5 * el.offsetWidth).toFixed(1)}px, ${(y - 0.5 * el.offsetHeight).toFixed(1)}px, 0) scale(${scale.toFixed(4)})`);

          // blur discreto: 3 níveis, troca só quando al cruza 0.5
          const level = al < 0.5 ? dp.blur : 0;
          if (blurLevel.current[i] !== level) {
            blurLevel.current[i] = level;
            el.style.filter = level > 0 ? `blur(${level}px)` : "none";
          }

          // tique que liga a palavra à trajetória
          const tk = ticks.current[i];
          if (tk) {
            const to = seg(al, 0.8, 1, EASE.out) * (1 - collapse);
            setOpacity(tk, to);
            const ang = (Math.atan2(n[1] * -w.side, n[0] * -w.side) * 180) / Math.PI;
            setTransform(tk, `rotate(${ang.toFixed(1)}deg) scaleX(${to.toFixed(3)})`);
          }
        });

        // headlines
        const h1 = pulse(pc, 0.14, 0.22, 0.46, 0.54, EASE.expoOut, EASE.expoIn);
        const h1in = seg(pc, 0.14, 0.22, EASE.expoOut);
        setOpacity(head1.current, h1);
        setTransform(head1.current, `translate3d(0, ${((1 - h1in) * 0.05 * H).toFixed(1)}px, 0) scale(${lerp(1.05, 1, h1in).toFixed(4)})`);

        const h2 = pulse(pc, 0.74, 0.82, 0.95, 1.03, EASE.expoOut, EASE.expoIn);
        const h2in = seg(pc, 0.74, 0.82, EASE.expoOut);
        setOpacity(head2.current, h2);
        setTransform(head2.current, `translate3d(0, ${((1 - h2in) * 0.05 * H).toFixed(1)}px, 0) scale(${lerp(1.05, 1, h2in).toFixed(4)})`);
      },
    }),
    [],
  );

  const headStyle = {
    fontSize: "clamp(40px, 7.2vw, 118px)",
    fontWeight: 640,
    fontStretch: "104%",
    lineHeight: 0.95,
    letterSpacing: "-0.035em",
    opacity: 0,
    transformOrigin: "0 100%",
    willChange: "transform, opacity",
  } as const;

  return (
    <div ref={root} className="absolute inset-0 z-20" style={{ visibility: "hidden" }}>
      {WORDS.map((w, i) => (
        <div
          key={w.t}
          ref={(e) => {
            words.current[i] = e;
          }}
          className="display absolute left-0 top-0 whitespace-nowrap text-[var(--white)]"
          style={{
            fontSize: "clamp(18px, 2.3vw, 38px)",
            fontWeight: 520,
            fontStretch: "100%",
            letterSpacing: "-0.015em",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          {w.t}
          <span
            ref={(e) => {
              ticks.current[i] = e;
            }}
            aria-hidden
            className="absolute left-1/2 top-1/2 block h-px w-[3vh] bg-[var(--teal-signal)]"
            style={{ opacity: 0, transformOrigin: "0 50%" }}
          />
        </div>
      ))}

      <div ref={head1} className="display absolute bottom-[12vh] left-[6vw] text-[var(--white)]" style={headStyle}>
        Não é sobre
        <br />
        substituir.
      </div>
      <div ref={head2} className="display absolute bottom-[12vh] left-[6vw] text-[var(--white)]" style={headStyle}>
        É sobre
        <br />
        conectar.
      </div>
    </div>
  );
});
