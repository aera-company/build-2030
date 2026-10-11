"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import type { ImageSource, VideoSource } from "@/lib/media";
import { EditorialLabel } from "./EditorialLabel";

/**
 * Janela de material real: um recorte com vídeo curto (ou imagem) e um label
 * editorial. Sem borda, sem radius, sem HUD. A camada-mãe decide posição,
 * escala e opacidade via `el`, e liga/desliga o vídeo via `setActive`.
 */
export type MediaWindowHandle = {
  el: HTMLDivElement | null;
  setActive: (on: boolean) => void;
};

type Props = {
  source: VideoSource | ImageSource;
  /** Índice editorial, ex.: "01". */
  index?: string;
  /** Nome do material, ex.: "Mar". */
  label?: string;
  labelPlacement?: "below" | "above" | "inside";
  /** `auto` para janelas do hero (não podem ficar pretas). */
  preload?: "metadata" | "auto";
  className?: string;
  style?: CSSProperties;
};

export const MediaWindow = forwardRef<MediaWindowHandle, Props>(
  function MediaWindow(
    { source, index, label, labelPlacement = "below", preload = "metadata", className, style },
    ref,
  ) {
    const root = useRef<HTMLDivElement | null>(null);
    const video = useRef<HTMLVideoElement | null>(null);
    const active = useRef(false);
    const reduced = useRef(false);

    useEffect(() => {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        get el() {
          return root.current;
        },
        setActive(on: boolean) {
          if (on === active.current) return;
          active.current = on;
          const v = video.current;
          if (!v || reduced.current) return;
          if (on) {
            const p = v.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          } else {
            v.pause();
          }
        },
      }),
      [],
    );

    const caption =
      label || index ? (
        <EditorialLabel
          index={index}
          className={
            labelPlacement === "inside"
              ? "absolute left-3 top-3"
              : labelPlacement === "above"
                ? "absolute -top-6 left-0"
                : "absolute -bottom-6 left-0"
          }
        >
          {label}
        </EditorialLabel>
      ) : null;

    return (
      <div
        ref={root}
        className={`absolute ${className ?? ""}`}
        style={{ willChange: "transform, opacity", ...style }}
      >
        <div
          className="relative w-full overflow-hidden bg-[var(--navy-deep)]"
          style={{ aspectRatio: String(source.aspect) }}
        >
          {source.type === "video" ? (
            <>
              {/* poster por baixo: o vídeo nunca mostra preto */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.poster}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <video
                ref={video}
                src={source.src}
                poster={source.poster}
                muted
                loop
                playsInline
                preload={preload}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={source.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* leve grade navy para o material ficar no mesmo mundo */}
          <div className="pointer-events-none absolute inset-0 bg-[var(--navy)] opacity-[0.18] mix-blend-multiply" />
        </div>
        {caption}
      </div>
    );
  },
);
