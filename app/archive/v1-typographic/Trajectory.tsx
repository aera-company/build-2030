"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "./layer";
import { trajectoryAt, toPx, dAttr, pointOn } from "./trajectory-path";
import { setOpacity } from "@/motion/dom";

/**
 * A trajetória GAVEA: um SVG fixo, um caminho principal e um ramo (tease),
 * um ponto-guia. Muda de função por bloco (horizonte, baseline, caminho das
 * palavras, arco de conexão, órbita, bifurcação). Teal como sinal, 1.5 px.
 */
export const Trajectory = forwardRef<LayerHandle, object>(function Trajectory(
  _props,
  ref,
) {
  const svg = useRef<SVGSVGElement | null>(null);
  const main = useRef<SVGPathElement | null>(null);
  const branch = useRef<SVGPathElement | null>(null);
  const head = useRef<SVGCircleElement | null>(null);
  const halo = useRef<SVGCircleElement | null>(null);
  const lastD = useRef("");
  const lastB = useRef("");

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const st = trajectoryAt(s.j);
        const W = s.vw;
        const H = s.vh;
        const svgEl = svg.current;
        if (svgEl) {
          const vb = `0 0 ${W} ${H}`;
          if (svgEl.getAttribute("viewBox") !== vb) svgEl.setAttribute("viewBox", vb);
        }
        const px = toPx(st.pts, st.rot, W, H);
        const d = dAttr(px);
        const m = main.current;
        if (m) {
          if (d !== lastD.current) {
            m.setAttribute("d", d);
            lastD.current = d;
          }
          const len = m.getTotalLength();
          m.setAttribute("stroke-dasharray", `${(len * st.drawn).toFixed(1)} ${len.toFixed(1)}`);
          setOpacity(m, st.opacity);
        }
        const b = branch.current;
        if (b) {
          if (st.branch) {
            const bp = toPx(st.branch.pts, 0, W, H);
            const bd = dAttr(bp);
            if (bd !== lastB.current) {
              b.setAttribute("d", bd);
              lastB.current = bd;
            }
            const len = b.getTotalLength();
            b.setAttribute("stroke-dasharray", `${(len * st.branch.drawn).toFixed(1)} ${len.toFixed(1)}`);
            setOpacity(b, st.branch.opacity);
          } else {
            setOpacity(b, 0);
          }
        }
        const hp = pointOn(px, st.head);
        [head.current, halo.current].forEach((c) => {
          if (!c) return;
          c.setAttribute("cx", hp[0].toFixed(1));
          c.setAttribute("cy", hp[1].toFixed(1));
        });
        setOpacity(head.current, st.headOpacity * st.opacity);
        setOpacity(halo.current, st.headOpacity * st.opacity * 0.28);
      },
    }),
    [],
  );

  return (
    <svg
      ref={svg}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        ref={main}
        fill="none"
        stroke="var(--teal-signal)"
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ opacity: 0 }}
      />
      <path
        ref={branch}
        fill="none"
        stroke="var(--teal-signal)"
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ opacity: 0 }}
      />
      <circle ref={halo} r={10} fill="var(--teal-signal)" style={{ opacity: 0 }} />
      <circle ref={head} r={3} fill="var(--white)" style={{ opacity: 0 }} />
    </svg>
  );
});
