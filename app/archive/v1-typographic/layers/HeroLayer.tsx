"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  FrameSequence,
  type FrameSequenceHandle,
} from "@/components/primitives/FrameSequence";
import {
  MediaWindow,
  type MediaWindowHandle,
} from "@/components/primitives/MediaWindow";
import {
  MotionType,
  type MotionTypeHandle,
} from "@/components/primitives/MotionType";
import { EditorialLabel } from "@/components/primitives/EditorialLabel";
import { BrandMark } from "@/components/primitives/BrandMark";
import { HERO_SEQUENCE, CLIPS, BRAND } from "@/lib/media";
import { seg, pulse, lerp, clamp } from "@/motion/math";
import { EASE, SCALE, VEIL } from "@/motion/tokens";
import { setOpacity, setTransform, setVisible } from "@/motion/dom";
import { scrollStore, type ScrollState } from "@/motion/scroll-store";
import type { LayerHandle } from "../layer";
import { localRaw } from "../journey";
import { trajectoryAt, toPx, pointOn } from "../trajectory-path";

/* ------------------------------------------------------------
   HERO · 01 / ENTRADA
   Estados (p = progresso local 0–1 em ~320vh):
   OPENING        0.00–0.10  navy, material macro, `AERA apresenta`
   LOGO           0.10–0.26  marca oficial, intacta, o mundo segue atrás
   ACCELERATION   0.26–0.40  logo vai ao canto, linha deixa o logo
   TRANSFORMATION 0.30–0.67  janelas de material: mar, aço, porto, operação
   REVEAL         0.52–0.70  BUILD, depois 2030, material dentro das letras
   HOLD           0.70–0.86  palavras percorrem a trajetória e viram frase
   HAND-OFF       0.86–1.00  câmera entra no material; navy; conectar começa
   ------------------------------------------------------------ */

const WINDOWS = [
  { key: "mar", idx: "01", label: "Mar", src: CLIPS.mar, x: 6, y: 16, w: 30, a: 0.34, b: 0.39, c: 0.48, d: 0.52 },
  { key: "aco", idx: "02", label: "Aço", src: CLIPS.aco, x: 57, y: 17, w: 37, a: 0.39, b: 0.44, c: 0.53, d: 0.57 },
  { key: "porto", idx: "03", label: "Porto", src: CLIPS.porto, x: 19, y: 60, w: 26, a: 0.44, b: 0.49, c: 0.58, d: 0.62 },
  { key: "operacao", idx: "04", label: "Operação", src: CLIPS.operacao, x: 61, y: 62, w: 29, a: 0.49, b: 0.54, c: 0.63, d: 0.67 },
] as const;

const TRAVELERS = ["direção", "marketing", "negócio", "inteligência"] as const;

const STATE_NAMES: [number, string][] = [
  [0.10, "OPENING"],
  [0.26, "LOGO"],
  [0.40, "ACCELERATION"],
  [0.52, "TRANSFORMATION"],
  [0.70, "REVEAL"],
  [0.86, "HOLD"],
  [1.01, "HAND-OFF"],
];

/** Progresso da sequência de frames por estado: lento, rápido, lento. */
const frameP = (p: number) => {
  const k: [number, number][] = [
    [0, 0],
    [0.26, 0.14],
    [0.52, 0.58],
    [0.7, 0.8],
    [0.84, 0.88],
    [1, 1],
  ];
  for (let i = 0; i < k.length - 1; i++) {
    const [a, fa] = k[i];
    const [b, fb] = k[i + 1];
    if (p <= b) return lerp(fa, fb, clamp((p - a) / (b - a)));
  }
  return 1;
};

