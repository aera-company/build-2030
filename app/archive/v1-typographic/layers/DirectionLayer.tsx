"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  MotionType,
  type MotionTypeHandle,
} from "@/components/primitives/MotionType";
import { EditorialLabel } from "@/components/primitives/EditorialLabel";
import { CLIPS } from "@/lib/media";
import { seg, lerp } from "@/motion/math";
import { EASE } from "@/motion/tokens";
import { setOpacity, setTransform, setVisible } from "@/motion/dom";
import { scrollStore, type ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "../layer";
import { localRaw } from "../journey";
import { trajectoryAt, toPx, pointOn } from "../trajectory-path";

/* ------------------------------------------------------------
   DIRECTION · 03
   A palavra é maior que a viewport. A câmera atravessa as letras
   com material real dentro; depois recua e a palavra vira título.
   `Planejar. Priorizar. Conectar. Acompanhar.`
   `AERA / DIRECTION` nasce na origem da órbita, não acima de ninguém.
   ------------------------------------------------------------ */

const VERBS = ["Planejar.", "Priorizar.", "Conectar.", "Acompanhar."] as const;

export const DirectionLayer = forwardRef<LayerHandle, object>(
  function DirectionLayer(_props, ref) {
    const root = useRef<HTMLDivElement | null>(null);
    const word = useRef<MotionTypeHandle | null>(null);
    const verbs = useRef<(HTMLSpanElement | null)[]>([]);
    const aera = useRef<HTMLDivElement | null>(null);
    const [vw, setVw] = useState(1440);

    useEffect(() => {
      const on = () => setVw(window.innerWidth);
      on();
      window.addEventListener("resize", on);
      return () => window.removeEventListener("resize", on);
    }, []);

    const fontSize = Math.round(vw * 0.27);

    useImperativeHandle(
      ref,
      () => ({
        tick(s: ScrollState) {
          const p = localRaw(s.j, "direction");
          const on = p > -0.05 && p < 1.05;
          setVisible(root.current, on);
          scrollStore.setLive("direction", p > 0 && p < 0.95);
          if (!on) {
            word.current?.setActive(false);
            return;
          }
          const W = s.vw;
          const H = s.vh;
          const el = word.current?.el;
          const width = word.current?.width() ?? W * 1.7;

          // fase A: câmera atravessa a palavra
          const a = seg(p, 0.03, 0.56, EASE.cinematic);
          const xa = lerp(0.12 * W, -(width - 0.92 * W), a);
          const ya = H / 2 - fontSize * 0.5;
          // fase B: recua e vira título
          const b = seg(p, 0.56, 0.74, EASE.cinematic);
          const sc = lerp(1, 0.3, b);
          const x = lerp(xa, 0.06 * W, b);
          const y = lerp(ya, 0.12 * H, b);
          setTransform(el, `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`);
          setOpacity(el, seg(p, 0.0, 0.05) * (1 - seg(p, 0.94, 1.0, EASE.expoIn)));
          word.current?.setFill(seg(p, 0.04, 0.14) * (1 - seg(p, 0.58, 0.72)));
          word.current?.setActive(p > 0.0 && p < 0.75);

          // verbos
          const out = 1 - seg(p, 0.93, 1.0, EASE.expoIn);
          VERBS.forEach((_, i) => {
            const v = verbs.current[i];
            const o = seg(p, 0.66 + i * 0.035, 0.72 + i * 0.035, EASE.expoOut);
            setOpacity(v, o * out);
            setTransform(v, `translate3d(0, ${((1 - o) * 0.03 * H).toFixed(1)}px, 0)`);
          });

          // AERA / DIRECTION na origem da órbita
          const traj = trajectoryAt(s.j);
          const px = toPx(traj.pts, traj.rot, W, H);
          const o = pointOn(px, 0.25);
          const ao = seg(p, 0.58, 0.66, EASE.expoOut) * out;
          setOpacity(aera.current, ao);
          setTransform(aera.current, `translate3d(${(o[0] + 0.018 * W).toFixed(1)}px, ${(o[1] - 0.045 * H).toFixed(1)}px, 0)`);
        },
      }),
      [fontSize],
    );

    return (
      <div ref={root} className="absolute inset-0 z-[25]" style={{ visibility: "hidden" }}>
        <MotionType
          ref={word}
          text="DIRECTION"
          media={CLIPS.porto}
          fontSize={fontSize}
          weight={720}
          stretch={110}
          letterSpacing="-0.04em"
          className="left-0 top-0"
          style={{ transformOrigin: "0 0", opacity: 0 }}
        />

        <div
          className="display absolute left-[6vw] flex flex-wrap gap-x-[1.2vw] text-[var(--white)]"
          style={{
            top: "calc(12vh + 0.3 * 27vw + 2.5vh)",
            fontSize: "clamp(22px, 3.3vw, 56px)",
            fontWeight: 400,
            fontStretch: "100%",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {VERBS.map((v, i) => (
            <span
              key={v}
              ref={(e) => {
                verbs.current[i] = e;
              }}
              style={{ opacity: 0, willChange: "transform, opacity" }}
            >
              {v}
            </span>
          ))}
        </div>

        <div ref={aera} className="absolute left-0 top-0" style={{ opacity: 0 }}>
          <EditorialLabel tick tone="signal">AERA / DIRECTION</EditorialLabel>
        </div>
      </div>
    );
  },
);
