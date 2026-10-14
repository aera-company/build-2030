/**
 * GAVEA / BUILD 2030 · V5 · filme-proposta, um pensamento contínuo com música.
 * A abertura (este arquivo) · B frente 01 (V5Brand) · C frente 02 (V5Tech) · D/E encontro e sistema (V5Center)
 * F verbos e assinatura (V5End) · som em quatro camadas (V5Audio).
 */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from '../components/Grain';
import {C, GRAIN, H, LINE, M, W} from '../motion/design';
import {glide, lerp, leave, partial, pointAt, polyFractions, Pt, ramp, settle} from '../motion/easing';
import {CAM01, COAST, HORIZON_Y, LOGO, LOGO_W, PIVOT_HALF, RULER_Y, TITLE, TITLE_W, WORD_X, Y_R} from '../motion/geometry';
import {CREAM, FILM_END, PLANES, PLANES_OUT, T01, T02, T03, T04, T05} from '../motion/timing';
import {DUO_FILTER, GradeDefs} from '../primitives/Grade';
import {LineMB, LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate} from '../primitives/Media';
import {ImpactWord, TickLabel} from '../primitives/Type';
import {WrittenTitle} from '../primitives/WrittenTitle';
import {BrandFront} from './V5Brand';
import {TechFront} from './V5Tech';
import {Center} from './V5Center';
import {Ending} from './V5End';
import {V5Audio} from './V5Audio';

/* ================================================================== A · costa, marca, título */

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

/* ================================================================== A · três planos no tempo da música */

const S = PLANES;
const NEXT = [S[1], S[2], PLANES_OUT];
const WORDS = ['MARCA.', 'PRESENÇA.', 'OPORTUNIDADES.'];

const Plane: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const s = S[k];
  const col = ramp(f, T05.collapse[0], T05.collapse[1], leave);
  switch (k) {
    case 0: {
      // MARCA · a janela sobe da régua; o contêiner continua subindo dentro dela.
      const p = ramp(f, s - 6, s + 10, settle);
      const shove = ramp(f, NEXT[0] - 2, NEXT[0] + 12, settle);
      return (
        <Plate clip={inset(RULER_Y * (1 - p), 0, 0, 0)} cam={{s: lerp(1.02, 1.12, ramp(f, s - 8, NEXT[0] + 14, glide)), tx: -140 * shove, ty: lerp(30, -20, ramp(f, s - 8, NEXT[0] + 14)), ox: W * 0.56, oy: H * 0.34}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/marca.mp4" from={s - 10} />
        </Plate>
      );
    }
    case 1: {
      // PRESENÇA · o painel entra da direita empurrando a MARCA; o aéreo desliza.
      const p = ramp(f, s - 2, s + 10, settle);
      return (
        <Plate clip={inset(0, 0, 0, W * (1 - p))} cam={{s: 1.1, tx: lerp(200, 0, p) - (f - s) * 2.2}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/presenca.mp4" from={s - 6} />
        </Plate>
      );
    }
    default: {
      // OPORTUNIDADES · a comporta abre do centro; a proa avança; no fim a imagem fecha sobre a régua.
      const p = ramp(f, s - 2, s + 12, settle);
      const half = (W / 2) * (1 - p);
      return (
        <Plate clip={inset(Math.max(0, lerp(0, RULER_Y, col)), half, lerp(0, H - RULER_Y, col), half)} cam={{s: lerp(1.18, 1.03, ramp(f, s - 4, PLANES_OUT, glide)), ox: W * 0.42, oy: H * 0.56}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/oport.mp4" from={s - 4} />
        </Plate>
      );
    }
  }
};

/* ================================================================== a linha, A */

const lineA = (f: number): LineState | null => {
  const color = C.tealSoft;
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
    if (pv <= 0) return {pts: partial(pts, tr), color, glow: 0.5 * (1 - st), head: {p: pointAt(pts, tr), o: 1 - ramp(f, T01.trace[1] - 4, T01.trace[1] + 8)}};
    const ang0 = Math.atan2(c1[1] - c0[1], c1[0] - c0[0]);
    const len0 = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / 2;
    const mid: Pt = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2];
    const cx = lerp(mid[0], W / 2, pv);
    const cy = lerp(mid[1], LOGO.baseY, pv);
    const ang = lerp(ang0, 0, pv);
    const half = lerp(len0, PIVOT_HALF, pv);
    return {pts: [[cx - Math.cos(ang) * half, cy - Math.sin(ang) * half], [cx + Math.cos(ang) * half, cy + Math.sin(ang) * half]], color};
  }
  if (f < T03.rise[0]) {
    const drop = ramp(f, T02.lineDrop[0], T02.lineDrop[1], glide);
    const y = lerp(LOGO.baseY, TITLE.baseY, drop);
    const hx = f >= T02.write[0] ? writeHead(f) : lerp(W / 2 + PIVOT_HALF, TITLE.x, drop);
    const x0 = lerp(W / 2 - PIVOT_HALF, TITLE.x - 90, drop);
    const ext = ramp(f, T02.extend[0], T02.extend[1], settle);
    const headO = drop > 0 ? 1 - ramp(f, T02.write[1], T02.write[1] + 8) : 0;
    return {pts: [[lerp(x0, 0, ext), y], [lerp(hx, W, ext), y]], color, head: headO > 0 ? {p: [hx, y], o: headO} : null};
  }
  if (f < T04.toRuler[0]) {
    const y = lerp(TITLE.baseY, HORIZON_Y, ramp(f, T03.rise[0], T03.rise[1], glide));
    const land = ramp(f, T03.rise[1] - 6, T03.rise[1] + 2) * (1 - ramp(f, T03.rise[1] + 4, T03.collapse[0], glide));
    return {pts: [[0, y], [W, y]], color: C.head, width: LINE.width + 0.6, glow: 0.65 * land, opacity: 0.9};
  }
  // régua dos planos → a imagem fecha sobre ela → sobe até a altura da estrutura (frente 01), onde o campo claro se abre
  if (f < T05.open[0] + 2) {
    const t = ramp(f, T04.toRuler[0], T04.toRuler[1], glide);
    const sp = ramp(f, T04.toRuler[0] + 8, T04.toRuler[1] + 4, settle);
    const up = ramp(f, T05.rise[0], T05.rise[1], glide);
    const y = lerp(lerp(HORIZON_Y, RULER_Y, t), Y_R, up);
    const ticks = Array.from({length: 13}, (_, i) => {
      const x = M + (i * (W - 2 * M)) / 12;
      const g = ramp(f, T04.ticks + Math.abs(i - 6) * 2, T04.ticks + 12 + Math.abs(i - 6) * 2, settle) * (1 - ramp(f, T05.collapse[0], T05.rise[0]));
      return {x, y, h: LINE.tick * g, o: 0.5};
    });
    return {pts: [[lerp(0, M, sp), y], [lerp(W, W - M, sp), y]], color, ticks, glow: 0.4 * ramp(f, T05.rise[1] - 6, T05.rise[1]) * (1 - ramp(f, T05.open[0], T05.open[0] + 2))};
  }
  return null;
};

