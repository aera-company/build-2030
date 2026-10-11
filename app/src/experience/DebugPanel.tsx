"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { scrollStore, type ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "./layer";
import { JOURNEY_TOTAL, activeBlock, progressOf } from "./journey";

/**
 * Painel de desenvolvimento. Só com `?debug=1`. Nunca em produção.
 * Mostra jornada, bloco, progresso local, estado do hero, frame, viewport, FPS.
 */
type Props = { sources: () => Record<string, string | number> };

export const DebugPanel = forwardRef<LayerHandle, Props>(function DebugPanel(
  { sources },
  ref,
) {
  const pre = useRef<HTMLPreElement | null>(null);
  const frames = useRef(0);
  const fpsT = useRef(0);
  const fps = useRef(0);
  const lastWrite = useRef(0);

  useEffect(() => {
    scrollStore.invalidate();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        frames.current++;
        if (s.t - fpsT.current >= 500) {
          fps.current = Math.round((frames.current * 1000) / (s.t - fpsT.current));
          frames.current = 0;
          fpsT.current = s.t;
        }
        if (s.t - lastWrite.current < 80 || !pre.current) return;
        lastWrite.current = s.t;
        const b = activeBlock(s.j);
        const rows: Record<string, string | number> = {
          scroll: `${Math.round(s.y)}px / ${Math.round((s.j / JOURNEY_TOTAL) * 100)}%`,
          journey: `${s.j.toFixed(3)} / ${JOURNEY_TOTAL}`,
          progress: progressOf(s.j).toFixed(3),
          block: `${b.id} (${b.index + 1}/4)`,
          ...sources(),
          viewport: `${s.vw} × ${s.vh}`,
          fps: fps.current,
        };
        pre.current.textContent = Object.entries(rows)
          .map(([k, v]) => `${k.padEnd(14)} ${v}`)
          .join("\n");
      },
    }),
    [sources],
  );

  return (
    <pre
      ref={pre}
      className="pointer-events-none absolute bottom-4 left-4 z-[60] m-0 whitespace-pre bg-[rgba(5,15,26,0.8)] px-3 py-2 font-mono text-[10px] leading-[1.5] text-[var(--white)]"
      style={{ letterSpacing: 0 }}
    />
  );
});
