/* ============================================================
   SCROLL STORE
   Um único listener de scroll/resize e um único rAF por frame.
   Todas as camadas assinam aqui. Ninguém mais escuta `scroll`.
   ============================================================ */

export type ScrollState = {
  y: number;
  vw: number;
  vh: number;
  /** Jornada em unidades de viewport: y / vh. */
  j: number;
  /** Timestamp do frame (ms). */
  t: number;
  /** Delta de tempo desde o último tick (ms). */
  dt: number;
};

type Listener = (s: ScrollState) => void;

const listeners = new Set<Listener>();
let state: ScrollState = { y: 0, vw: 0, vh: 0, j: 0, t: 0, dt: 16 };
let ticking = false;
let started = false;
let lastT = 0;

const measure = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const y = window.scrollY || 0;
  state = { ...state, y, vw, vh, j: vh > 0 ? y / vh : 0 };
};

const flush = (t: number) => {
  ticking = false;
  measure();
  state.dt = lastT ? Math.min(100, t - lastT) : 16;
  state.t = t;
  lastT = t;
  listeners.forEach((l) => l(state));
};

const request = () => {
  if (ticking || liveRaf) return;
  ticking = true;
  requestAnimationFrame(flush);
};

/* Vida autônoma: enquanto alguma camada pedir `live`, o loop roda a cada
   frame mesmo sem scroll (pré-roll do hero, órbita de DIRECTION). */
const liveKeys = new Set<string>();
let liveRaf = 0;
const liveLoop = (t: number) => {
  liveRaf = 0;
  if (liveKeys.size === 0) return;
  flush(t);
  liveRaf = requestAnimationFrame(liveLoop);
};

const start = () => {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  request();
};

export const scrollStore = {
  subscribe(fn: Listener) {
    start();
    listeners.add(fn);
    // Entrega o estado atual no próximo frame para a camada se posicionar.
    request();
    return () => {
      listeners.delete(fn);
    };
  },
  get(): ScrollState {
    return state;
  },
  /** Força um tick (ex.: depois de uma mídia carregar). */
  invalidate: request,
  /** Liga/desliga ticks contínuos para uma camada. */
  setLive(key: string, on: boolean) {
    if (on) {
      if (!liveKeys.has(key)) {
        liveKeys.add(key);
        if (!liveRaf) liveRaf = requestAnimationFrame(liveLoop);
      }
    } else {
      liveKeys.delete(key);
    }
  },
};
