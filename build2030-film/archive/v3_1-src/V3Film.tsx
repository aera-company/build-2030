import React from 'react';
import {AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame} from 'remotion';
import {CAP, GlyphWord, wordData, wordWidth} from '../components/GlyphWord';
import {Grain} from '../components/Grain';
import {C, GRAIN, GRID, H, LINE, M, TYPE, W} from '../motion/design';
import {glide, lerp, lerpLog, leave, partial, pointAt, polyFractions, Pt, pull, ramp, settle} from '../motion/easing';
import {
  ANCHOR_Y, AXIS, CAM01, COAST, DIR, HORIZON_Y, I_BOTTOM, I_HALF_W, I_X, LOGO, LOGO_W, PIVOT_HALF, POINT, RAILS, RULER_Y, TITLE, TITLE_W, tileRect, WORD_X,
} from '../motion/geometry';
import {B05_START, B05_END, FILM_END, T01, T02, T03, T04, T06, T07, T08, T09, T11} from '../motion/timing';
import {DUO_FILTER, GradeDefs} from '../primitives/Grade';
import {Line, LineMB, LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate, StillImg} from '../primitives/Media';
import {ImpactWord, LineSentence, MaskLines, TickLabel} from '../primitives/Type';
import {CreamSystem, lineCream, NavyLayers} from './V3Part2';
import {WrittenTitle} from '../primitives/WrittenTitle';
import {V3Audio} from './V3Audio';

/* ------------------------------------------------------------------ B01 · câmera e costa */

const cam01 = (f: number) => {
  const t = ramp(f, T01.cam[0], T01.cam[1], glide);
  return {s: lerp(CAM01.s0, CAM01.s1, t), tx: lerp(CAM01.tx0, CAM01.tx1, t), ty: lerp(CAM01.ty0, CAM01.ty1, t)};
};
const toScreen01 = (f: number, [x, y]: Pt): Pt => {
  const c = cam01(f);
  return [W / 2 + (x - W / 2) * c.s + c.tx, H / 2 + (y - H / 2) * c.s + c.ty];
};

/* ------------------------------------------------------------------ B02 · cabeça que escreve */

const writeHead = (f: number) => {
  const t = ramp(f, T02.write[0], T02.write[1], (u) => u * u * (3 - 2 * u) * 0.25 + u * 0.75);
  return lerp(TITLE.x, TITLE.x + TITLE_W + 14, t);
};

/* ------------------------------------------------------------------ B05 · planos */

const S = B05_START;
const NEXT = [...S.slice(1), B05_END];
const WORDS = ['MARCA.', 'PRESENÇA.', 'OPORTUNIDADES.', 'CONEXÃO.', 'INTELIGÊNCIA.'];

