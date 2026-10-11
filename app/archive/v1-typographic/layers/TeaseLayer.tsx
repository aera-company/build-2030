"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { EditorialLabel } from "@/components/primitives/EditorialLabel";
import { seg } from "@/motion/math";
import { EASE } from "@/motion/tokens";
import { setOpacity, setTransform, setVisible } from "@/motion/dom";
import type { ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "../layer";
import { localRaw } from "../journey";
import { trajectoryAt, toPx, pointOn } from "../trajectory-path";

/* ------------------------------------------------------------
   TEASE · 04
   A trajetória se bifurca: MARKETING DIRECTION e AI & INTELLIGENCE.
   Nada além disso. O protótipo termina aqui.
   ------------------------------------------------------------ */

export const TeaseLayer = forwardRef<LayerHandle, object>(function TeaseLayer(
  _props,
  ref,
) {
  const root = useRef<HTMLDivElement | null>(null);
  const mk = useRef<HTMLDivElement | null>(null);
  const ai = useRef<HTMLDivElement | null>(null);
  const end = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const p = localRaw(s.j, "tease");
        const on = p > -0.05;
        setVisible(root.current, on);
        if (!on) return;
        const W = s.vw;
        const H = s.vh;
        const traj = trajectoryAt(s.j);
        const a = toPx(traj.pts, traj.rot, W, H);
        const out = 1 - seg(p, 0.9, 1.0, EASE.expoIn);

        const pa = pointOn(a, 0.9);
        const om = seg(p, 0.42, 0.52, EASE.expoOut) * out;
        setOpacity(mk.current, om);
        setTransform(mk.current, `translate3d(${(pa[0] - (mk.current?.offsetWidth ?? 0)).toFixed(1)}px, ${(pa[1] - (mk.current?.offsetHeight ?? 0) - 0.02 * H + (1 - om) * 0.02 * H).toFixed(1)}px, 0)`);

        if (traj.branch) {
          const b = toPx(traj.branch.pts, 0, W, H);
          const pb = pointOn(b, 0.9);
          const oa = seg(p, 0.52, 0.62, EASE.expoOut) * out;
          setOpacity(ai.current, oa);
          setTransform(ai.current, `translate3d(${(pb[0] - (ai.current?.offsetWidth ?? 0)).toFixed(1)}px, ${(pb[1] - (ai.current?.offsetHeight ?? 0) - 0.02 * H + (1 - oa) * 0.02 * H).toFixed(1)}px, 0)`);
        }

        setOpacity(end.current, seg(p, 0.72, 0.82, EASE.expoOut));
      },
    }),
    [],
  );

  const nameStyle = {
    fontSize: "clamp(22px, 3.1vw, 54px)",
    fontWeight: 620,
    fontStretch: "108%",
    letterSpacing: "-0.03em",
    lineHeight: 1,
    opacity: 0,
    willChange: "transform, opacity",
  } as const;

  return (
    <div ref={root} className="absolute inset-0 z-30" style={{ visibility: "hidden" }}>
      <div ref={mk} className="display absolute left-0 top-0 flex flex-col items-end gap-2 whitespace-nowrap text-[var(--white)]" style={nameStyle}>
        <EditorialLabel index="04">Marketing</EditorialLabel>
        <span>MARKETING DIRECTION</span>
      </div>
      <div ref={ai} className="display absolute left-0 top-0 flex flex-col items-end gap-2 whitespace-nowrap text-[var(--white)]" style={nameStyle}>
        <EditorialLabel index="05">Inteligência</EditorialLabel>
        <span>AI &amp; INTELLIGENCE</span>
      </div>
      <div ref={end} className="absolute bottom-7 left-1/2 -translate-x-1/2" style={{ opacity: 0 }}>
        <EditorialLabel>Protótipo 01 / Entrada · Conectar · Direction</EditorialLabel>
      </div>
    </div>
  );
});
