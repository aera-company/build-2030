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
import { M, ZONES, SYNTH, LOCKUP } from "@/world/moments";
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
];

/** Síntese: entra linha a linha, sai junto antes do lockup. */
const synthIn = (P: number, at: number) => pulse(P, at, at + 0.02, M.synth.out, M.synth.out + 0.015, EASE.out, EASE.expoIn);

export const AnnotationLayer = forwardRef<LayerHandle, Props>(function AnnotationLayer({ anchors }, ref) {
  const presents = useRef<HTMLDivElement | null>(null);
  const logo = useRef<HTMLDivElement | null>(null);
  const synthOne = useRef<HTMLDivElement | null>(null);
  const synthMany = useRef<HTMLDivElement | null>(null);
  const synthOss = useRef<HTMLDivElement | null>(null);
  const lockup = useRef<HTMLDivElement | null>(null);
  const lockupLine = useRef<HTMLDivElement | null>(null);
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
        const s1 = synthIn(P, M.synth.one);
        const s2 = synthIn(P, M.synth.many);
        const s3 = synthIn(P, M.synth.oss);
        setOpacity(synthOne.current, s1);
        setTransform(synthOne.current, `translate3d(0, ${((1 - s1) * 0.018 * H).toFixed(1)}px, 0)`);
        setOpacity(synthMany.current, s2);
        setTransform(synthMany.current, `translate3d(0, ${((1 - s2) * 0.018 * H).toFixed(1)}px, 0)`);
        setOpacity(synthOss.current, s3);

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
        const ll = seg(P, M.lockupLine, M.lockupLine + 0.035, EASE.out);
        setOpacity(lockupLine.current, ll);
        setTransform(lockupLine.current, `translate3d(0, ${((1 - ll) * 0.012 * H).toFixed(1)}px, 0)`);
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
      {/* 03–04 · capacidades presas ao mundo */}
      {ZONES.map((z) => (
        <div key={z.id} ref={bind(z.id)} className={anchored} style={{ opacity: 0, willChange: "transform, opacity" }}>
          <EditorialLabel tone="white">{z.label}</EditorialLabel>
          {tickLine}
        </div>
      ))}

      {/* 06 · integração: a síntese, fixa na tela, embaixo à esquerda, sobre o mundo inteiro */}
      <div className="absolute bottom-[14vh] left-[6vw] flex flex-col items-start gap-3">
        <div ref={synthOne} className="display text-[var(--white)]" style={{ fontSize: "clamp(26px, 3vw, 52px)", fontWeight: 540, fontStretch: "104%", letterSpacing: "-0.025em", lineHeight: 1, opacity: 0 }}>
          {SYNTH.one}
        </div>
        <div ref={synthMany} className="display text-[var(--white)]" style={{ fontSize: "clamp(26px, 3vw, 52px)", fontWeight: 540, fontStretch: "104%", letterSpacing: "-0.025em", lineHeight: 1, opacity: 0 }}>
          {SYNTH.many}
        </div>
        <div ref={synthOss} className="mt-2" style={{ opacity: 0 }}>
          <EditorialLabel tick tone="signal">{SYNTH.oss}</EditorialLabel>
        </div>
      </div>

      {/* 07 · lockup, como no Asset C: canto superior esquerdo, 5% do quadro */}
      <div ref={lockup} className="absolute left-[6vw] top-[10vh] flex flex-col items-start gap-5" style={{ opacity: 0 }}>
        <BrandMark width={280} />
        <span className="display text-[var(--white)]" style={{ fontSize: "clamp(34px, 4.6vw, 80px)", fontWeight: 560, fontStretch: "112%", letterSpacing: "0.1em", lineHeight: 1 }}>
          {LOCKUP.title}
        </span>
        <EditorialLabel tone="white" style={{ textTransform: "none", letterSpacing: "0.1em", fontSize: 13 }}>{LOCKUP.support}</EditorialLabel>
        <div ref={lockupLine} className="mt-3 max-w-[34ch] text-[var(--muted)]" style={{ fontSize: "clamp(14px, 1.05vw, 17px)", lineHeight: 1.4, opacity: 0 }}>
          {LOCKUP.line}
        </div>
      </div>
    </div>
  );
});
