"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { SequenceSource } from "@/lib/media";
import { scrollStore } from "@/motion/scroll-store";

/**
 * Sequência de frames num <canvas>, dirigida por progresso.
 *
 * Herdado da base (e mantido): cover-fit, DPR ≤ 2, desenho só quando o índice
 * muda, nada de React state no caminho quente.
 *
 * Novo: carregamento progressivo (keyframes a cada 6 primeiro, depois o resto),
 * poster imediato por <img>, desenho do frame carregado mais próximo, decode()
 * fora da main thread, reduced-motion = só o poster.
 *
 * A fonte é um `SequenceSource` do manifesto: trocar a mídia não toca aqui.
 */
export type FrameSequenceHandle = {
  /** Progresso 0–1 ao longo da sequência. */
  setProgress: (p: number) => void;
  /** Índice do frame desenhado por último (debug). */
  currentFrame: () => number;
  /** Fração carregada 0–1 (debug). */
  loaded: () => number;
};

type Props = {
  source: SequenceSource;
  /** Zoom extra aplicado no desenho (além do cover). */
  zoom?: number;
  className?: string;
};

const KEY_STEP = 6;
const PARALLEL = 4;

export const FrameSequence = forwardRef<FrameSequenceHandle, Props>(
  function FrameSequence({ source, zoom = 1, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgs = useRef<(HTMLImageElement | null)[]>([]);
    const ready = useRef<boolean[]>([]);
    const loadedCount = useRef(0);
    const wanted = useRef(0);
    const drawn = useRef(-1);
    const reduced = useRef(false);

    const draw = useCallback(
      (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // frame carregado mais próximo do pedido
        let i = -1;
        for (let d = 0; d < source.count; d++) {
          const a = index - d;
          const b = index + d;
          if (a >= 0 && ready.current[a]) {
            i = a;
            break;
          }
          if (b < source.count && ready.current[b]) {
            i = b;
            break;
          }
        }
        if (i < 0 || i === drawn.current) return;
        const img = imgs.current[i];
        if (!img) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const cw = canvas.width;
        const ch = canvas.height;
        const ir = img.naturalWidth / img.naturalHeight;
        const cr = cw / ch;
        let w: number;
        let h: number;
        if (cr > ir) {
          w = cw;
          h = cw / ir;
        } else {
          h = ch;
          w = ch * ir;
        }
        w *= zoom;
        h *= zoom;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        drawn.current = i;
      },
      [source.count, zoom],
    );

    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      drawn.current = -1;
      draw(wanted.current);
    }, [draw]);

    useEffect(() => {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, [resize]);

    // Carregamento progressivo.
    useEffect(() => {
      let cancelled = false;
      const n = source.count;
      imgs.current = new Array(n).fill(null);
      ready.current = new Array(n).fill(false);
      loadedCount.current = 0;

      const order: number[] = [];
      for (let i = 0; i < n; i += KEY_STEP) order.push(i);
      for (let i = 0; i < n; i++) if (i % KEY_STEP !== 0) order.push(i);
      if (reduced.current) order.length = 1;

      let cursor = 0;
      const next = () => {
        if (cancelled || cursor >= order.length) return;
        const i = order[cursor++];
        const img = new Image();
        img.decoding = "async";
        img.src = source.path(i + 1);
        const done = () => {
          if (cancelled) return;
          ready.current[i] = true;
          imgs.current[i] = img;
          loadedCount.current++;
          // redesenha se o frame novo está mais perto do pedido
          const want = wanted.current;
          if (drawn.current < 0 || Math.abs(i - want) < Math.abs(drawn.current - want)) {
            drawn.current = -1;
            draw(want);
          }
          next();
        };
        img.onload = () => {
          if (typeof img.decode === "function") {
            img.decode().then(done, done);
          } else done();
        };
        img.onerror = () => {
          if (cancelled) return;
          next();
        };
      };
      for (let k = 0; k < PARALLEL; k++) next();

      return () => {
        cancelled = true;
      };
    }, [source, draw]);

    useImperativeHandle(
      ref,
      () => ({
        setProgress(p: number) {
          const idx = Math.min(
            source.count - 1,
            Math.max(0, Math.floor(p * source.count)),
          );
          wanted.current = reduced.current ? 0 : idx;
          draw(wanted.current);
        },
        currentFrame: () => drawn.current,
        loaded: () => loadedCount.current / source.count,
      }),
      [draw, source.count],
    );

    // Quando o primeiro frame chega, pede um tick para as camadas se alinharem.
    useEffect(() => {
      const id = window.setTimeout(() => scrollStore.invalidate(), 50);
      return () => window.clearTimeout(id);
    }, []);

    return (
      <div className={`absolute inset-0 ${className ?? ""}`}>
        {/* Poster imediato, sem JS. O canvas cobre por cima quando desenha. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source.poster}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${zoom})` }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ willChange: "contents" }}
        />
      </div>
    );
  },
);
