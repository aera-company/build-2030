"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import type { VideoSource } from "@/lib/media";

/**
 * Tipografia como espaço: uma palavra em display, com material real dentro
 * das letras (clipPath de texto sobre um vídeo). A camada-mãe controla
 * transform/opacity pelo `el` e a quantidade de material pelo `setFill`.
 *
 * Sem material: as letras são brancas sólidas.
 * Com material: o vídeo aparece dentro das letras conforme `fill` (0–1).
 */
export type MotionTypeHandle = {
  el: HTMLDivElement | null;
  setFill: (f: number) => void;
  setActive: (on: boolean) => void;
  /** Largura renderizada do texto (px). */
  width: () => number;
};

type Props = {
  text: string;
  media?: VideoSource;
  /** font-size em px. A camada-mãe recalcula no resize. */
  fontSize: number;
  weight?: number;
  /** font-stretch em % (eixo wdth da Mona Sans: 75–125). */
  stretch?: number;
  letterSpacing?: string;
  className?: string;
  style?: CSSProperties;
};

export const MotionType = forwardRef<MotionTypeHandle, Props>(
  function MotionType(
    {
      text,
      media,
      fontSize,
      weight = 650,
      stretch = 108,
      letterSpacing = "-0.035em",
      className,
      style,
    },
    ref,
  ) {
    const id = useId().replace(/:/g, "");
    const clipId = `clip-${id}`;
    const root = useRef<HTMLDivElement | null>(null);
    const textEl = useRef<SVGTextElement | null>(null);
    const box = useRef<HTMLDivElement | null>(null);
    const video = useRef<HTMLVideoElement | null>(null);
    const fillEl = useRef<HTMLDivElement | null>(null);
    const measured = useRef({ w: 0, h: 0 });
    const active = useRef(false);

    const measure = useCallback(() => {
      const t = textEl.current;
      const b = box.current;
      if (!t || !b) return;
      try {
        const bb = t.getBBox();
        const w = Math.ceil(bb.width + bb.x);
        const h = Math.ceil(fontSize * 1.0);
        measured.current = { w, h };
        b.style.width = `${w}px`;
        b.style.height = `${h}px`;
      } catch {
        /* ainda sem layout */
      }
    }, [fontSize]);

    useEffect(() => {
      measure();
      const t = window.setTimeout(measure, 60);
      document.fonts?.ready.then(measure).catch(() => {});
      return () => window.clearTimeout(t);
    }, [measure, text, weight, stretch]);

    useImperativeHandle(
      ref,
      () => ({
        get el() {
          return root.current;
        },
        setFill(f: number) {
          const v = fillEl.current;
          if (!v) return;
          const s = f <= 0.001 ? "0" : f >= 0.999 ? "1" : f.toFixed(3);
          if (v.style.opacity !== s) v.style.opacity = s;
        },
        setActive(on: boolean) {
          if (on === active.current) return;
          active.current = on;
          const v = video.current;
          if (!v) return;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
          if (on) {
            const p = v.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          } else v.pause();
        },
        width: () => measured.current.w,
      }),
      [],
    );

    const fontStyle: CSSProperties = {
      fontFamily: "var(--font-mona), system-ui, sans-serif",
      fontWeight: weight,
      fontStretch: `${stretch}%`,
      letterSpacing,
      fontSize,
      lineHeight: 1,
    };

    return (
      <div
        ref={root}
        className={`absolute ${className ?? ""}`}
        style={{ willChange: "transform, opacity", ...style }}
      >
        <svg
          aria-hidden
          width={0}
          height={0}
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                ref={textEl}
                x={0}
                y={fontSize * 0.82}
                style={fontStyle}
              >
                {text}
              </text>
            </clipPath>
          </defs>
        </svg>
        <div
          ref={box}
          className="relative overflow-hidden"
          style={{
            clipPath: `url(#${clipId})`,
            WebkitClipPath: `url(#${clipId})`,
            background: "var(--white)",
          }}
          role="img"
          aria-label={text}
        >
          {media ? (
            <div ref={fillEl} className="absolute inset-0" style={{ opacity: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.poster}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <video
                ref={video}
                src={media.src}
                poster={media.poster}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-[var(--navy)] opacity-[0.12] mix-blend-multiply" />
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
