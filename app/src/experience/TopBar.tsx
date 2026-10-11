"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { BrandMark } from "@/components/primitives/BrandMark";
import { EditorialLabel } from "@/components/primitives/EditorialLabel";
import { seg } from "@/motion/math";
import { setOpacity, setTransform } from "@/motion/dom";
import type { ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "./layer";
import { BLOCK_LABELS, JOURNEY_TOTAL, activeBlock, progressOf } from "./journey";
import { M } from "@/world/moments";

/**
 * Barra mínima e permanente: marca oficial pequena (depois que a marca
 * central sai), `AERA × GAVEA` e o índice do bloco. Linha de progresso de 1 px.
 */
export const TopBar = forwardRef<LayerHandle, object>(function TopBar(
  _props,
  ref,
) {
  const logo = useRef<HTMLDivElement | null>(null);
  const right = useRef<HTMLDivElement | null>(null);
  const index = useRef<HTMLSpanElement | null>(null);
  const progress = useRef<HTMLDivElement | null>(null);
  const lastLabel = useRef("");

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const P = progressOf(s.j);
        setOpacity(logo.current, seg(P, M.logoOut + 0.01, M.logoOut + 0.04) * (1 - seg(P, M.lockupIn - 0.02, M.lockupIn)));
        setOpacity(right.current, seg(P, M.logoOut + 0.01, M.logoOut + 0.05));
        setTransform(progress.current, `scaleX(${Math.min(1, s.j / JOURNEY_TOTAL).toFixed(4)})`);
        const label = BLOCK_LABELS[activeBlock(s.j).id];
        if (label !== lastLabel.current && index.current) {
          lastLabel.current = label;
          index.current.textContent = label;
        }
      },
    }),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--white)] opacity-[0.08]" />
      <div
        ref={progress}
        className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--teal-signal)]"
        style={{ transform: "scaleX(0)" }}
      />
      <div ref={logo} className="absolute" style={{ left: 28, top: 22, opacity: 0 }}>
        <BrandMark width={132} />
      </div>
      <div
        ref={right}
        className="absolute right-7 top-6 flex items-center gap-6"
        style={{ opacity: 0 }}
      >
        <EditorialLabel>AERA × GAVEA</EditorialLabel>
        <EditorialLabel tone="white">
          <span ref={index}>01 / Chegada</span>
        </EditorialLabel>
      </div>
    </div>
  );
});
