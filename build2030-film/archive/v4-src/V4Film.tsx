/**
 * GAVEA / BUILD 2030 · V4 · um pensamento contínuo.
 * A abertura · B marca, presença, oportunidades · C o real vira informação (este arquivo)
 * D AERA, sistema, movimento (V4Cream) · E tecnologia · F convergência, BUILD 2030, verbos, assinatura (V4Navy).
 * A linha é a mesma do primeiro ao último frame: cada estado dela é função do frame.
 */
import React from 'react';
import {AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from '../components/Grain';
import {C, GRAIN, H, LINE, M, W} from '../motion/design';
import {glide, lerp, lerpLog, leave, partial, pointAt, polyFractions, Pt, pull, ramp, settle} from '../motion/easing';
import {CAM01, COAST, CROP, E0, HORIZON_Y, LOGO, LOGO_W, NODE_X, PIVOT_HALF, RULER_Y, TAG_K1, TAG_K2, TITLE, TITLE_W, WORD_X} from '../motion/geometry';
import {B05_OUT, B05_START, FILM_END, nodeLand, T01, T02, T03, T04, T06, T07, T11} from '../motion/timing';
import {DUO_FILTER, GradeDefs} from '../primitives/Grade';
import {LineMB, LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate, StillImg} from '../primitives/Media';
import {ImpactWord, TickLabel} from '../primitives/Type';
import {WrittenTitle} from '../primitives/WrittenTitle';
import {CreamLayers, CREAM_END} from './V4Cream';
import {NavyLayers} from './V4Navy';
import {V4Audio} from './V4Audio';

/* ================================================================== A · câmera da costa e cabeça que escreve */

const cam01 = (f: number) => {
  const t = ramp(f, T01.cam[0], T01.cam[1], glide);
  return {s: lerp(CAM01.s0, CAM01.s1, t), tx: lerp(CAM01.tx0, CAM01.tx1, t), ty: lerp(CAM01.ty0, CAM01.ty1, t)};
};
const toScreen01 = (f: number, [x, y]: Pt): Pt => {
  const c = cam01(f);
  return [W / 2 + (x - W / 2) * c.s + c.tx, H / 2 + (y - H / 2) * c.s + c.ty];
};
const writeHead = (f: number) => {
  const t = ramp(f, T02.write[0], T02.write[1], (u) => u * u * (3 - 2 * u) * 0.25 + u * 0.75);
  return lerp(TITLE.x, TITLE.x + TITLE_W + 14, t);
};

/* ================================================================== B · três planos, três gestos */

const S = B05_START;
const NEXT = [S[1], S[2], B05_OUT];
const WORDS = ['MARCA.', 'PRESENÇA.', 'OPORTUNIDADES.'];

/** Câmera que entra no recorte da ponte: escala em torno de O leva o recorte à tela inteira. */
const ZOOM = W / CROP.w;
const ORIGIN: Pt = [(CROP.x * ZOOM) / (ZOOM - 1), (CROP.y * ZOOM) / (ZOOM - 1)];
const windowZ = (f: number) => lerpLog(1, ZOOM, ramp(f, T06.window[0], T06.window[1], (u) => glide(u) * 0.35 + pull(u) * 0.65));

const Plane: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const s = S[k];
  switch (k) {
    case 0: {
      // MARCA · a janela sobe da régua; push focal lento; empurrada pela PRESENÇA.
      const p = ramp(f, s - 6, s + 18, settle);
      const q = ramp(f, s - 6, s + 6, settle);
      const shove = ramp(f, NEXT[0] - 2, NEXT[0] + 18, settle);
      return (
        <Plate clip={inset(RULER_Y * (1 - p), 0, (H - RULER_Y) * (1 - q), 0)} cam={{s: lerp(1.0, 1.1, ramp(f, s - 8, NEXT[0] + 20, glide)), tx: -110 * shove, ox: W * 0.56, oy: H * 0.34}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/marca.mp4" from={s - 8} rate={0.8} />
        </Plate>
      );
    }
    case 1: {
      // PRESENÇA · painel entra da direita; o aéreo continua deslizando.
      const p = ramp(f, s - 2, s + 16, settle);
      return (
        <Plate clip={inset(0, 0, 0, W * (1 - p))} cam={{s: 1.08, tx: lerp(170, 0, p) - (f - s) * 1.1}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/presenca.mp4" from={s - 6} rate={0.85} />
        </Plate>
      );
    }
    default: {
      // OPORTUNIDADES · comporta do centro; a proa avança. Congela e vira a origem do conhecimento.
      const p = ramp(f, s - 2, s + 16, settle);
      const half = (W / 2) * (1 - p);
      const z = windowZ(f);
      const fz = ramp(f, T06.freeze, T06.freeze + 6, settle);
      const video = <ClipVideo src="media/v3/oport.mp4" from={s - 4} rate={1.0} />;
      return (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${ORIGIN[0]}px ${ORIGIN[1]}px`}}>
          <Plate clip={inset(0, half, 0, half)} cam={{s: lerp(1.16, 1.03, ramp(f, s - 4, NEXT[2], glide)), ox: W * 0.42, oy: H * 0.56}} filter={`${DUO_FILTER} brightness(${lerp(1, 0.72, fz)})`}>
            {f >= T06.freeze ? <Freeze frame={T06.freeze}>{video}</Freeze> : video}
          </Plate>
        </div>
      );
    }
  }
};

/* ================================================================== C · o real vira informação */

/** O recorte desenhado na ponte; ele cresce e vira a janela do conhecimento. */
const CropWindow: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T06.crop[0] || f > T06.window[1] + 1) return null;
  const draw = ramp(f, T06.crop[0], T06.crop[1], settle);
  const z = windowZ(f);
  const rx = ORIGIN[0] + (CROP.x - ORIGIN[0]) * z;
  const ry = ORIGIN[1] + (CROP.y - ORIGIN[1]) * z;
  const rw = CROP.w * z;
  const rh = CROP.h * z;
  const inside = f >= T06.window[0] - 2;
  return (
    <>
      {inside ? (
        <Plate clip={inset(ry, W - rx - rw, H - ry - rh, rx)} cam={{s: z / ZOOM, ox: ORIGIN[0], oy: ORIGIN[1]}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/conhecimento.mp4" from={T06.window[0] - 2} />
        </Plate>
      ) : null}
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        <rect x={rx} y={ry} width={rw} height={rh} fill="none" stroke={C.tealSoft} strokeWidth={1.5} opacity={1 - ramp(f, T06.window[0] + 4, T06.window[1] - 2)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      </svg>
    </>
  );
};

/** Conhecimento (depois da janela), processos (sobe da régua), inteligência (cortina; fecha sobre a régua). */
const Knowledge: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T06.window[1] || f > T06.collapse[1] + 1) return null;
  const k1 = T06.k1.freeze;
  const conh = <ClipVideo src="media/v3/conhecimento.mp4" from={T06.window[0] - 2} />;
  const p2 = ramp(f, T06.p2 - 4, T06.p2 + 16, settle);
  const q2 = ramp(f, T06.p2 - 4, T06.p2 + 6, settle);
  const proc = <ClipVideo src="media/v3/processos.mp4" from={T06.p2 - 6} />;
  const p3 = ramp(f, T06.p3 - 2, T06.p3 + 18, settle);
  const u3 = ramp(f, T06.p3 - 2, T06.collapse[1], glide);
  const col = ramp(f, T06.collapse[0], T06.collapse[1], leave);
  const clip3 = inset(lerp(0, RULER_Y, col), 0, Math.max(H * (1 - p3), lerp(0, H - RULER_Y, col)), 0);
  return (
    <>
      {f < T06.p2 + 18 ? (
        <Plate cam={{s: lerp(1.0, 1.04, ramp(f, T06.window[1], T06.p2, glide))}} filter={`${DUO_FILTER} brightness(${lerp(1, 0.74, ramp(f, k1, k1 + 6, settle))})`}>
          {f >= k1 ? <Freeze frame={k1}>{conh}</Freeze> : conh}
        </Plate>
      ) : null}
      {f >= T06.p2 - 6 && f < T06.p3 + 20 ? (
        <Plate clip={inset(RULER_Y * (1 - p2), 0, (H - RULER_Y) * (1 - q2), 0)} cam={{s: lerp(1.08, 1.02, ramp(f, T06.p2 - 6, T06.p3, glide))}} filter={`${DUO_FILTER} brightness(${lerp(1, 0.74, ramp(f, T06.k2.freeze, T06.k2.freeze + 6, settle))})`}>
          {f >= T06.k2.freeze ? <Freeze frame={T06.k2.freeze}>{proc}</Freeze> : proc}
        </Plate>
      ) : null}
      {f >= T06.p3 - 3 ? (
        <>
          <Plate clip={clip3} cam={{s: lerp(1.02, 1.09, u3), ty: lerp(-50, 0, p3), oy: H * 0.45}} filter={`${DUO_FILTER} brightness(1.05)`}>
            <StillImg src="media/v3/intel.png" />
          </Plate>
          <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
            <Plate clip={clip3} cam={{s: lerp(1.08, 1.28, u3), tx: lerp(40, -60, u3), ty: lerp(-90, 0, p3), oy: H * 0.45}} filter={`${DUO_FILTER} brightness(1.1) contrast(2.6)`}>
              <StillImg src="media/v3/intel.png" />
            </Plate>
          </div>
        </>
      ) : null}
    </>
  );
};

/** Pontos de luz da inteligência que viram o terceiro nó (coordenadas de tela). */
const INTEL_PT: Pt = [1236, 404];

/** Recortes extraídos do real: congela → recorte etiquetado → encolhe num nó → o nó cai na régua com o nome dito. */
const KTAGS = [
  {tag: TAG_K1, at: T06.k1.tag, det: T06.k1.detach, name: 'Conhecimento'},
  {tag: TAG_K2, at: T06.k2.tag, det: T06.k2.detach, name: 'Processos'},
];

const KnowledgeTags: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T06.k1.tag - 1 || f > T06.rise[0]) return null;
  const items: React.ReactNode[] = [];
  const travel = (key: string, from: Pt, to: Pt, a: number, b: number) => {
    if (f < a || f >= b) return;
    const t = ramp(f, a, b, glide);
    const tp = ramp(f - 1, a, b, glide);
    const x = lerp(from[0], to[0], t);
    const y = lerp(from[1], to[1], t);
    const vx = (x - lerp(from[0], to[0], tp)) * 0.5;
    const vy = (y - lerp(from[1], to[1], tp)) * 0.5;
    items.push(
      <g key={key}>
        <circle cx={x - vx * 2} cy={y - vy * 2} r={5} fill={C.tealSoft} opacity={0.18} />
        <circle cx={x - vx} cy={y - vy} r={5} fill={C.tealSoft} opacity={0.36} />
        <circle cx={x} cy={y} r={5.5} fill={C.head} />
      </g>,
    );
  };
  KTAGS.forEach(({tag, at, det}, k) => {
    if (f < at - 1) return;
    const draw = ramp(f, at, at + 8, settle);
    const shrink = ramp(f, det[0], det[0] + 6, leave);
    const cx = tag.x + tag.w / 2;
    const cy = tag.y + tag.h / 2;
    const rw = tag.w * (1 - shrink);
    const rh = tag.h * (1 - shrink);
    if (rw > 1) items.push(<rect key={`r${k}`} x={cx - rw / 2} y={cy - rh / 2} width={rw} height={rh} fill="none" stroke={C.tealSoft} strokeWidth={1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />);
    travel(`n${k}`, [cx, cy], [NODE_X[k], RULER_Y], det[0] + 4, det[1]);
  });
  // a inteligência: um ponto de luz acende na imagem e cai na régua
  const a3 = T06.node3;
  if (f >= a3 - 4 && f < a3) {
    const g = ramp(f, a3 - 4, a3, settle);
    items.push(<circle key="i3" cx={INTEL_PT[0]} cy={INTEL_PT[1]} r={5.5 * g} fill={C.head} />);
  }
  travel('n2', INTEL_PT, [NODE_X[2], RULER_Y], a3, a3 + 14);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {items}
      </svg>
      {KTAGS.map(({tag, at, det}, k) => (
        <TickLabel key={k} text={tag.label} x={tag.x} y={tag.y - 26} at={at + 4} out={det[0]} size={15} color={C.cream} tracking={0.2} />
      ))}
    </>
  );
};

/* ================================================================== a linha, A → C */

const lineAt = (f: number): LineState | null => {
  const color = C.tealSoft;

  // A1 · nasce da costa, se retifica e pivota.
  if (f < T01.trace[0]) return null;
  if (f < T01.pivot[1]) {
    const seam = COAST.map((p) => toScreen01(f, p));
    const fr = polyFractions(seam);
    const c0 = seam[0];
    const c1 = seam[seam.length - 1];
    const st = ramp(f, T01.straighten[0], T01.straighten[1], glide);
    const pts: Pt[] = seam.map((p, i) => [lerp(p[0], lerp(c0[0], c1[0], fr[i]), st), lerp(p[1], lerp(c0[1], c1[1], fr[i]), st)]);
    const tr = ramp(f, T01.trace[0], T01.trace[1], glide);
    const pv = ramp(f, T01.pivot[0], T01.pivot[1], glide);
    if (pv <= 0) {
      return {pts: partial(pts, tr), color, glow: 0.5 * (1 - st), head: {p: pointAt(pts, tr), o: 1 - ramp(f, T01.trace[1] - 4, T01.trace[1] + 10)}};
    }
    const ang0 = Math.atan2(c1[1] - c0[1], c1[0] - c0[0]);
    const len0 = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / 2;
    const mid: Pt = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2];
    const cx = lerp(mid[0], W / 2, pv);
    const cy = lerp(mid[1], LOGO.baseY, pv);
    const ang = lerp(ang0, 0, pv);
    const half = lerp(len0, PIVOT_HALF, pv);
    return {pts: [[cx - Math.cos(ang) * half, cy - Math.sin(ang) * half], [cx + Math.cos(ang) * half, cy + Math.sin(ang) * half]], color};
  }

  // A2 · base da marca → desce → escreve BUILD 2030 → se estende.
  if (f < T03.rise[0]) {
    const drop = ramp(f, T02.lineDrop[0], T02.lineDrop[1], glide);
    const y = lerp(LOGO.baseY, TITLE.baseY, drop);
    const hx = f >= T02.write[0] ? writeHead(f) : lerp(W / 2 + PIVOT_HALF, TITLE.x, drop);
    const x0 = lerp(W / 2 - PIVOT_HALF, TITLE.x - 90, drop);
    const ext = ramp(f, T02.extend[0], T02.extend[1], settle);
    const headO = drop > 0 ? 1 - ramp(f, T02.write[1], T02.write[1] + 8) : 0;
    return {pts: [[lerp(x0, 0, ext), y], [lerp(hx, W, ext), y]], color, head: headO > 0 ? {p: [hx, y], o: headO} : null};
  }

  // A3 · sobe varrendo o título até o horizonte.
  if (f < T04.toRuler[0]) {
    const y = lerp(TITLE.baseY, HORIZON_Y, ramp(f, T03.rise[0], T03.rise[1], glide));
    const land = ramp(f, T03.rise[1] - 6, T03.rise[1] + 2) * (1 - ramp(f, T03.rise[1] + 4, T03.collapse[0], glide));
    return {pts: [[0, y], [W, y]], color: C.head, width: LINE.width + 0.6, glow: 0.65 * land, opacity: 0.9};
  }

  // A4 → C · régua; os nós de informação pousam nela.
  const nodes = [0, 1, 2].map((k) => ({x: NODE_X[k], o: ramp(f, nodeLand(k) - 1, nodeLand(k) + 2)}));
  if (f < T06.rise[0]) {
    const t = ramp(f, T04.toRuler[0], T04.toRuler[1], glide);
    const sp = ramp(f, T04.toRuler[0] + 8, T04.toRuler[1] + 4, settle);
    const y = lerp(HORIZON_Y, RULER_Y, t);
    const ticks = Array.from({length: 13}, (_, i) => {
      const x = M + (i * (W - 2 * M)) / 12;
      const g = ramp(f, T04.ticks + Math.abs(i - 6) * 2, T04.ticks + 12 + Math.abs(i - 6) * 2, settle);
      return {x, y, h: LINE.tick * g, o: f > S[0] ? 0.4 : 0.7};
    });
    return {pts: [[lerp(0, M, sp), y], [lerp(W, W - M, sp), y]], color, ticks, nodes: nodes.filter((n) => n.o > 0).map((n) => ({p: [n.x, y] as Pt, r: 5.5, o: n.o}))};
  }

  // C · a régua sobe até a altura da camada AERA e se contrai; os nós convergem num ponto.
  if (f < T07.invert[0]) {
    const r = ramp(f, T06.rise[0], T06.rise[1], glide);
    const cv = ramp(f, T06.converge[0], T06.converge[1], pull);
    const y = lerp(RULER_Y, E0[1], r);
    const x0 = lerp(lerp(M, E0[0] - 560, r), E0[0], cv);
    const x1 = lerp(lerp(W - M, E0[0] + 560, r), E0[0], cv);
    const at = (nx: number) => x0 + ((nx - M) / (W - 2 * M)) * (x1 - x0);
    const merged = ramp(f, T06.converge[1] - 4, T06.converge[1] + 2, settle);
    const tickFade = 1 - ramp(f, T06.rise[0], T06.rise[0] + 10, leave);
    const ticks = tickFade > 0 ? Array.from({length: 13}, (_, i) => ({x: at(M + (i * (W - 2 * M)) / 12), y, h: LINE.tick, o: 0.4 * tickFade})) : [];
    return {
      pts: [[x0, y], [x1 + 0.01, y]],
      color,
      ticks,
      nodes: merged >= 1 ? [] : nodes.map((n) => ({p: [at(n.x), y] as Pt, r: 5.5, o: 1})),
      head: merged > 0 ? {p: E0, o: merged} : null,
    };
  }
  return null;
};

/* ================================================================== filme */

export const V4Film: React.FC<{audio?: boolean; vo?: number}> = ({audio = true, vo = 1.3}) => {
  const f = useCurrentFrame();

  const exposure = ramp(f, T01.matterIn[0], T01.matterIn[1], glide) * (1 - ramp(f, T01.dim[0], T01.dim[1], glide));
  const c01 = cam01(f);

  // A3 · o mar: abaixo da linha durante a subida; o céu abre a partir dela; depois fecha sobre ela.
  const riseY = lerp(TITLE.baseY, HORIZON_Y, ramp(f, T03.rise[0], T03.rise[1], glide));
  const sky = ramp(f, T03.sky[0], T03.sky[1], settle);
  const col = ramp(f, T03.collapse[0], T03.collapse[1], glide);
  const seaTop = lerp(riseY, 0, sky);
  const seaClip = inset(lerp(seaTop, HORIZON_Y, col), 0, lerp(0, H - HORIZON_Y, col), 0);
  const camT03 = ramp(f, T03.cam[0], T03.cam[1], glide);

  // D · campo claro a partir do ponto; E · volta ao navy
  const inv = ramp(f, T07.invert[0], T07.invert[1], settle);
  const light = inv * (1 - ramp(f, T11.invert[0], T11.invert[1], settle));

  return (
    <AbsoluteFill style={{background: C.navyDeep, overflow: 'hidden'}}>
      <GradeDefs />

      {/* A1 · costa */}
      {f < T01.dim[1] + 2 ? (
        <>
          <Plate cam={{s: c01.s, tx: c01.tx, ty: c01.ty}} filter={`${DUO_FILTER} brightness(${lerp(0.2, 1.05, exposure)})`} opacity={exposure}>
            <Img src={staticFile('media/v3/coast.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
          </Plate>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 60%, rgba(5,15,26,0) 35%, rgba(5,15,26,0.85) 100%)', opacity: exposure}} />
        </>
      ) : null}
      <TickLabel text="AERA apresenta" x={M} y={H - M - 4} at={T01.presentsIn} out={T01.presentsOut} size={18} color={C.cream} tracking={0.12} upper={false} />

      {/* A2 · marca + título escrito; somem por baixo da linha que sobe */}
      {f >= T02.logoRise[0] - 1 && f < T03.rise[1] + 2 ? (
        <div style={{position: 'absolute', inset: 0, clipPath: inset(0, 0, H - (f >= T03.rise[0] ? riseY : H), 0)}}>
          {(() => {
            const r = ramp(f, T02.logoRise[0], T02.logoRise[1], settle);
            const lift = ramp(f, T02.lineDrop[0], T02.lineDrop[1], glide);
            const gap = 22;
            const top = LOGO.baseY - gap - LOGO.h;
            return (
              <div style={{position: 'absolute', left: (W - LOGO_W) / 2, top: top - 10, width: LOGO_W, height: LOGO.h + 10 + (gap - 2) + lift * 400, overflow: 'hidden'}}>
                <Img src={staticFile('brand/gavea-group_hor_branco.png')} style={{position: 'absolute', left: 0, top: 10 + (1 - r) * (LOGO.h + gap + 4), width: LOGO_W, height: LOGO.h}} />
              </div>
            );
          })()}
          {f >= T02.write[0] ? <WrittenTitle word="BUILD 2030" x={TITLE.x} baseY={TITLE.baseY} size={TITLE.size} headX={writeHead} /> : null}
        </div>
      ) : null}
      <TickLabel text="Proposta AERA · até 2030" x={TITLE.x} y={TITLE.baseY + 30} at={T02.stamp} out={T03.rise[0] - 6} size={16} color={C.tealSoft} tracking={0.22} />

      {/* A3 · horizonte */}
      {f >= T03.rise[0] && f < T03.collapse[1] + 1 ? (
        <Plate clip={seaClip} cam={{s: lerp(1.02, 1.1, camT03), tx: lerp(0, -40, camT03), ox: W / 2, oy: HORIZON_Y}} filter={`${DUO_FILTER} brightness(1.06)`}>
          <ClipVideo src="media/v3/horizon.mp4" from={T03.rise[0]} rate={0.8} />
        </Plate>
      ) : null}

      {/* B · planos (o de trás continua vivo até o da frente cobrir); o porto congelado segura o C até a janela tomar a tela */}
      {f >= S[0] - 8 && f <= T06.window[1]
        ? [0, 1, 2].map((k) => (f >= S[k] - 8 && f < (k < 2 ? NEXT[k] + 18 : T06.window[1] + 1) ? <Plane key={k} k={k} /> : null))
        : null}
      <CropWindow />
      <Knowledge />
      <div style={{position: 'absolute', left: 0, top: RULER_Y - 300, width: W, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))', opacity: f >= S[0] && f < T06.collapse[1] ? ramp(f, S[0], S[0] + 14) * (1 - ramp(f, T06.collapse[0], T06.collapse[1])) : 0}} />
      <LineMB at={lineAt} f={f} />
      <KnowledgeTags />
      {WORDS.map((w, k) => (
        <ImpactWord key={w} word={w} x={WORD_X} baseY={RULER_Y} at={S[k]} out={k < 2 ? NEXT[k] - 8 : B05_OUT} track={k === 2 ? 160 : 0} inDur={18} />
      ))}
      {['Conhecimento', 'Processos', 'Inteligência'].map((n, k) => (
        <TickLabel key={n} text={n} x={NODE_X[k] + 14} y={RULER_Y + 16} at={nodeLand(k) + 1} out={T06.rise[0] - 2} size={15} color={C.cream} tracking={0.18} />
      ))}

      {/* D · campo claro (V4Cream) · E/F · navy (V4Navy) */}
      {f >= T07.invert[0] && f < CREAM_END ? <CreamLayers /> : null}
      <NavyLayers />

      {/* textura */}
      <Grain opacity={GRAIN.dark * (1 - light)} mode="screen" />
      {light > 0 ? <Grain opacity={GRAIN.light * light} mode="multiply" /> : null}

      {audio ? <V4Audio vo={vo} /> : null}
    </AbsoluteFill>
  );
};

export const V4_DURATION = FILM_END;
