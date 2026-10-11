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
import { M, PARTS, ATTRS, BRANCH_A, BRANCH_B, SUPPORT_LINES } from "@/world/moments";
import type { Anchor } from "@/world/World";

/* ------------------------------------------------------------
   ANOTAÇÕES · informação presa ao mundo
   Quase tudo segue uma âncora 3D (labels de partes, DIRECTION,
   atributos, AERA / DIRECTION, a headline, nomes das frentes,
   nós dos ramos). Só a abertura e o final são fixos na tela.
   Nenhuma palavra passa de ~6% da tela; BUILD 2030 é a exceção.
   ------------------------------------------------------------ */

type Props = { anchors: () => Anchor[]; support: "a" | "b" };

type Item = {
  id: string;
  show: (P: number) => number;
  occlude?: boolean;
};

const nodeT = (i: number, n: number) => 0.22 + (i / (n - 1)) * 0.74;

const ITEMS: Item[] = [
  ...PARTS.map<Item>((p) => ({ id: p.id, show: (P) => seg(P, p.at, p.at + M.partRamp, EASE.out) * (1 - 0.45 * seg(P, M.finaleIn, M.finaleIn + 0.04)), occlude: true })),
  { id: "core", show: (P) => seg(P, M.directionLabel, M.directionLabel + 0.035, EASE.out) },
  ...ATTRS.map<Item>((_, i) => ({ id: `attr-${i}`, show: (P) => seg(P, M.attrs + i * M.attrStagger, M.attrs + 0.03 + i * M.attrStagger, EASE.out) })),
  { id: "aera", show: (P) => seg(P, M.aera, M.aera + 0.03, EASE.out) },
  { id: "headline", show: (P) => pulse(P, M.headIn, M.headIn + 0.03, M.headOut, M.headOut + 0.03, EASE.out, EASE.expoIn) },
  { id: "branch-a", show: (P) => seg(P, M.branchA.name, M.branchA.name + 0.03, EASE.out) },
  { id: "branch-b", show: (P) => seg(P, M.branchB.name, M.branchB.name + 0.03, EASE.out) },
  ...BRANCH_A.nodes.map<Item>((_, i, arr) => ({
    id: `a-${i}`,
    show: (P) => seg(seg(P, M.branchA.draw, M.branchA.full, EASE.cinematic), nodeT(i, arr.length) - 0.02, nodeT(i, arr.length) + 0.04) * (1 - seg(P, M.finaleIn - 0.01, M.finaleIn + 0.03)),
  })),
  ...BRANCH_B.nodes.map<Item>((_, i, arr) => ({
    id: `b-${i}`,
    show: (P) => seg(seg(P, M.branchB.draw, M.branchB.full, EASE.cinematic), nodeT(i, arr.length) - 0.02, nodeT(i, arr.length) + 0.04) * (1 - seg(P, M.finaleIn - 0.01, M.finaleIn + 0.03)),
  })),
];

const nameStyle = (vw: string) => ({
  fontSize: `clamp(16px, ${vw}, 30px)`,
  fontWeight: 600,
  fontStretch: "106%",
  letterSpacing: "-0.03em",
  lineHeight: 1,
});

