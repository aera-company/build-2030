"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrollStore, type ScrollState } from "@/motion/scroll-store";
import { seg } from "@/motion/math";
import { EASE } from "@/motion/tokens";
import type { LayerHandle } from "./layer";
import { JOURNEY_TOTAL } from "./journey";
import { WorldLayer, type WorldHandle } from "./layers/WorldLayer";
import { AnnotationLayer } from "./layers/AnnotationLayer";
import { TopBar } from "./TopBar";
import { DebugPanel } from "./DebugPanel";

/**
 * Um palco fixo, um spacer alto, um loop. O mundo (WebGL) embaixo, as
 * anotações HTML por cima. A jornada é medida em viewports (`journey.ts`).
 *
 * Pré-roll: sem scroll, o tempo leva a entrada até o fim da marca;
 * `max(j, jAuto)` garante que o scroll assume sem salto.
 *
 * Parâmetros de desenvolvimento (nunca em produção):
 * `?debug=1` painel · `?at=0.45` abre em 45%
 * `?capture=1` expõe `window.__b2030` para o script de captura.
 */
type CaptureApi = {
  ready: () => boolean;
  goto: (P: number) => void;
  play: (ms: number) => Promise<void>;
  /** Render determinístico de um frame: P e tempo (ms) fixos, sem scroll nem relógio. */
  render: (P: number, tMs: number) => void;
};

declare global {
  interface Window {
    __b2030?: CaptureApi;
  }
}

export function Experience() {
  const world = useRef<WorldHandle | null>(null);
  const notes = useRef<LayerHandle | null>(null);
  const top = useRef<LayerHandle | null>(null);
  const debug = useRef<LayerHandle | null>(null);
  const [spacer, setSpacer] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [plate, setPlate] = useState(false);
  const bootT = useRef(-1);
  const preroll = useRef(true);
  const fixed = useRef<{ P: number; t: number } | null>(null);

  useEffect(() => {
    const size = () => setSpacer((JOURNEY_TOTAL + 1) * window.innerHeight);
    const params = new URLSearchParams(window.location.search);
    const at = params.get("at");
    const id = requestAnimationFrame(() => {
      size();
      setShowDebug(params.get("debug") === "1");
      setPlate(params.get("plate") === "1");
      if (at !== null) {
        preroll.current = false;
        const P = Math.min(1, Math.max(0, Number(at)));
        window.scrollTo(0, P * JOURNEY_TOTAL * window.innerHeight);
      }
      if (params.get("capture") === "1") {
        preroll.current = false;
        window.__b2030 = {
          ready: () => (world.current?.frames?.() ?? 0) > 5,
          goto: (P) => {
            window.scrollTo(0, Math.min(1, Math.max(0, P)) * JOURNEY_TOTAL * window.innerHeight);
            scrollStore.invalidate();
          },
          render: (P, tMs) => {
            fixed.current = { P: Math.min(1, Math.max(0, P)), t: tMs };
            window.scrollTo(0, fixed.current.P * JOURNEY_TOTAL * window.innerHeight);
            scrollStore.invalidate();
          },
          play: (ms) =>
            new Promise((resolve) => {
              const max = JOURNEY_TOTAL * window.innerHeight;
              const t0 = performance.now();
              const step = (now: number) => {
                const k = Math.min(1, (now - t0) / ms);
                window.scrollTo(0, k * max);
                if (k < 1) requestAnimationFrame(step);
                else resolve();
              };
              requestAnimationFrame(step);
            }),
        };
      }
    });
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", size);
    };
  }, []);

  useEffect(() => {
    const tick = (s: ScrollState) => {
      if (bootT.current < 0) bootT.current = s.t;
      let j = s.j;
      if (preroll.current) {
        const tt = s.t - bootT.current;
        const jAuto = 0.14 * JOURNEY_TOTAL * seg(tt, 1200, 7800, EASE.cinematic);
        if (s.j > 0.05) preroll.current = false;
        j = Math.max(j, jAuto);
      }
      let eff: ScrollState = j === s.j ? s : { ...s, j };
      if (fixed.current) {
        const fx = fixed.current;
        eff = { ...s, j: fx.P * JOURNEY_TOTAL, t: fx.t, dt: 33 };
        bootT.current = 0;
      }
      world.current?.tick(eff);
      notes.current?.tick(eff);
      top.current?.tick(eff);
      debug.current?.tick(eff);
    };
    return scrollStore.subscribe(tick);
  }, []);

  const anchors = useCallback(() => world.current?.anchors() ?? [], []);
  const debugSources = useCallback(() => world.current?.debug?.() ?? {}, []);

  return (
    <>
      <div aria-hidden style={{ height: spacer ?? `${(JOURNEY_TOTAL + 1) * 100}vh` }} />
      <div className="fixed inset-0 overflow-hidden bg-[var(--navy-deep)]">
        <WorldLayer ref={world} />
        {plate ? null : <AnnotationLayer ref={notes} anchors={anchors} />}
        {plate ? null : <TopBar ref={top} />}
        {showDebug ? <DebugPanel ref={debug} sources={debugSources} /> : null}
      </div>
    </>
  );
}