export const HeroLayer = forwardRef<LayerHandle, object>(function HeroLayer(
  _props,
  ref,
) {
  const root = useRef<HTMLDivElement | null>(null);
  const world = useRef<HTMLDivElement | null>(null);
  const veil = useRef<HTMLDivElement | null>(null);
  const frames = useRef<FrameSequenceHandle | null>(null);
  const presents = useRef<HTMLDivElement | null>(null);
  const scrollHint = useRef<HTMLDivElement | null>(null);
  const logo = useRef<HTMLDivElement | null>(null);
  const windows = useRef<(MediaWindowHandle | null)[]>([]);
  const row = useRef<HTMLDivElement | null>(null);
  const build = useRef<MotionTypeHandle | null>(null);
  const year = useRef<MotionTypeHandle | null>(null);
  const sentence = useRef<HTMLDivElement | null>(null);
  const keySpans = useRef<(HTMLSpanElement | null)[]>([]);
  const restSpans = useRef<(HTMLSpanElement | null)[]>([]);
  const travelers = useRef<(HTMLDivElement | null)[]>([]);
  const footLabel = useRef<HTMLDivElement | null>(null);
  const keyRects = useRef<{ x: number; y: number }[] | null>(null);
  const stateName = useRef("OPENING");
  const lastP = useRef(0);
  const bootT = useRef(-1);

  const [vw, setVw] = useState(1440);

  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth);
      keyRects.current = null;
    };
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const logoW = Math.min(vw * 0.34, 520);
  const logoH = (logoW * BRAND.groupHorizontalWhite.height) / BRAND.groupHorizontalWhite.width;
  const typeSize = Math.round(vw * 0.128);

  useImperativeHandle(
    ref,
    () => ({
      tick(s: ScrollState) {
        const pScroll = localRaw(s.j, "hero");
        if (bootT.current < 0) bootT.current = s.t;
        const tt = s.t - bootT.current;
        // Pré-roll: sem scroll, o tempo leva a abertura até o logo (p 0.2).
        // Depois disso só o scroll avança. max() evita qualquer salto.
        const pAuto = 0.2 * seg(tt, 1600, 4600, EASE.cinematic);
        const p = Math.max(pScroll, pAuto);
        lastP.current = p;
        const on = p > -0.2 && p < 1.08;
        setVisible(root.current, on);
        scrollStore.setLive("hero", on && p < 0.3);
        if (!on) {
          // filhos com visibility explícita não herdam o hidden do root
          setVisible(row.current, false);
          setVisible(sentence.current, false);
          windows.current.forEach((w) => w?.setActive(false));
          build.current?.setActive(false);
          year.current?.setActive(false);
          return;
        }
        const W = s.vw;
        const H = s.vh;
        stateName.current =
          STATE_NAMES.find(([lim]) => p < lim)?.[1] ?? "HAND-OFF";

        // --- mundo (frames) ---
        // Respiração: o material se move devagar mesmo parado (até p 0.3).
        const breathe = (1 - seg(p, 0.2, 0.3)) * Math.min(0.05, tt * 0.000007);
        frames.current?.setProgress(frameP(clamp(p)) + breathe);
        let sc = lerp(SCALE.macro, SCALE.world, seg(p, 0.08, 0.5, EASE.cinematic));
        sc += (1 - seg(p, 0.2, 0.3)) * 0.008 * Math.sin(tt / 2600);
        sc = lerp(sc, SCALE.dive, seg(p, 0.86, 1.0, EASE.expoIn));
        const panY = lerp(0, -0.02 * H, seg(p, 0.26, 0.62, EASE.inOut));
        setTransform(world.current, `translate3d(0, ${panY.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`);

        // --- véu navy ---
        let v: number = VEIL.opening;
        v = lerp(v, VEIL.logo, seg(p, 0.06, 0.14));
        v = lerp(v, VEIL.world, seg(p, 0.26, 0.44));
        v = lerp(v, VEIL.reveal, seg(p, 0.52, 0.62));
        v = lerp(v, VEIL.dive, seg(p, 0.86, 1.0, EASE.expoIn));
        setOpacity(veil.current, v);

        // --- AERA apresenta + dica de scroll ---
        const pr = pulse(p, -0.01, 0.0, 0.11, 0.15, EASE.expoOut, EASE.expoIn) * seg(tt, 400, 1600);
        setOpacity(presents.current, pr);
        setTransform(presents.current, `translate3d(0, ${((1 - pr) * 6).toFixed(1)}px, 0)`);
        setOpacity(scrollHint.current, seg(tt, 2400, 3600) * (1 - seg(pScroll, 0.01, 0.05)));

        // --- marca oficial: centro → canto (só o wrapper se move) ---
        const lw = Math.min(W * 0.34, 520);
        const lh = (lw * BRAND.groupHorizontalWhite.height) / BRAND.groupHorizontalWhite.width;
        const cx = W / 2 - lw / 2;
        const cy = H / 2 - lh / 2;
        const m = seg(p, 0.23, 0.33, EASE.cinematic);
        const appear = seg(p, 0.11, 0.17, EASE.expoOut);
        const settle = lerp(1.03, 1, seg(p, 0.11, 0.24, EASE.expoOut));
        const cornerScale = 150 / lw;
        const lx = lerp(cx, 28, m);
        const ly = lerp(cy, 22, m);
        const ls = settle * lerp(1, cornerScale, m);
        setTransform(logo.current, `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) scale(${ls.toFixed(4)})`);
        setOpacity(logo.current, appear * (1 - seg(p, 0.985, 1.0)));

        // --- janelas de material ---
        WINDOWS.forEach((w, i) => {
          const h = windows.current[i];
          if (!h?.el) return;
          const o = pulse(p, w.a, w.b, w.c, w.d, EASE.expoOut, EASE.expoIn);
          const sy = lerp(0.04, 1, seg(p, w.a, w.b, EASE.expoOut));
          const drift = -0.035 * H * seg(p, w.a, w.d, EASE.linear);
          const lift = -0.06 * H * seg(p, w.c, w.d, EASE.expoIn);
          setOpacity(h.el, o);
          setTransform(
            h.el,
            `translate3d(${((w.x / 100) * W).toFixed(1)}px, ${((w.y / 100) * H + drift + lift).toFixed(1)}px, 0) scale(1, ${sy.toFixed(4)})`,
          );
          h.setActive(p > w.a - 0.04 && p < w.d + 0.02);
        });

        // --- BUILD 2030 ---
        const showRow = p > 0.5 && p < 1.0;
        setVisible(row.current, showRow);
        if (showRow) {
          const bw = build.current?.width() ?? 0;
          const yw = year.current?.width() ?? 0;
          const gap = typeSize * 0.22;
          const rowW = bw + gap + yw;
          const rowH = typeSize;
          const rx = W / 2 - rowW / 2;
          const ry = H / 2 - rowH / 2;
          const st = seg(p, 0.72, 0.82, EASE.cinematic);
          const rs = lerp(1, SCALE.typeSettle, st);
          const tx = lerp(rx, 0.06 * W, st);
          const ty = lerp(ry, 0.12 * H, st);
          setTransform(row.current, `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${rs.toFixed(4)})`);
          setOpacity(row.current, 1 - seg(p, 0.93, 0.99, EASE.expoIn));

          const bIn = seg(p, 0.52, 0.62, EASE.expoOut);
          setTransform(build.current?.el, `scale(${lerp(SCALE.typeIn, 1, bIn).toFixed(4)})`);
          setOpacity(build.current?.el, seg(p, 0.52, 0.555));
          build.current?.setFill(seg(p, 0.58, 0.68) * (1 - st));

          const yIn = seg(p, 0.6, 0.68, EASE.expoOut);
          setTransform(year.current?.el, `scale(${lerp(0.5, 1, yIn).toFixed(4)})`);
          setOpacity(year.current?.el, seg(p, 0.6, 0.63));
          year.current?.setFill(seg(p, 0.64, 0.72) * (1 - st));
          build.current?.setActive(p > 0.55 && p < 0.85);
          year.current?.setActive(p > 0.6 && p < 0.85);
        } else {
          build.current?.setActive(false);
          year.current?.setActive(false);
        }

        // --- frase: palavras viajam na trajetória e assentam na frase ---
        const showSentence = p > 0.66 && p < 1.0;
        setVisible(sentence.current, showSentence);
        if (showSentence) {
          if (!keyRects.current) {
            keyRects.current = keySpans.current.map((el) => {
              const r = el?.getBoundingClientRect();
              return { x: r?.left ?? 0, y: r?.top ?? 0 };
            });
          }
          const traj = trajectoryAt(s.j);
          const px = toPx(traj.pts, traj.rot, W, H);
          const handoff = seg(p, 0.93, 0.985, EASE.expoIn);
          TRAVELERS.forEach((_, i) => {
            const el = travelers.current[i];
            const ai = 0.70 + i * 0.025;
            const show = seg(p, ai, ai + 0.03, EASE.expoOut);
            const tr = seg(p, 0.78 + i * 0.012, 0.86 + i * 0.012, EASE.cinematic);
            const t = 0.1 + i * 0.17 + 0.06 * seg(p, ai, 0.86, EASE.linear);
            const pt = pointOn(px, t);
            const target = keyRects.current?.[i] ?? { x: pt[0], y: pt[1] };
            const x = lerp(pt[0], target.x, tr);
            const y = lerp(pt[1] - 0.04 * H, target.y, tr);
            const landed = tr >= 0.999;
            setOpacity(el, landed ? 0 : show);
            setTransform(el, `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`);
            const ks = keySpans.current[i];
            setOpacity(ks, landed ? 1 - handoff : 0);
          });
          const rest = seg(p, 0.85, 0.9, EASE.out) * (1 - handoff);
          restSpans.current.forEach((el) => setOpacity(el, rest));
          setTransform(sentence.current, `translate3d(0, ${(-0.02 * H * handoff).toFixed(1)}px, 0) scale(${lerp(1, 1.04, handoff).toFixed(4)})`);
        }

        // --- label de rodapé: material real ---
        const fl = pulse(p, 0.34, 0.38, 0.64, 0.69, EASE.expoOut, EASE.expoIn);
        setOpacity(footLabel.current, fl);
      },
      debug: () => ({
        hero_state: stateName.current,
        hero_p: Number(lastP.current.toFixed(3)),
        frame: frames.current?.currentFrame() ?? -1,
        frames_loaded: `${Math.round((frames.current?.loaded() ?? 0) * 100)}%`,
      }),
    }),
    [typeSize],
  );

  return (
    <div ref={root} className="absolute inset-0 z-0" aria-label="Entrada">
      {/* mundo: material real em movimento */}
      <div
        ref={world}
        className="absolute inset-0"
        style={{ willChange: "transform", transformOrigin: "50% 55%" }}
      >
        <FrameSequence ref={frames} source={HERO_SEQUENCE} />
      </div>
      <div
        ref={veil}
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: VEIL.opening,
          background:
            "linear-gradient(180deg, var(--navy-deep) 0%, var(--navy) 40%, var(--navy) 100%)",
        }}
      />
      {/* leve vinheta lateral para a tipografia respirar */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,15,26,0.55) 0%, rgba(5,15,26,0) 35%, rgba(5,15,26,0) 65%, rgba(5,15,26,0.45) 100%)",
        }}
      />

      {/* AERA apresenta */}
      <div
        ref={presents}
        className="absolute left-[6vw] top-[46vh]"
        style={{ opacity: 0 }}
      >
        <EditorialLabel tick tone="white">AERA apresenta</EditorialLabel>
      </div>
      <div
        ref={scrollHint}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="label text-[var(--muted)]">Role</span>
        <span aria-hidden className="block h-8 w-px bg-[var(--white)] opacity-30" />
      </div>

      {/* marca oficial GAVEA GROUP (intacta) */}
      <div
        ref={logo}
        className="absolute left-0 top-0"
        style={{ opacity: 0, transformOrigin: "0 0", willChange: "transform, opacity" }}
      >
        <BrandMark width={logoW} style={{ height: logoH }} />
      </div>

      {/* janelas de material */}
      {WINDOWS.map((w, i) => (
        <MediaWindow
          key={w.key}
          ref={(h) => {
            windows.current[i] = h;
          }}
          source={w.src}
          index={w.idx}
          label={w.label}
          preload="auto"
          className="left-0 top-0"
          style={{ width: `${w.w}vw`, opacity: 0, transformOrigin: "50% 0" }}
        />
      ))}

      {/* BUILD 2030: tipo como ambiente */}
      <div
        ref={row}
        className="absolute left-0 top-0 flex items-end"
        style={{
          gap: typeSize * 0.22,
          transformOrigin: "0 0",
          willChange: "transform, opacity",
          visibility: "hidden",
        }}
      >
        <MotionType
          ref={build}
          text="BUILD"
          media={CLIPS.cais}
          fontSize={typeSize}
          weight={700}
          stretch={112}
          className="relative"
          style={{ transformOrigin: "50% 60%" }}
        />
        <MotionType
          ref={year}
          text="2030"
          media={CLIPS.mar}
          fontSize={typeSize}
          weight={700}
          stretch={112}
          className="relative"
          style={{ transformOrigin: "50% 60%" }}
        />
      </div>

      {/* frase de apoio */}
      <div
        ref={sentence}
        className="display absolute left-[6vw] top-[42vh] w-[72vw]"
        style={{
          fontSize: "clamp(28px, 4.1vw, 68px)",
          fontWeight: 480,
          fontStretch: "100%",
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          visibility: "hidden",
          willChange: "transform, opacity",
        }}
      >
        <span ref={(e) => { restSpans.current[0] = e; }} style={{ opacity: 0 }}>Uma nova camada de </span>
        <span ref={(e) => { keySpans.current[0] = e; }} style={{ opacity: 0 }}>direção</span>
        <span ref={(e) => { restSpans.current[1] = e; }} style={{ opacity: 0 }}> para conectar </span>
        <span ref={(e) => { keySpans.current[1] = e; }} style={{ opacity: 0 }}>marketing</span>
        <span ref={(e) => { restSpans.current[2] = e; }} style={{ opacity: 0 }}>, </span>
        <span ref={(e) => { keySpans.current[2] = e; }} style={{ opacity: 0 }}>negócio</span>
        <span ref={(e) => { restSpans.current[3] = e; }} style={{ opacity: 0 }}> e </span>
        <span ref={(e) => { keySpans.current[3] = e; }} style={{ opacity: 0 }}>inteligência</span>
        <span ref={(e) => { restSpans.current[4] = e; }} style={{ opacity: 0 }}>.</span>
      </div>
      {TRAVELERS.map((t, i) => (
        <div
          key={t}
          ref={(e) => {
            travelers.current[i] = e;
          }}
          className="display absolute left-0 top-0 whitespace-nowrap"
          style={{
            fontSize: "clamp(28px, 4.1vw, 68px)",
            fontWeight: 480,
            fontStretch: "100%",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          {t}
        </div>
      ))}

      {/* label do material */}
      <div ref={footLabel} className="absolute bottom-7 left-[6vw]" style={{ opacity: 0 }}>
        <EditorialLabel tick>P-35 / Baía de Guanabara / material real</EditorialLabel>
      </div>
    </div>
  );
});
