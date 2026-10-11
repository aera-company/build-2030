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
import { M, ZONES, LINES, LOCKUP } from "@/world/moments";
import type { Anchor } from "@/world/World";

/* ------------------------------------------------------------
   ANOTAÇÕES · informação presa ao mundo
   Labels de capacidade e as quatro linhas seguem âncoras 3D
   (com oclusão). Só a abertura e o lockup são fixos na tela.
   Nenhuma palavra passa de ~6% da tela; BUILD 2030 final é a exceção.
   ------------------------------------------------------------ */

type Props = { anchors: () => Anchor[] };

type Item = { id: string; show: (P: number) => number; occlude?: boolean };

const ITEMS: Item[] = [
  ...ZONES.map<Item>((z) => ({
    id: z.id,
    show: (P) => seg(P, z.at, z.at + M.labelRamp, EASE.out) * (1 - seg(P, M.labelsOut, M.labelsOut + 0.03, EASE.expoIn)),
    occlude: true,
  })),
  ...LINES.map<Item>((_, i) => ({
    id: `line-${i}`,
    show: (P) => {
      const a = M.lines[i];
      return pulse(P, a, a + M.lineRamp, a + M.lineRamp + M.lineHold, a + M.lineRamp * 2 + M.lineHold, EASE.out, EASE.expoIn);
    },
  })),
];

export const AnnotationLayer = forwardRef<LayerHandle, Props>(function AnnotationLayer({ anchors }, ref) {
  const presents = useRef<HTMLDivElement | null>(null);
  const logo = useRef<HTMLDivElement | null>(null);
  const build = useRef<HTMLDivElement | null>(null);
  const lockup = useRef<HTMLDivElement | null>(null);
  const els = useRef<Record<string, HTMLDivElement | null>>({});
  const bootT = useRef(-1);

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const P = progressOf(s.j);
        if (bootT.current < 0) bootT.current = s.t;
        const tt = s.t - bootT.current;
        const H = s.vh;

        const pr = pulse(P, M.presentsIn - 0.012, M.presentsIn, M.presentsHold, M.presentsOut, EASE.out, EASE.expoIn) * seg(tt, 400, 1600);
        setOpacity(presents.current, pr);
        const lg = pulse(P, M.logoIn, M.logoIn + 0.03, M.logoHold, M.logoOut, EASE.out, EASE.expoIn);
        setOpacity(logo.current, lg);
        setTransform(logo.current, `translate3d(-50%, calc(-50% + ${((1 - lg) * 0.012 * H).toFixed(1)}px), 0)`);
        const bd = pulse(P, M.buildIn, M.buildIn + 0.025, M.logoHold, M.logoOut, EASE.out, EASE.expoIn);
        setOpacity(build.current, bd);
        setTransform(build.current, `translate3d(-50%, ${((1 - bd) * 0.01 * H).toFixed(1)}px, 0)`);

        const byId = new Map(anchors().map((x) => [x.id, x]));
        ITEMS.forEach((it) => {
          const el = els.current[it.id];
          const an = byId.get(it.id);
          if (!el || !an) return;
          const o = it.show(P) * an.visible * (it.occlude && an.occluded ? 0.18 : 1);
          setOpacity(el, o);
          setTransform(el, `translate3d(${an.x.toFixed(1)}px, ${an.y.toFixed(1)}px, 0)`);
        });

        const lk = seg(P, M.lockupIn, M.lockupIn + 0.04, EASE.out);
        setOpacity(lockup.current, lk);
        setTransform(lockup.current, `translate3d(0, ${((1 - lk) * 0.03 * H).toFixed(1)}px, 0)`);
      },
    }),
    [anchors],
  );

  const bind = (id: string) => (e: HTMLDivElement | null) => {
    els.current[id] = e;
  };
  const anchored = "absolute left-0 top-0 flex -translate-y-full flex-col gap-1.5 pb-3";
  const tickLine = <span aria-hidden className="ml-px block h-6 w-px bg-[var(--white)] opacity-60" />;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* 01 · chegada */}
      <div ref={presents} className="absolute bottom-[12vh] left-[6vw]" style={{ opacity: 0 }}>
        <EditorialLabel tick tone="white">AERA apresenta</EditorialLabel>
      </div>
      <div ref={logo} className="absolute left-1/2 top-[42%]" style={{ opacity: 0, transform: "translate3d(-50%, -50%, 0)" }}>
        <BrandMark width={300} />
      </div>
      <div ref={build} className="display absolute left-1/2 top-[52%] text-[var(--white)]" style={{ fontSize: "clamp(16px, 1.5vw, 24px)", fontWeight: 560, fontStretch: "110%", letterSpacing: "0.12em", opacity: 0, transform: "translate3d(-50%, 0, 0)" }}>
        BUILD 2030
      </div>

      {/* 03–04 · capacidades presas ao mundo */}
      {ZONES.map((z) => (
        <div key={z.id} ref={bind(z.id)} className={anchored} style={{ opacity: 0, willChange: "transform, opacity" }}>
          <EditorialLabel tone="white">{z.label}</EditorialLabel>
          {tickLine}
        </div>
      ))}

      {/* 06 · quatro linhas */}
      {LINES.map((l, i) => (
        <div
          key={l.text}
          ref={bind(`line-${i}`)}
          className="display absolute left-0 top-0 -translate-y-full text-[var(--white)]"
          style={{ fontSize: "clamp(18px, 2vw, 32px)", fontWeight: 500, fontStretch: "100%", letterSpacing: "-0.02em", lineHeight: 1.1, opacity: 0, willChange: "transform, opacity" }}
        >
          {l.text}
        </div>
      ))}

      {/* 07 · lockup, como no Asset C: canto superior esquerdo, 5% do quadro */}
      <div ref={lockup} className="absolute left-[6vw] top-[10vh] flex flex-col items-start gap-5" style={{ opacity: 0 }}>
        <BrandMark width={280} />
        <span className="display text-[var(--white)]" style={{ fontSize: "clamp(34px, 4.6vw, 80px)", fontWeight: 560, fontStretch: "112%", letterSpacing: "0.1em", lineHeight: 1 }}>
          {LOCKUP.title}
        </span>
        <EditorialLabel tone="white" style={{ textTransform: "none", letterSpacing: "0.1em", fontSize: 13 }}>{LOCKUP.support}</EditorialLabel>
      </div>
    </div>
  );
});
