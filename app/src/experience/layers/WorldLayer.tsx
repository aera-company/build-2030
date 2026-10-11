"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { World, type Anchor } from "@/world/World";
import { scrollStore, type ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "../layer";
import { progressOf } from "../journey";

/**
 * O mundo (WebGL) dentro do palco. Recebe o tick do loop único, atualiza a
 * câmera e a cena, renderiza, e publica as âncoras projetadas para a camada
 * de anotações. Sempre vivo: o mundo respira mesmo sem scroll.
 */
export type WorldHandle = LayerHandle & {
  anchors: () => Anchor[];
};

export const WorldLayer = forwardRef<WorldHandle, object>(function WorldLayer(
  _props,
  ref,
) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const world = useRef<World | null>(null);
  const anchors = useRef<Anchor[]>([]);

  useEffect(() => {
    if (!canvas.current) return;
    const w = new World(canvas.current);
    world.current = w;
    const onResize = () => w.resize();
    window.addEventListener("resize", onResize);
    scrollStore.setLive("world", true);
    scrollStore.invalidate();
    return () => {
      scrollStore.setLive("world", false);
      window.removeEventListener("resize", onResize);
      w.dispose();
      world.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const w = world.current;
        if (!w) return;
        w.update(progressOf(s.j), s.t);
        anchors.current = w.anchors(s.vw, s.vh);
      },
      anchors: () => anchors.current,
      debug: () => world.current?.debug() ?? {},
    }),
    [],
  );

  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 z-0 block h-full w-full"
      aria-hidden
    />
  );
});