/** quanto de campo claro há no frame (para a grade de grão) */
const lightAt = (f: number) => Math.max(...CREAM.map(([a, b]) => ramp(f, a, a + 18) * (1 - ramp(f, b - 18, b))));

/* ================================================================== filme */

export const V5Film: React.FC<{audio?: boolean; vo?: number}> = ({audio = true, vo = 1.3}) => {
  const f = useCurrentFrame();
  const exposure = ramp(f, T01.matterIn[0], T01.matterIn[1], glide) * (1 - ramp(f, T01.dim[0], T01.dim[1], glide));
  const c01 = cam01(f);
  const riseY = lerp(TITLE.baseY, HORIZON_Y, ramp(f, T03.rise[0], T03.rise[1], glide));
  const sky = ramp(f, T03.sky[0], T03.sky[1], settle);
  const col = ramp(f, T03.collapse[0], T03.collapse[1], glide);
  const seaTop = lerp(riseY, 0, sky);
  const seaClip = inset(lerp(seaTop, HORIZON_Y, col), 0, lerp(0, H - HORIZON_Y, col), 0);
  const camT03 = ramp(f, T03.cam[0], T03.cam[1], glide);
  const light = lightAt(f);

  return (
    <AbsoluteFill style={{background: C.navyDeep, overflow: 'hidden'}}>
      <GradeDefs />

      {/* A1 · costa: a linha nasce dela */}
      {f < T01.dim[1] + 2 ? (
        <>
          <Plate cam={{s: c01.s, tx: c01.tx, ty: c01.ty}} filter={`${DUO_FILTER} brightness(${lerp(0.2, 1.05, exposure)})`} opacity={exposure}>
            <Img src={staticFile('media/v3/coast.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
          </Plate>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 60%, rgba(5,15,26,0) 35%, rgba(5,15,26,0.85) 100%)', opacity: exposure}} />
        </>
      ) : null}
      <TickLabel text="AERA apresenta" x={M} y={H - M - 4} at={T01.presentsIn} out={T01.presentsOut} size={18} color={C.cream} tracking={0.12} upper={false} />

      {/* A2 · GAVEA GROUP + BUILD 2030 */}
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

      {/* A3 · horizonte */}
      {f >= T03.rise[0] && f < T03.collapse[1] + 1 ? (
        <Plate clip={seaClip} cam={{s: lerp(1.02, 1.12, camT03), tx: lerp(0, -60, camT03), ox: W / 2, oy: HORIZON_Y}} filter={`${DUO_FILTER} brightness(1.06)`}>
          <ClipVideo src="media/v3/horizon.mp4" from={T03.rise[0]} />
        </Plate>
      ) : null}

      {/* A4 · MARCA · PRESENÇA · OPORTUNIDADES */}
      {f >= S[0] - 8 && f <= T05.collapse[1] ? [0, 1, 2].map((k) => (f >= S[k] - 8 && f < (k < 2 ? NEXT[k] + 14 : T05.collapse[1] + 1) ? <Plane key={k} k={k} /> : null)) : null}
      <div style={{position: 'absolute', left: 0, top: RULER_Y - 300, width: W, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))', opacity: ramp(f, S[0], S[0] + 10) * (1 - ramp(f, T05.collapse[0], T05.collapse[1]))}} />
      <LineMB at={lineA} f={f} />
      {WORDS.map((w, k) => (
        <ImpactWord key={w} word={w} x={WORD_X} baseY={RULER_Y} at={S[k]} out={k < 2 ? NEXT[k] - 6 : PLANES_OUT} track={k === 2 ? 140 : 60} inDur={12} />
      ))}

      {/* B · C · D/E · F */}
      <BrandFront />
      <TechFront />
      <Center />
      <Ending />

      <Grain opacity={GRAIN.dark * (1 - light)} mode="screen" />
      {light > 0 ? <Grain opacity={GRAIN.light * light} mode="multiply" /> : null}
      {audio ? <V5Audio vo={vo} /> : null}
    </AbsoluteFill>
  );
};

export const V5_DURATION = FILM_END;