export const AnnotationLayer = forwardRef<LayerHandle, Props>(
  function AnnotationLayer({ anchors, support }, ref) {
    const presents = useRef<HTMLDivElement | null>(null);
    const logo = useRef<HTMLDivElement | null>(null);
    const finale = useRef<HTMLDivElement | null>(null);
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

          const pr = pulse(P, M.presentsIn - 0.012, M.presentsIn, M.presentsHold, M.presentsOut, EASE.out, EASE.expoIn) * seg(tt, 500, 1800);
          setOpacity(presents.current, pr);
          const lg = pulse(P, M.logoIn, M.logoIn + 0.03, M.logoHold, M.logoOut, EASE.out, EASE.expoIn);
          setOpacity(logo.current, lg);

          const byId = new Map(anchors().map((x) => [x.id, x]));
          ITEMS.forEach((it) => {
            const el = els.current[it.id];
            const an = byId.get(it.id);
            if (!el || !an) return;
            const o = it.show(P) * an.visible * (it.occlude && an.occluded ? 0.22 : 1);
            setOpacity(el, o);
            setTransform(el, `translate3d(${an.x.toFixed(1)}px, ${an.y.toFixed(1)}px, 0)`);
          });

          const fi = seg(P, M.finaleIn, M.finaleIn + 0.04, EASE.out);
          setOpacity(finale.current, fi);
          setTransform(finale.current, `translate3d(-50%, ${((1 - fi) * 0.03 * H).toFixed(1)}px, 0)`);
        },
      }),
      [anchors],
    );

    const bind = (id: string) => (e: HTMLDivElement | null) => {
      els.current[id] = e;
    };
    const anchored = "absolute left-0 top-0 flex -translate-y-full flex-col gap-1.5 pb-3";
    const tickLine = <span aria-hidden className="ml-px block h-5 w-px bg-[var(--white)] opacity-50" />;

    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        <div ref={presents} className="absolute bottom-[14vh] left-[6vw]" style={{ opacity: 0 }}>
          <EditorialLabel tick tone="white">AERA apresenta</EditorialLabel>
        </div>
        <div ref={logo} className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0 }}>
          <BrandMark width={300} />
        </div>

        {PARTS.map((p) => (
          <div key={p.id} ref={bind(p.id)} className={anchored} style={{ opacity: 0, willChange: "transform, opacity" }}>
            <EditorialLabel tone="white">{p.label}</EditorialLabel>
            {tickLine}
          </div>
        ))}

        <div ref={bind("core")} className={anchored} style={{ opacity: 0 }}>
          <span className="display text-[var(--white)]" style={{ ...nameStyle("1.6vw"), fontWeight: 620, fontStretch: "108%" }}>DIRECTION</span>
          {tickLine}
        </div>
        {ATTRS.map((t, i) => (
          <div key={t} ref={bind(`attr-${i}`)} className={anchored} style={{ opacity: 0 }}>
            <EditorialLabel>{t}</EditorialLabel>
            {tickLine}
          </div>
        ))}
        <div ref={bind("aera")} className={anchored} style={{ opacity: 0 }}>
          <EditorialLabel tick tone="signal">AERA / DIRECTION</EditorialLabel>
          {tickLine}
        </div>
        <div
          ref={bind("headline")}
          className="display absolute left-0 top-0 -translate-y-full text-[var(--white)]"
          style={{ fontSize: "clamp(20px, 2.2vw, 36px)", fontWeight: 500, fontStretch: "100%", letterSpacing: "-0.02em", lineHeight: 1.12, opacity: 0, willChange: "transform, opacity" }}
        >
          Não é sobre substituir.
          <br />
          É sobre conectar.
        </div>

        <div ref={bind("branch-a")} className={anchored} style={{ opacity: 0 }}>
          <EditorialLabel>Marketing</EditorialLabel>
          <span className="display text-[var(--white)]" style={nameStyle("1.8vw")}>{BRANCH_A.name}</span>
        </div>
        <div ref={bind("branch-b")} className={`${anchored} -translate-x-full items-end pr-3`} style={{ opacity: 0 }}>
          <EditorialLabel>Inteligência</EditorialLabel>
          <span className="display text-[var(--white)]" style={nameStyle("1.8vw")}>{BRANCH_B.name}</span>
        </div>
        {BRANCH_A.nodes.map((n, i) => (
          <div key={`a-${n}`} ref={bind(`a-${i}`)} className={anchored} style={{ opacity: 0 }}>
            <EditorialLabel>{n}</EditorialLabel>
          </div>
        ))}
        {BRANCH_B.nodes.map((n, i) => (
          <div key={`b-${n}`} ref={bind(`b-${i}`)} className={anchored} style={{ opacity: 0 }}>
            <EditorialLabel>{n}</EditorialLabel>
          </div>
        ))}

        {/* 08 · BUILD 2030: a única exceção de escala */}
        <div ref={finale} className="absolute bottom-[12vh] left-1/2 flex flex-col items-center gap-5" style={{ opacity: 0, transform: "translate3d(-50%, 0, 0)" }}>
          <BrandMark width={220} />
          <span className="display text-[var(--white)]" style={{ fontSize: "clamp(40px, 6vw, 104px)", fontWeight: 680, fontStretch: "110%", letterSpacing: "-0.04em", lineHeight: 0.95 }}>BUILD 2030</span>
          <EditorialLabel tone="signal">{SUPPORT_LINES[support]}</EditorialLabel>
        </div>
      </div>
    );
  },
);