/** Cada plano lê o próprio frame (funciona dentro de <Freeze> para virar tile no B06). */
const Plane: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const s = S[k];
  switch (k) {
    case 0: {
      // MARCA · a janela sobe da régua; push focal no contêiner; empurrado pela PRESENÇA.
      const p = ramp(f, s - 4, s + 16, settle);
      const q = ramp(f, s - 4, s + 6, settle);
      const shove = ramp(f, NEXT[0] - 2, NEXT[0] + 16, settle);
      return (
        <Plate clip={inset(RULER_Y * (1 - p), 0, (H - RULER_Y) * (1 - q), 0)} cam={{s: lerp(1.0, 1.09, ramp(f, s - 8, NEXT[0] + 20, glide)), tx: -110 * shove, ox: W * 0.56, oy: H * 0.34}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/marca.mp4" from={s - 8} />
        </Plate>
      );
    }
    case 1: {
      // PRESENÇA · painel lateral entra da direita, o aéreo continua deslizando.
      const p = ramp(f, s - 2, s + 14, settle);
      return (
        <Plate clip={inset(0, 0, 0, W * (1 - p))} cam={{s: 1.07, tx: lerp(160, 0, p) - (f - s) * 1.6}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/presenca.mp4" from={s - 6} />
        </Plate>
      );
    }
    case 2: {
      // OPORTUNIDADES · o quadro se abre do centro como uma comporta; a proa avança (recuo de câmera).
      const p = ramp(f, s - 2, s + 14, settle);
      const half = (W / 2) * (1 - p);
      return (
        <Plate clip={inset(0, half, 0, half)} cam={{s: lerp(1.16, 1.03, ramp(f, s - 4, NEXT[2] + 6, glide)), ox: W * 0.42, oy: H * 0.56}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/oport.mp4" from={s - 4} rate={1.2} />
        </Plate>
      );
    }
    case 3: {
      // CONEXÃO · a imagem nasce dentro das letras e se expande a partir delas.
      return (
        <Plate clip="url(#cxclip)" cam={{s: lerp(1.06, 1.0, ramp(f, s - 6, NEXT[3], glide)), ty: lerp(640, 0, ramp(f, CX.grow[0] - 4, CX.grow[1] + 4, settle)), oy: H * 0.4}} filter={`${DUO_FILTER} brightness(${lerp(1.75, 1, ramp(f, CX.grow[0], CX.grow[1], settle))})`}>
          <ClipVideo src="media/v3/conexao.mp4" from={s - 6} />
        </Plate>
      );
    }
    default: {
      // INTELIGÊNCIA · cortina de cima para baixo; o campo de dados ganha profundidade:
      // fundo empurra devagar, os pontos de luz (mesma imagem, só as altas) andam mais rápido e deslizam.
      const p = ramp(f, s - 2, s + 14, settle);
      const u = ramp(f, s - 2, T06.fold[1], glide);
      const clip = inset(0, 0, H * (1 - p), 0);
      return (
        <>
          <Plate clip={clip} cam={{s: lerp(1.02, 1.08, u), ty: lerp(-50, 0, p), oy: H * 0.45}} filter={`${DUO_FILTER} brightness(1.05)`}>
            <StillImg src="media/v3/intel.png" />
          </Plate>
          <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
            <Plate clip={clip} cam={{s: lerp(1.08, 1.26, u), tx: lerp(40, -50, u), ty: lerp(-90, 0, p), oy: H * 0.45}} filter={`${DUO_FILTER} brightness(1.1) contrast(2.6)`}>
              <StillImg src="media/v3/intel.png" />
            </Plate>
          </div>
        </>
      );
    }
  }
};

/** Máscara do CONEXÃO.: glifos (subindo da régua) ∪ retângulo que cresce da linha de base até a tela. */
const CX = {word: 'CONEXÃO.', rise: [S[3], S[3] + 15], grow: [S[3] + 16, S[3] + 36], fill: [S[3] + 26, S[3] + 36]};
const ConexaoClip: React.FC = () => {
  const f = useCurrentFrame();
  const size = TYPE.n1;
  const a = ramp(f, CX.rise[0], CX.rise[1], settle);
  const g = ramp(f, CX.grow[0], CX.grow[1], settle);
  const rise = (1 - a) * 1.08 * size;
  const k = size / 1000;
  const wd = wordData(CX.word);
  const wW = wordWidth(CX.word) * size;
  const r = {x: lerp(WORD_X, 0, g), y: lerp(RULER_Y, 0, g), w: lerp(wW, W, g), h: lerp(0, H, g)};
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <defs>
        <clipPath id="cxclip" clipPathUnits="userSpaceOnUse">
          {a > 0
            ? wd.glyphs.map((gl, i) =>
                gl.d ? <path key={i} d={gl.d} transform={`translate(${WORD_X + gl.x * k} ${Math.min(RULER_Y + rise, RULER_Y + 0.24 * size + CAP * size)}) scale(${k})`} /> : null,
              )
            : null}
          <rect x={r.x} y={r.y} width={r.w} height={r.h} />
        </clipPath>
      </defs>
    </svg>
  );
};

/** Palavra do CONEXÃO.: contorno enquanto a imagem está nas letras, preenchimento quando a imagem toma a tela. */
const ConexaoWord: React.FC = () => {
  const f = useCurrentFrame();
  if (f < CX.rise[0] - 1 || f > NEXT[3] + 12) return null;
  const size = TYPE.n1;
  const a = ramp(f, CX.rise[0], CX.rise[1], settle);
  const out = ramp(f, NEXT[3] - 8, NEXT[3] + 1, leave);
  const fl = ramp(f, CX.fill[0], CX.fill[1], settle);
  const rise = ((1 - a) * 1.08 + out * 1.08) * size;
  const capPx = CAP * size;
  return (
    <div style={{position: 'absolute', left: WORD_X - size * 0.3, top: RULER_Y - capPx - size * 0.3, width: W, height: capPx + size * 0.54, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: size * 0.3, top: capPx + size * 0.3 + rise}}>
        <GlyphWord word={CX.word} size={size} color={C.cream} strokeColor={C.cream} stroke={1.8} draw={() => 1} fill={() => fl} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ B06 · mosaico */

const stripCam = (f: number) => {
  const u = ramp(f, T06.pull[0], T06.pull[1], glide);
  const R = tileRect(4);
  const w4 = lerpLog(W, R.w, u);
  const h4 = (w4 * 9) / 16;
  const cx = lerp(W / 2, R.x + R.w / 2, u);
  const cy = lerp(H / 2, R.y + R.h / 2, u);
  const k = w4 / R.w;
  const drift = -10 * ramp(f, T06.pull[1], T06.converge[0], glide);
  return {u, k, ox: cx - w4 / 2 - R.x * k + drift, oy: cy - h4 / 2 - R.y * k};
};
const tileScreen = (f: number, i: number) => {
  const c = stripCam(f);
  const R = tileRect(i);
  return {x: R.x * c.k + c.ox, y: R.y * c.k + c.oy, w: R.w * c.k, h: R.h * c.k};
};
const foldAt = (f: number, i: number) => ramp(f, T06.fold[0] + i * 3, T06.fold[0] + 12 + i * 3, glide);
const nodeAt = (f: number, i: number) => ramp(f, T06.fold[0] + 10 + i * 3, T06.fold[0] + 18 + i * 3, settle);
const convergeAt = (f: number) => ramp(f, T06.converge[0], T06.converge[1], pull);
const nodeX = (f: number, i: number) => {
  const t = tileScreen(f, i);
  return lerp(t.x + t.w / 2, I_X, convergeAt(f));
};

const Mosaic: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T06.pull[0] || f > T06.fold[1] + 14) return null;
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = tileScreen(f, i);
        if (t.x > W || t.x + t.w < 0 || t.y > H || t.y + t.h < 0) return null;
        const fd = foldAt(f, i);
        const sc = t.w / W;
        return (
          <div key={i} style={{position: 'absolute', left: t.x, top: t.y, width: t.w, height: t.h, overflow: 'hidden', clipPath: inset(t.h * fd, 0, 0, 0)}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${sc})`, transformOrigin: '0 0'}}>
              {i === 4 ? <Plane k={4} /> : <Freeze frame={NEXT[i] - 1}><Plane k={i} /></Freeze>}
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ a linha, quadro a quadro */

const lineAt = (f: number): LineState | null => {
  const dark = f < T07.invert[0] + 3;
  const color = dark ? C.tealSoft : C.teal;

  // B01 · nasce da costa, se retifica e pivota.
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
      const shown = partial(pts, tr);
      return {pts: shown, color, glow: 0.5 * (1 - st), head: {p: pointAt(pts, tr), o: 1 - ramp(f, T01.trace[1] - 4, T01.trace[1] + 10)}};
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

  // B02 · base da marca → desce → escreve BUILD 2030 → se estende.
  if (f < T03.rise[0]) {
    const drop = ramp(f, T02.lineDrop[0], T02.lineDrop[1], glide);
    const y = lerp(LOGO.baseY, TITLE.baseY, drop);
    const writing = f >= T02.write[0];
    const hx = writing ? writeHead(f) : lerp(W / 2 + PIVOT_HALF, TITLE.x, drop);
    const x0 = lerp(W / 2 - PIVOT_HALF, TITLE.x - 90, drop);
    const ext = ramp(f, T02.extend[0], T02.extend[1], settle);
    const a = lerp(x0, 0, ext);
    const b = lerp(hx, W, ext);
    const headO = drop > 0 ? 1 - ramp(f, T02.write[1], T02.write[1] + 8) : 0;
    return {pts: [[a, y], [b, y]], color, head: headO > 0 ? {p: [hx, y], o: headO} : null};
  }

  // B03 · sobe varrendo o título até o horizonte.
  if (f < T04.toRuler[0]) {
    const y = lerp(TITLE.baseY, HORIZON_Y, ramp(f, T03.rise[0], T03.rise[1], glide));
    const land = ramp(f, T03.rise[1] - 6, T03.rise[1] + 2) * (1 - ramp(f, T03.rise[1] + 4, T03.collapse[0], glide));
    return {pts: [[0, y], [W, y]], color: C.head, width: LINE.width + 0.6, glow: 0.65 * land, opacity: 0.9};
  }

  // B04 / B05 · régua.
  if (f < T06.pull[0]) {
    const t = ramp(f, T04.toRuler[0], T04.toRuler[1], glide);
    const sp = ramp(f, T04.toRuler[0] + 8, T04.toRuler[1] + 4, settle);
    const y = lerp(HORIZON_Y, RULER_Y, t);
    const ticks = Array.from({length: 13}, (_, i) => {
      const x = M + (i * (W - 2 * M)) / 12;
      const g = ramp(f, T04.ticks + Math.abs(i - 6) * 2, T04.ticks + 12 + Math.abs(i - 6) * 2, settle);
      return {x, y, h: LINE.tick * g, o: f > S[0] ? 0.4 : 0.7};
    });
    return {pts: [[lerp(0, M, sp), y], [lerp(W, W - M, sp), y]], color, ticks};
  }

  // B06 · régua vira a base do mosaico → os tiles dobram sobre ela → nós → um ponto.
  if (f < T07.pivot[0]) {
    const c = stripCam(f);
    const t0 = tileScreen(f, 0);
    const t4 = tileScreen(f, 4);
    const base = Math.min(RULER_Y, t4.y + t4.h);
    const cv = convergeAt(f);
    const x0 = lerp(lerp(M, t0.x, c.u), I_X - 420, cv);
    const x1 = lerp(lerp(W - M, t4.x + t4.w, c.u), I_X, cv);
    const tickFade = 1 - ramp(f, T06.pull[0], T06.pull[0] + 12, leave);
    const ticks = tickFade > 0 ? Array.from({length: 13}, (_, i) => ({x: M + (i * (W - 2 * M)) / 12, y: base, h: LINE.tick, o: 0.4 * tickFade})) : [];
    const nodes = [0, 1, 2, 3, 4].map((i) => ({p: [nodeX(f, i), base] as Pt, r: 5, o: nodeAt(f, i)})).filter((n) => n.o > 0);
    const merged = ramp(f, T06.converge[1] - 4, T06.converge[1] + 2, settle);
    return {
      pts: [[x0, base], [x1, base]],
      color,
      ticks,
      nodes: merged >= 1 ? [] : nodes,
      head: merged > 0 ? {p: POINT, o: merged} : null,
    };
  }
  return null;
};

/** B07 / B08 · o mesmo traço pivota sobre o ponto e vira o eixo do I; ramos e trilhos saem dele. */
const axisAt = (f: number): LineState | null => {
  if (f < T07.pivot[0] || f >= T09.wire - 2) return null;
  const pv = ramp(f, T07.pivot[0], T07.pivot[1], glide);
  const ang = lerp(Math.PI, Math.PI * 1.5, pv);
  const upLen = lerp(420, POINT[1] - AXIS.top, pv);
  const recede = ramp(f, T08.recede[0], T08.rails[0] + 10, glide);
  const top: Pt = [POINT[0] + Math.cos(ang) * upLen, POINT[1] + Math.sin(ang) * upLen];
  const downLen = lerp(0, I_BOTTOM - POINT[1], pv) + ramp(f, T07.axisDown[0], T07.axisDown[1], glide) * (AXIS.bottom - I_BOTTOM);
  const yTop = lerp(top[1], RAILS[0].y, recede);
  const yBot = lerp(POINT[1] + downLen, RAILS[2].y, recede);
  const pts: Pt[] = pv < 1 ? [top, POINT, [POINT[0], POINT[1] + downLen]] : [[I_X, yTop], [I_X, yBot]];
  const retract = ramp(f, T08.recede[0], T08.recede[0] + 12, leave);
  const b1 = ramp(f, T07.branch1[0], T07.branch1[1], settle) * (1 - retract);
  const b2 = ramp(f, T07.branch2[0], T07.branch2[1], settle) * (1 - retract);
  const branches: LineState['branches'] = [];
  if (b1 > 0) branches.push({a: [I_X, AXIS.branch1], b: [I_X + AXIS.branchLen * b1, AXIS.branch1], node: ramp(f, T07.branch1[1] - 6, T07.branch1[1] + 2)});
  if (b2 > 0) branches.push({a: [I_X, AXIS.branch2], b: [I_X + AXIS.branchLen * b2, AXIS.branch2], node: ramp(f, T07.branch2[1] - 6, T07.branch2[1] + 2)});
  // B08 · o trilho do meio (AERA) é o próprio traço; os outros dois são régua de tinta.
  const ra = ramp(f, T08.rails[0] + T08.railStagger, T08.rails[0] + 16 + T08.railStagger, settle);
  if (ra > 0) {
    branches.push({a: [I_X, RAILS[1].y], b: [lerp(I_X, W - M, ra), RAILS[1].y]});
    branches.push({a: [I_X, RAILS[1].y], b: [lerp(I_X, M, ra), RAILS[1].y]});
  }
  const headO = 1 - ramp(f, T07.pivot[1], T07.pivot[1] + 10);
  return {pts, color: C.teal, width: LINE.width, branches, head: headO > 0 ? {p: POINT, o: headO} : null};
};

/* ------------------------------------------------------------------ B07 · DIRECTION */

const Direction: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T07.letters[0] - 1 || f > T08.recede[1] + 4) return null;
  const k = DIR.size;
  const ww = wordWidth('DIRECTION') * k;
  const spread = ramp(f, T07.letters[0], T07.letters[1], settle) * (1 - ramp(f, T08.recede[0], T08.recede[1], leave));
  const iw = ramp(f, T07.iFill[0], T07.iFill[1], settle) * (1 - ramp(f, T08.recede[0], T08.recede[0] + 10, leave));
  const leftReach = (I_X - DIR.x + 30) * spread;
  const rightReach = (DIR.x + ww - I_X + 30) * spread;
  const capPx = CAP * k;
  const box = {left: DIR.x - 40, top: DIR.baseY - capPx - 30, width: ww + 80, height: capPx + 60};
  const word = (fill: (i: number) => number, op: (i: number) => number, stroke: string) => (
    <div style={{position: 'absolute', left: DIR.x - box.left, top: DIR.baseY - box.top}}>
      <GlyphWord word="DIRECTION" size={k} color={C.ink} strokeColor={stroke} stroke={2.1} draw={() => 1} fill={fill} opacity={op} />
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', ...box, clipPath: inset(0, box.left + box.width - (I_X + rightReach), 0, I_X - leftReach - box.left)}}>
        {word(() => 0, (i) => (i === 1 ? 0 : 1), '#76828b')}
      </div>
      <div style={{position: 'absolute', ...box, clipPath: inset(0, box.left + box.width - (I_X + I_HALF_W * iw + 1), 0, I_X - I_HALF_W * iw - 1 - box.left)}}>
        {word(() => 1, (i) => (i === 1 ? 1 : 0), C.ink)}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ B08 · trilhos de tinta + faixa */

const Rails: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T08.rails[0] || f >= T11.invert[1] + 2) return null;
  const band = ramp(f, T08.band[0], T08.band[1], settle);
  return (
    <>
      <div style={{position: 'absolute', left: lerp(I_X, M, band), width: lerp(0, W - 2 * M, band), top: RAILS[1].y + 12, height: 84, background: 'rgba(27,143,181,0.11)'}} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {[0, 2].map((r, j) => {
          const a = ramp(f, T08.rails[0] + j * T08.railStagger * 2, T08.rails[0] + 16 + j * T08.railStagger * 2, settle);
          return (
            <g key={r}>
              <line x1={I_X} y1={RAILS[r].y} x2={lerp(I_X, W - M, a)} y2={RAILS[r].y} stroke={C.ink} strokeWidth={1.3} opacity={0.75} />
              <line x1={I_X} y1={RAILS[r].y} x2={lerp(I_X, M, a)} y2={RAILS[r].y} stroke={C.ink} strokeWidth={1.3} opacity={0.75} />
            </g>
          );
        })}
      </svg>
    </>
  );
};

/* ------------------------------------------------------------------ filme */

export const V3Film: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame();

  // B01 · exposição: a luz sobe, a costa vive, depois apaga e só a linha fica.
  const exposure = ramp(f, T01.matterIn[0], T01.matterIn[1], glide) * (1 - ramp(f, T01.dim[0], T01.dim[1], glide));
  const c01 = cam01(f);

  // B03 · máscara do mar: abaixo da linha durante a subida; depois o céu abre a partir dela; depois fecha sobre ela.
  const riseY = lerp(TITLE.baseY, HORIZON_Y, ramp(f, T03.rise[0], T03.rise[1], glide));
  const sky = ramp(f, T03.sky[0], T03.sky[1], settle);
  const col = ramp(f, T03.collapse[0], T03.collapse[1], glide);
  const seaTop = lerp(riseY, 0, sky);
  const seaClip = inset(lerp(seaTop, HORIZON_Y, col), 0, lerp(0, H - HORIZON_Y, col), 0);
  const camT03 = ramp(f, T03.cam[0], T03.cam[1], glide);

  // B07 · inversão a partir do ponto.
  const inv = ramp(f, T07.invert[0], T07.invert[1], settle);
  const radius = lerp(0, 2350, inv);
  const drift = lerp(1, 1.014, ramp(f, T07.drift[0], T07.drift[1], glide));
  const light = inv * (1 - ramp(f, T11.invert[0], T11.invert[1], settle));

  const line = lineAt(f);

  return (
    <AbsoluteFill style={{background: C.navyDeep, overflow: 'hidden'}}>
      <GradeDefs />
      <ConexaoClip />

      {/* B01 · costa */}
      {f < T01.dim[1] + 2 ? (
        <>
          <Plate cam={{s: c01.s, tx: c01.tx, ty: c01.ty}} filter={`${DUO_FILTER} brightness(${lerp(0.2, 1.05, exposure)})`} opacity={exposure}>
            <Img src={staticFile('media/v3/coast.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
          </Plate>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 60%, rgba(5,15,26,0) 35%, rgba(5,15,26,0.85) 100%)', opacity: exposure}} />
        </>
      ) : null}
      <TickLabel text="AERA apresenta" x={M} y={H - M - 4} at={T01.presentsIn} out={T01.presentsOut} size={18} color={C.cream} tracking={0.12} upper={false} />

      {/* B02 · marca (sobe de trás da linha) + título escrito; somem por baixo da linha que sobe em B03 */}
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

      {/* B03 · horizonte */}
      {f >= T03.rise[0] && f < T03.collapse[1] + 1 ? (
        <Plate clip={seaClip} cam={{s: lerp(1.02, 1.1, camT03), tx: lerp(0, -40, camT03), ox: W / 2, oy: HORIZON_Y}} filter={`${DUO_FILTER} brightness(1.06)`}>
          <ClipVideo src="media/v3/horizon.mp4" from={T03.rise[0]} />
        </Plate>
      ) : null}
      <MaskLines lines={['Um novo ciclo', 'começa agora.']} x={M} y={GRID.top} at={T03.sentence} out={T03.sentenceOut} />

      {/* B04 */}
      <TickLabel text="02 · A necessidade" x={M} y={64} at={T04.index} out={B05_END - 4} size={15} color={C.tealSoft} />
      <LineSentence text="A próxima fase pede mais." x={WORD_X + 4} baseY={RULER_Y} at={T04.sentence + 6} out={T04.sentenceOut - 4} size={TYPE.n2} />

      {/* B05 · planos (o de trás continua vivo até o da frente cobrir) */}
      {f >= S[0] - 8 && f < B05_END
        ? [0, 1, 2, 3, 4].map((k) => (f >= S[k] - 8 && f < (k < 4 ? NEXT[k] + 18 : B05_END) ? <Plane key={k} k={k} /> : null))
        : null}
      <div style={{position: 'absolute', left: 0, top: RULER_Y - 300, width: W, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))', opacity: f >= S[0] && f < B05_END ? ramp(f, S[0], S[0] + 14) * (1 - ramp(f, B05_END - 4, B05_END + 6)) : 0}} />
      {/* B06 · mosaico, e a linha (B01–B06) por cima das imagens e por baixo das palavras */}
      <Mosaic />
      <LineMB at={lineAt} f={f} />
      <TickLabel text="Mais" x={WORD_X + 8} y={ANCHOR_Y} at={T04.anchor} out={B05_END - 4} size={TYPE.anchor} color={C.tealSoft} tracking={0.26} />
      {WORDS.map((w, k) =>
        k === 3 ? null : (
          <ImpactWord key={w} word={w} x={WORD_X} baseY={RULER_Y} at={S[k]} out={k < 4 ? NEXT[k] - 8 : B05_END} track={k === 2 ? 160 : 0} />
        ),
      )}
      <ConexaoWord />
      {WORDS.map((_, k) => (
        <TickLabel key={k} text={`0${k + 1} / 05`} x={W - M} y={ANCHOR_Y + 8} at={S[k]} out={NEXT[k] - 2} size={16} color={C.cream} tracking={0.2} align="right" />
      ))}

      {/* B06 · frase */}
      <MaskLines lines={['A próxima fase', 'pede direção.']} x={M} y={GRID.top} at={T06.sentence} />


      {/* B07 · o ponto inverte o campo */}
      {f >= T07.invert[0] && f < T11.invert[1] + 2 ? (
        <div style={{position: 'absolute', left: POINT[0] - radius, top: POINT[1] - radius, width: radius * 2, height: radius * 2, borderRadius: '50%', background: C.cream}} />
      ) : null}
      {f >= T07.invert[0] && f < T11.invert[1] + 2 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: `${POINT[0]}px ${POINT[1]}px`}}>
          {line ? <LineMB at={(t) => { const s0 = lineAt(t); return s0 ? {...s0, color: C.teal} : null; }} f={f} /> : null}
          <Direction />
          <LineMB at={axisAt} f={f} />
          <Rails />
          <CreamSystem />
          <LineMB at={lineCream} f={f} />
          <TickLabel text="01  Brand & Marketing Direction" x={I_X + AXIS.branchLen + 22} y={AXIS.branch1 - 12} at={T07.label1} out={T08.recede[0] - 2} size={TYPE.n3} color={C.ink} tracking={0.1} />
          <TickLabel text="02  New Technologies & AI" x={I_X + AXIS.branchLen + 22} y={AXIS.branch2 - 12} at={T07.label2} out={T08.recede[0]} size={TYPE.n3} color={C.ink} tracking={0.1} />
        </div>
      ) : null}
      <TickLabel text="03 · A proposta" x={M} y={64} at={T07.index} out={T08.recede[0]} size={15} color={C.teal} />

      {/* B11–B16 · de volta ao navy */}
      <NavyLayers />
      <MaskLines lines={['A AERA propõe ocupar essa camada.']} x={M} y={GRID.top} at={T07.sentence} out={T08.recede[0]} size={54} color={C.ink} />

      {/* textura */}
      <Grain opacity={GRAIN.dark * (1 - light)} mode="screen" />
      {light > 0 ? <Grain opacity={GRAIN.light * light} mode="multiply" /> : null}

      {audio ? <V3Audio /> : null}
    </AbsoluteFill>
  );
};

export const V3_DURATION = FILM_END;
