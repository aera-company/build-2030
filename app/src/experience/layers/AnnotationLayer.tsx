"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { EditorialLabel } from "@/components/primitives/EditorialLabel";
import { BrandMark } from "@/components/primitives/BrandMark";
import { seg, pulse } from "@/motion/math";
import { EASE } from "@/motion/tokens";
import { setOpacity, setTransform } from "@/motion/dom";
import type { ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "../layer";
import { progressOf } from "../journey";
import { M, ZONES } from "@/world/moments";
import type { Anchor } from "@/world/World";

/* ------------------------------------------------------------
   ANOTAÇÕES · informação presa ao espaço
   Hierarquia: mundo → câmera/luz → labels → (raras) headlines.
   Nenhuma palavra passa de ~25% da tela. Labels de zona seguem
   âncoras 3D projetadas e escurecem quando algo as oculta.
   ------------------------------------------------------------ */

type Props = { anchors: () => Anchor[] };

export const AnnotationLayer = forwardRef<LayerHandle, Props>(
  function AnnotationLayer({ anchors }, ref) {
    const presents = useRef<HTMLDivElement | null>(null);
    const logo = useRef<HTMLDivElement | null>(null);
    const title = useRef<HTMLDivElement | null>(null);
    const zoneEls = useRef<(HTMLDivElement | null)[]>([]);
    const connect = useRef<HTMLDivElement | null>(null);
    const direction = useRef<HTMLDivElement | null>(null);
    const mk = useRef<HTMLDivElement | null>(null);
    const ai = useRef<HTMLDivElement | null>(null);
    const bootT = useRef(-1);

    useImperativeHandle(
      ref,
      () => ({
        tick(s: ScrollState) {
          const P = progressOf(s.j);
          if (bootT.current < 0) bootT.current = s.t;
          const tt = s.t - bootT.current;
          const H = s.vh;

          // 01 · AERA apresenta
          const pr = pulse(P, M.presentsIn - 0.012, M.presentsIn, M.presentsHold, M.presentsOut, EASE.out, EASE.expoIn) * seg(tt, 500, 1800);
          setOpacity(presents.current, pr);

          // 02 · marca oficial, intacta, sem teatro
          const lg = pulse(P, M.logoIn, M.logoIn + 0.03, M.logoHold, M.logoOut, EASE.out, EASE.expoIn);
          setOpacity(logo.current, lg);

          // 03 · GAVEA / BUILD 2030 como label técnico, persistente
          setOpacity(title.current, seg(P, M.titleLabel, M.titleLabel + 0.04));

          // 04–06 · labels presos às áreas
          const a = anchors();
          ZONES.forEach((z, i) => {
            const el = zoneEls.current[i];
            const an = a.find((x) => x.id === z.id);
            if (!el || !an) return;
            const act = seg(P, M.zone[i] + 0.01, M.zone[i] + 0.05, EASE.out);
            const o = act * an.visible * (an.occluded ? 0.22 : 1);
            setOpacity(el, o);
            setTransform(el, `translate3d(${an.x.toFixed(1)}px, ${an.y.toFixed(1)}px, 0)`);
          });

          // 07 · headline rara: conectar
          const ch = pulse(P, M.connectHeadIn, M.connectHeadIn + 0.035, M.connectHeadOut, M.connectHeadOut + 0.035, EASE.out, EASE.expoIn);
          setOpacity(connect.current, ch);
          setTransform(connect.current, `translate3d(0, ${((1 - ch) * 0.02 * H).toFixed(1)}px, 0)`);

          // DIRECTION: nome da camada, não a tela
          const dr = seg(P, M.directionIn, M.directionIn + 0.04, EASE.out);
          setOpacity(direction.current, dr);
          setTransform(direction.current, `translate3d(0, ${((1 - dr) * 0.02 * H).toFixed(1)}px, 0)`);

          // hint · nomes nas pontas da bifurcação
          const bm = a.find((x) => x.id === "branch-mk");
          const ba = a.find((x) => x.id === "branch-ai");
          if (bm) {
            const o = seg(P, M.branchLabelA, M.branchLabelA + 0.03) * bm.visible;
            setOpacity(mk.current, o);
            setTransform(mk.current, `translate3d(${bm.x.toFixed(1)}px, ${bm.y.toFixed(1)}px, 0)`);
          }
          if (ba) {
            const o = seg(P, M.branchLabelB, M.branchLabelB + 0.03) * ba.visible;
            setOpacity(ai.current, o);
            setTransform(ai.current, `translate3d(${ba.x.toFixed(1)}px, ${ba.y.toFixed(1)}px, 0)`);
          }
        },
      }),
      [anchors],
    );

    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* 01 */}
        <div ref={presents} className="absolute bottom-[14vh] left-[6vw]" style={{ opacity: 0 }}>
          <EditorialLabel tick tone="white">AERA apresenta</EditorialLabel>
        </div>

        {/* 02 · marca oficial */}
        <div ref={logo} className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0 }}>
          <BrandMark width={300} />
        </div>

        {/* 03 */}
        <div ref={title} className="absolute bottom-7 left-[6vw] flex flex-col gap-2" style={{ opacity: 0 }}>
          <EditorialLabel tone="white">GAVEA / BUILD 2030</EditorialLabel>
          <EditorialLabel>O sistema · modelo conceitual</EditorialLabel>
        </div>

        {/* 04–06 · labels de zona (âncoras 3D) */}
        {ZONES.map((z, i) => (
          <div
            key={z.id}
            ref={(e) => {
              zoneEls.current[i] = e;
            }}
            className="absolute left-0 top-0 flex -translate-y-full flex-col gap-1.5 pb-3"
            style={{ opacity: 0, willChange: "transform, opacity" }}
          >
            <EditorialLabel index={z.index} tone="white">{z.label}</EditorialLabel>
            <span aria-hidden className="ml-px block h-5 w-px bg-[var(--white)] opacity-50" />
          </div>
        ))}

        {/* 07 · conectar */}
        <div
          ref={connect}
          className="display absolute bottom-[16vh] left-[6vw] text-[var(--white)]"
          style={{ fontSize: "clamp(20px, 2.3vw, 38px)", fontWeight: 500, fontStretch: "100%", letterSpacing: "-0.02em", lineHeight: 1.12, opacity: 0 }}
        >
          Não é sobre substituir.
          <br />
          É sobre conectar.
        </div>

        {/* DIRECTION */}
        <div ref={direction} className="absolute bottom-[14vh] left-[6vw] flex flex-col gap-3" style={{ opacity: 0 }}>
          <EditorialLabel tick tone="signal">AERA / DIRECTION</EditorialLabel>
          <div
            className="display text-[var(--white)]"
            style={{ fontSize: "clamp(28px, 4.4vw, 72px)", fontWeight: 640, fontStretch: "108%", letterSpacing: "-0.035em", lineHeight: 0.95 }}
          >
            DIRECTION
          </div>
          <div
            className="display text-[var(--white)]"
            style={{ fontSize: "clamp(14px, 1.25vw, 20px)", fontWeight: 420, fontStretch: "100%", letterSpacing: "-0.01em", opacity: 0.8 }}
          >
            Planejar. Priorizar. Conectar. Acompanhar.
          </div>
        </div>

        {/* hint */}
        <div ref={mk} className="absolute left-0 top-0 flex -translate-x-full -translate-y-full flex-col items-end gap-1.5 pb-3 pr-3" style={{ opacity: 0 }}>
          <EditorialLabel index="04">Marketing</EditorialLabel>
          <span className="display text-[var(--white)]" style={{ fontSize: "clamp(16px, 1.6vw, 28px)", fontWeight: 600, fontStretch: "106%", letterSpacing: "-0.03em", lineHeight: 1 }}>MARKETING DIRECTION</span>
        </div>
        <div ref={ai} className="absolute left-0 top-0 flex -translate-x-full -translate-y-full flex-col items-end gap-1.5 pb-3 pr-3" style={{ opacity: 0 }}>
          <EditorialLabel index="05">Inteligência</EditorialLabel>
          <span className="display text-[var(--white)]" style={{ fontSize: "clamp(16px, 1.6vw, 28px)", fontWeight: 600, fontStretch: "106%", letterSpacing: "-0.03em", lineHeight: 1 }}>AI &amp; INTELLIGENCE</span>
        </div>
      </div>
    );
  },
);
