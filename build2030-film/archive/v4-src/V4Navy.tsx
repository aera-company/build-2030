/**
 * GAVEA / BUILD 2030 · V4 · E e F · de volta ao navy.
 * E o último check inverte o campo; a camada AERA desce e vira a régua da função (conhecimento, processos,
 *   sistemas, IA, decisão); o real vira informação; a régua sobe e abre o GAVEA Trade; a janela vira a barra
 *   do futuro Portal GAVEA; a barra volta a ser linha e costura o split das duas frentes (sem frases).
 * F a costura deita e se divide em duas trilhas que convergem na linha d'água; a linha desce e escreve
 *   BUILD 2030 (o gesto da abertura); três verbos; o mundo colapsa num ponto que redesenha a assinatura.
 */
import React from 'react';
import {Freeze, Img, staticFile, useCurrentFrame} from 'remotion';
import {wordWidth} from '../components/GlyphWord';
import {C, H, M, TYPE, W} from '../motion/design';
import {glide, lerp, lerpLog, leave, Pt, pull, ramp, settle} from '../motion/easing';
import {BAR, ONE_WIN, RAILS, RULER_Y, SIG, STACK, WATER_Y, WORD_X} from '../motion/geometry';
import {FILM_END, T11, T12, T13, T14, T14B, T15, T16} from '../motion/timing';
import {DUO_FILTER} from '../primitives/Grade';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate} from '../primitives/Media';
import {BlurDef, ImpactWord, TickLabel} from '../primitives/Type';
import {WrittenTitle} from '../primitives/WrittenTitle';
import {NAVY_ORIGIN} from './V4Cream';

/* ================================================================== E1 · a função, na régua */

const ROW = ['Conhecimento', 'Processos', 'Sistemas', 'IA', 'Decisão'];
const ROW_X = [1, 3, 5, 7, 9].map((i) => M + (i * (W - 2 * M)) / 12);
const rowAt = (k: number) => T11.row + k * T11.rowStep;
const DEC = T11.clip;
const DEC_FZ = DEC + T11.freeze;
const DEC_TAGS = [
  {x: 860, y: 180, w: 260, h: 200, label: 'Documento'},
  {x: 1260, y: 770, w: 460, h: 150, label: 'Prazo'},
];

const Decisao: React.FC = () => {
  const f = useCurrentFrame();
  if (f < DEC - 6 || f > T12.collapse[1] + 1) return null;
  const p = ramp(f, DEC - 4, DEC + 16, settle);
  const q = ramp(f, DEC - 4, DEC + 6, settle);
  const col = ramp(f, T12.collapse[0], T12.collapse[1], leave);
  const clip = inset(Math.max(RULER_Y * (1 - p), lerp(0, RULER_Y, col)), 0, Math.max((H - RULER_Y) * (1 - q), lerp(0, H - RULER_Y, col)), 0);
  const video = <ClipVideo src="media/v3/decisao.mp4" from={DEC - 6} />;
  const fz = ramp(f, DEC_FZ, DEC_FZ + 4, settle);
  return (
    <Plate clip={clip} cam={{s: lerp(1.08, 1.02, ramp(f, DEC - 6, T12.collapse[1], glide))}} filter={`${DUO_FILTER} brightness(${lerp(1, 0.76, fz)})`}>
      {f >= DEC_FZ ? <Freeze frame={DEC_FZ}>{video}</Freeze> : video}
    </Plate>
  );
};

/** Os recortes do real encolhem em nós e caem no nó "Decisão" da régua. */
const DecTags: React.FC = () => {
  const f = useCurrentFrame();
  if (f < DEC + T11.tag[0] - 1 || f > DEC + T11.detach[1] + 8) return null;
  const items: React.ReactNode[] = [];
  DEC_TAGS.forEach((t, j) => {
    const t0 = DEC + T11.tag[0] + j * 3;
    const draw = ramp(f, t0, t0 + 8, settle);
    const d0 = DEC + T11.detach[0] + j * 3;
    const d1 = DEC + T11.detach[1] + j * 3;
    const shrink = ramp(f, d0, d0 + 6, leave);
    const cx = t.x + t.w / 2;
    const cy = t.y + t.h / 2;
    const rw = t.w * (1 - shrink);
    const rh = t.h * (1 - shrink);
    if (rw > 1) items.push(<rect key={`r${j}`} x={cx - rw / 2} y={cy - rh / 2} width={rw} height={rh} fill="none" stroke={C.tealSoft} strokeWidth={1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />);
    if (f >= d0 + 4 && f < d1) {
      const to: Pt = [ROW_X[4], RULER_Y];
      const u = ramp(f, d0 + 4, d1, glide);
      const up = ramp(f - 1, d0 + 4, d1, glide);
      const x = lerp(cx, to[0], u);
      const y = lerp(cy, to[1], u);
      const vx = (x - lerp(cx, to[0], up)) * 0.5;
      const vy = (y - lerp(cy, to[1], up)) * 0.5;
      items.push(
        <g key={`n${j}`}>
          <circle cx={x - vx * 2} cy={y - vy * 2} r={5} fill={C.tealSoft} opacity={0.18} />
          <circle cx={x - vx} cy={y - vy} r={5} fill={C.tealSoft} opacity={0.36} />
          <circle cx={x} cy={y} r={5.5} fill={C.head} />
        </g>,
      );
    }
  });
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {items}
      </svg>
      {DEC_TAGS.map((t, j) => (
        <TickLabel key={j} text={t.label} x={t.x} y={t.y - 26} at={DEC + T11.tag[0] + 4 + j * 3} out={DEC + T11.detach[0] + j * 3} size={15} color={C.cream} tracking={0.2} />
      ))}
    </>
  );
};

/* ================================================================== E2 · GAVEA Trade → futuro Portal GAVEA */

const barState = (f: number) => {
  const open = ramp(f, T12.barOpen[0], T12.barOpen[1], settle);
  const close = ramp(f, T12.close[0], T12.close[1], leave);
  const y = lerp(BAR.y, BAR.upY, ramp(f, T12.barUp[0], T12.barUp[1], glide));
  return {open, close, y, h: BAR.h * open * (1 - close)};
};
const QUESTION = 'Quero entender o status da P-35';
const TRADE = {w: 1200, h: 675};

const TradeWindow: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T12.trade[0] || f >= T12.toBar[1]) return null;
  const o = ramp(f, T12.trade[0], T12.trade[1], settle);
  const m = ramp(f, T12.toBar[0], T12.toBar[1], glide);
  const w = lerp(TRADE.w, BAR.half * 2, m);
  const h = lerp(TRADE.h * o, BAR.h, m);
  const swap = ramp(f, T12.tradeSwap, T12.tradeSwap + 14, settle);
  const push = lerp(1.0, 1.06, ramp(f, T12.trade[0], T12.toBar[0], glide));
  return (
    <>
      <div style={{position: 'absolute', left: W / 2 - w / 2, top: BAR.y - h / 2, width: w, height: h, borderRadius: lerp(0, BAR.h / 2, m), border: `1.6px solid ${C.tealSoft}`, overflow: 'hidden', background: C.navyDeep}}>
        <div style={{position: 'absolute', left: W / 2 - TRADE.w / 2 - (W / 2 - w / 2), top: BAR.y - TRADE.h / 2 - (BAR.y - h / 2), width: TRADE.w, height: TRADE.h, opacity: 1 - Math.min(1, m * 1.6), transform: `scale(${push})`, filter: 'saturate(0.75) brightness(0.94)'}}>
          <Img src={staticFile('media/trade/01-login.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '0% 50%'}} />
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - swap) * 100}%)`}}>
            <Img src={staticFile('media/trade/08-historico.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
          </div>
        </div>
      </div>
      <TickLabel text="GAVEA Trade" x={W / 2 - TRADE.w / 2} y={BAR.y - TRADE.h / 2 - 30} at={T12.tradeLabel} out={T12.toBar[0]} size={15} color={C.tealSoft} />
      <TickLabel text="Cotação · Proposta · Follow-up" x={W / 2 + TRADE.w / 2} y={BAR.y + TRADE.h / 2 + 14} at={T12.tradeLabel + 6} out={T12.toBar[0]} size={15} color={C.cream} align="right" />
    </>
  );
};

const OneMoment: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T12.barOpen[0] || f > T12.close[1] + 2) return null;
  const b = barState(f);
  const x0 = BAR.cx - BAR.half;
  const n = Math.floor(QUESTION.length * ramp(f, T12.type[0], T12.type[1], (t) => t));
  const typing = f >= T12.type[0] && f < T12.enter;
  const cursorOn = typing || (f < T12.enter + 2 && Math.floor(f / 8) % 2 === 0);
  const win = ramp(f, T12.window[0], T12.window[1], settle) * (1 - ramp(f, T12.close[0] - 4, T12.close[0] + 6, leave));
  const pulse = 1 + 0.35 * Math.max(0, Math.sin(((f - T12.enter) / 10) * Math.PI)) * (f >= T12.enter && f < T12.enter + 10 ? 1 : 0);
  return (
    <>
      {win > 0 ? (
        <div style={{position: 'absolute', left: ONE_WIN.x, top: ONE_WIN.y, width: ONE_WIN.w, height: ONE_WIN.h, clipPath: inset(0, 0, ONE_WIN.h * (1 - win), 0), overflow: 'hidden', boxShadow: `inset 0 0 0 1px rgba(127,198,220,0.35)`}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.0, 1.16, ramp(f, T12.window[0], T12.close[1], glide))})`, transformOrigin: '42% 78%', filter: 'saturate(0.85) brightness(1.05)'}}>
            <ClipVideo src="media/v3/one.mp4" from={T12.window[0] - 4} />
          </div>
        </div>
      ) : null}
      {b.h > 1 ? (
        <div style={{position: 'absolute', left: x0, top: b.y - b.h / 2, width: BAR.half * 2, height: b.h, borderRadius: b.h / 2, border: `1.6px solid ${C.tealSoft}`, background: 'rgba(8,30,47,0.94)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 48 - 7 * pulse, top: b.h / 2 - 7 * pulse, width: 14 * pulse, height: 14 * pulse, borderRadius: '50%', background: C.head, boxShadow: `0 0 ${18 * pulse}px rgba(230,246,255,0.7)`}} />
          <div style={{position: 'absolute', left: 84, top: b.h / 2 - 22, fontFamily: 'GAVEA Display', fontVariationSettings: '"wght" 480, "wdth" 100', fontSize: 34, lineHeight: '44px', color: C.cream, whiteSpace: 'nowrap', letterSpacing: '-0.01em'}}>
            {QUESTION.slice(0, n)}
            <span style={{display: 'inline-block', width: 2, height: 34, marginLeft: 4, verticalAlign: '-6px', background: C.tealSoft, opacity: cursorOn ? 1 : 0}} />
          </div>
        </div>
      ) : null}
      <TickLabel text="Futuro Portal GAVEA · protótipo" x={ONE_WIN.x} y={ONE_WIN.y + ONE_WIN.h + 18} at={T12.labels[0]} out={T12.close[0] - 2} size={15} color={C.tealSoft} />
      <TickLabel text="GAVEA ONE · IA aplicada à decisão" x={ONE_WIN.x + ONE_WIN.w} y={ONE_WIN.y + ONE_WIN.h + 18} at={T12.labels[1]} out={T12.close[0]} size={15} color={C.cream} align="right" />
    </>
  );
};

/* ================================================================== E3 · as duas frentes (sem frases) */

const Split: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T13.panels[0] - 1 || f > T14.open[1]) return null;
  const p = ramp(f, T13.panels[0], T13.panels[1], settle);
  const u = ramp(f, T13.out[0], T13.out[1], glide);
  const sc = lerp(1, STACK.w / W, u);
  const logoH = 138;
  const logoW = (logoH * 3257) / 1352;
  const lr = ramp(f, T13.logo, T13.logo + 18, settle);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${sc}) rotate(${-2 * u}deg)`, transformOrigin: '50% 50%', boxShadow: u > 0 ? '0 30px 80px rgba(0,0,0,0.5)' : undefined}}>
      <div style={{position: 'absolute', inset: 0, background: C.cream, clipPath: inset(0, W / 2, 0, (W / 2) * (1 - p))}}>
        <div style={{position: 'absolute', left: W / 4 - logoW / 2, top: 540 - logoH / 2, width: logoW, height: logoH + 4, overflow: 'hidden'}}>
          <Img src={staticFile('brand/gavea-group_hor_cor.png')} style={{position: 'absolute', left: 0, top: (1 - lr) * (logoH + 6), width: logoW, height: logoH}} />
        </div>
        <TickLabel text="01 · Marca e marketing" x={M} y={64} at={T13.index} out={T13.out[0] - 2} size={15} color={C.teal} />
      </div>
      <Plate clip={inset(0, (W / 2) * (1 - p), 0, W / 2)} cam={{s: lerp(1.1, 1.16, ramp(f, T13.panels[0], T13.out[1], glide)), ox: 0, oy: H / 2, tx: 880}} filter={DUO_FILTER}>
        <ClipVideo src="media/v3/operar.mp4" from={T13.panels[0] - 6} rate={0.85} />
      </Plate>
      <TickLabel text="02 · Tecnologia e IA" x={W / 2 + M} y={64} at={T13.index + 4} out={T13.out[0] - 2} size={15} color={C.tealSoft} />
    </div>
  );
};

/* ================================================================== F1 · memória → cor */

const MEM = Array.from({length: 12}, (_, i) => `media/v3/mem/m${String(i + 1).padStart(2, '0')}.jpg`);
const stackPos = (j: number) => ({dx: ((j * 37) % 84) - 42, dy: ((j * 53) % 52) - 26, r: ((j * 29) % 11) - 5});

const MemoryStack: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T14.cards[0] || f > T14.open[1] + 2) return null;
  const cx = W / 2 - STACK.w / 2;
  const cy = H / 2 - STACK.h / 2;
  return (
    <>
      {MEM.map((src, j) => {
        const t0 = T14.cards[0] + j * T14.cardStep;
        if (f < t0) return null;
        const a = ramp(f, t0, t0 + 14, settle);
        const ap = ramp(f - 1, t0, t0 + 14, settle);
        const ang = (j * 137.5 * Math.PI) / 180;
        const dist = 1500;
        const sp = stackPos(j);
        const x = lerp(Math.cos(ang) * dist, sp.dx, a);
        const y = lerp(Math.sin(ang) * dist, sp.dy, a);
        const v = Math.hypot(Math.cos(ang) * dist - sp.dx, Math.sin(ang) * dist - sp.dy) * (a - ap);
        const id = `memmb-${j}`;
        const bx = Math.min(16, Math.abs(Math.cos(ang)) * v * 0.3);
        const by = Math.min(16, Math.abs(Math.sin(ang)) * v * 0.3);
        return (
          <div key={j} style={{position: 'absolute', left: cx + x, top: cy + y, width: STACK.w, height: STACK.h, transform: `rotate(${lerp(sp.r * 3, sp.r, a)}deg)`, boxShadow: '0 24px 60px rgba(0,0,0,0.55)', outline: '1px solid rgba(243,241,236,0.14)', filter: bx + by > 0.6 ? `url(#${id})` : undefined}}>
            {bx + by > 0.6 ? <BlurDef id={id} sx={bx} sy={by} /> : null}
            <div style={{position: 'absolute', inset: 0, filter: DUO_FILTER}}>
              <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          </div>
        );
      })}
    </>
  );
};

const Panorama: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T14.top[0] || f >= T15.verbs[0]) return null;
  const land = ramp(f, T14.top[0], T14.top[1], settle);
  const open = ramp(f, T14.open[0], T14.open[1], settle);
  const w = lerp(STACK.w, W, open);
  const h = lerp(STACK.h, H, open);
  const x = W / 2 - w / 2;
  const y = H / 2 - h / 2 + (1 - land) * 900;
  const cam = ramp(f, T14.cam[0], T14.cam[1], glide);
  const s = lerp(1.03, 1.11, cam);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', boxShadow: open < 1 ? '0 30px 80px rgba(0,0,0,0.55)' : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: `translateX(${lerp(0, -50, cam) * open}px) scale(${s})`, transformOrigin: `50% ${(WATER_Y / H) * 100}%`, filter: 'contrast(1.04) saturate(1.02)'}}>
        <Img src={staticFile('media/v3/panorama.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(5,15,26,0.5), rgba(5,15,26,0) 34%)', opacity: open}} />
    </div>
  );
};

/* ================================================================== F2 · BUILD 2030, escrito pela linha */

const BUILD_SIZE = TYPE.n1;
const BUILD_W = wordWidth('BUILD 2030') * BUILD_SIZE;
const buildHead = (f: number) => {
  const t = ramp(f, T14B.write[0], T14B.write[1], (u) => u * u * (3 - 2 * u) * 0.25 + u * 0.75);
  return lerp(WORD_X, WORD_X + BUILD_W + 14, t);
};

/* ================================================================== F3 · verbos */

const VERBS = [
  {word: 'CONSTRUIR.', src: 'media/v3/construir.mp4', cam: (u: number) => ({s: lerp(1.0, 1.08, u)})},
  {word: 'ESCALAR.', src: 'media/v3/escalar.mp4', cam: (u: number) => ({s: lerp(1.15, 1.02, u)})},
  {word: 'LIDERAR.', src: 'media/v3/liderar.mp4', cam: (u: number) => ({s: 1.06, tx: lerp(36, -36, u)})},
];

const Verbs: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T15.verbs[0] || f >= T16.collapse[1]) return null;
  const k = f >= T15.verbs[2] ? 2 : f >= T15.verbs[1] ? 1 : 0;
  const v = VERBS[k];
  const s = T15.verbs[k];
  const next = k < 2 ? T15.verbs[k + 1] : T16.collapse[0];
  const u = ramp(f, s, next + 20, glide);
  const col = ramp(f, T16.collapse[0], T16.collapse[1], pull);
  const sc = lerpLog(1, 0.004, col);
  const radius = lerp(1300, 0, col);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${sc})`, transformOrigin: `${W / 2}px ${SIG.lineY}px`, clipPath: col > 0 ? `circle(${radius}px at ${W / 2}px ${SIG.lineY}px)` : undefined}}>
      <Plate cam={v.cam(u)} filter="contrast(1.05) saturate(0.95)">
        <ClipVideo src={v.src} from={s - 10} rate={0.85} />
      </Plate>
      <div style={{position: 'absolute', left: 0, top: RULER_Y - 320, width: W, height: 320, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))'}} />
      {f < T16.collapse[0] ? <LineMB at={lineNavy} f={f} /> : null}
      <ImpactWord key={k} word={v.word} x={WORD_X} baseY={RULER_Y} at={s + 1} out={k < 2 ? next - 7 : T16.collapse[0] - 2} inDur={14} />
    </div>
  );
};

/* ================================================================== F4 · assinatura */

const Signature: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T16.logo - 1) return null;
  const logoW = (SIG.logoH * 2901) / 563;
  const lr = ramp(f, T16.logo, T16.logo + 18, settle);
  const titleW = wordWidth('BUILD 2030') * SIG.titleSize;
  return (
    <>
      <div style={{position: 'absolute', left: W / 2 - logoW / 2, top: SIG.logoBase - SIG.logoH, width: logoW, height: SIG.logoH + 2, overflow: 'hidden'}}>
        <Img src={staticFile('brand/gavea-group_hor_branco.png')} style={{position: 'absolute', left: 0, top: (1 - lr) * (SIG.logoH + 4), width: logoW, height: SIG.logoH}} />
      </div>
      <ImpactWord word="BUILD 2030" x={W / 2 - titleW / 2} baseY={SIG.titleBase} at={T16.title} size={SIG.titleSize} inDur={16} />
      <TickLabel text="Brand & Marketing Direction" x={W / 2 - SIG.half} y={SIG.lineY + 22} at={T16.labels[0]} size={15} color={C.tealSoft} />
      <TickLabel text="New Technologies & AI" x={W / 2 + SIG.half} y={SIG.lineY + 22} at={T16.labels[1]} size={15} color={C.tealSoft} align="right" />
      <TickLabel text="AERA" x={W / 2 - 26} y={952} at={T16.aera} size={16} color={C.cream} tracking={0.32} />
    </>
  );
};

/* ================================================================== a linha no navy (E → F) */

const TRACK_A = 880;
const TRACK_B = 1012;

export const lineNavy = (f: number): LineState | null => {
  if (f < T11.invert[0] || f >= FILM_END) return null;
  const col = C.tealSoft;
  // E1 · a camada AERA desce e vira a régua da função
  if (f < T12.rulerUp[0]) {
    const y = lerp(RAILS[1].y, RULER_Y, ramp(f, T11.lineDown[0], T11.lineDown[1], glide));
    const fade = 1 - ramp(f, T12.collapse[0], T12.collapse[1]);
    const nodes = ROW_X.map((x, k) => ({p: [x, y] as Pt, r: k === 4 ? 6 : 4.5, o: ramp(f, rowAt(k), rowAt(k) + 4) * fade})).filter((n) => n.o > 0);
    return {pts: [[M, y], [W - M, y]], color: f < T11.invert[0] + 6 ? C.teal : col, nodes};
  }
  // E2 · sobe e se contrai até a largura da janela; vira a barra; volta a ser linha no fechamento
  if (f < T13.pivot[0]) {
    if (f < T12.trade[0]) {
      const u = ramp(f, T12.rulerUp[0], T12.rulerUp[1], glide);
      const y = lerp(RULER_Y, BAR.y, u);
      return {pts: [[lerp(M, W / 2 - TRADE.w / 2, u), y], [lerp(W - M, W / 2 + TRADE.w / 2, u), y]], color: col};
    }
    if (barState(f).h > 3 || f < T12.close[0]) return null;
    return {pts: [[BAR.cx - BAR.half, BAR.upY], [BAR.cx + BAR.half, BAR.upY]], color: col};
  }
  // E3 · pivota e vira a costura; no fim pivota de novo e deita na base
  if (f < T13.out[1]) {
    const pv = ramp(f, T13.pivot[0], T13.pivot[1], glide);
    const back = ramp(f, T13.out[0], T13.out[1], glide);
    const cx = W / 2;
    const cy = lerp(lerp(BAR.upY, H / 2, pv), RULER_Y, back);
    const ang = lerp(0, Math.PI / 2, pv) + lerp(0, Math.PI / 2, back);
    const half = lerp(lerp(BAR.half, H / 2 + 6, pv), W / 2 + 6, back);
    return {pts: [[cx - Math.cos(ang) * half, cy - Math.sin(ang) * half], [cx + Math.cos(ang) * half, cy + Math.sin(ang) * half]], color: pv < 1 || back > 0 ? col : C.teal, width: lerp(2.6, 3.4, pv * (1 - back))};
  }
  // F1 · duas trilhas que convergem e pousam juntas na linha d'água
  if (f < T14B.lineDrop[0]) {
    const sp = ramp(f, T14.tracks[0], T14.tracks[1], settle);
    const c = ramp(f, T14.toWater[0], T14.toWater[1], glide);
    const yA = lerp(lerp(RULER_Y, TRACK_A, sp), WATER_Y, c);
    const yB = lerp(lerp(RULER_Y, TRACK_B, sp), WATER_Y, c);
    const land = ramp(f, T14.toWater[1] - 6, T14.toWater[1] + 2);
    return {pts: [[0, yA], [W, yA]], color: c > 0.98 ? C.head : col, width: 2.6, glow: 0.6 * land, opacity: 0.95, branches: c < 0.999 ? [{a: [0, yB], b: [W, yB]}] : []};
  }
  // F2 · desce até a régua e escreve BUILD 2030; F3 · régua dos verbos
  if (f < T16.collapse[0]) {
    const d = ramp(f, T14B.lineDrop[0], T14B.lineDrop[1], glide);
    const y = lerp(WATER_Y, RULER_Y, d);
    const writing = f >= T14B.write[0];
    const hx = writing ? buildHead(f) : lerp(W, WORD_X, d);
    const ext = ramp(f, T14B.write[1] + 4, T14B.write[1] + 22, settle);
    const x0 = lerp(lerp(0, WORD_X - 60, d), M, ext);
    const x1 = lerp(hx, W - M, ext);
    const glow = 0.6 * (1 - ramp(f, T14B.lineDrop[0], T14B.lineDrop[0] + 10));
    const headO = writing ? 1 - ramp(f, T14B.write[1], T14B.write[1] + 8) : d;
    return {pts: [[x0, y], [x1, y]], color: d < 0.5 ? C.head : col, glow, head: headO > 0 && f < T15.verbs[0] ? {p: [hx, y], o: headO} : null};
  }
  // F4 · colapsa num ponto; o ponto traça a régua da assinatura
  const c = ramp(f, T16.collapse[0], T16.collapse[1], pull);
  const l = ramp(f, T16.line[0], T16.line[1], settle);
  const y = lerp(RULER_Y, SIG.lineY, c);
  const half = f < T16.line[0] ? lerp(W / 2 - M, 0, c) : lerp(0, SIG.half, l);
  const headO = ramp(f, T16.collapse[1] - 6, T16.collapse[1]) * (1 - ramp(f, T16.line[1] - 4, T16.line[1] + 10));
  return {pts: [[W / 2 - half, y], [W / 2 + half + 0.01, y]], color: col, head: headO > 0 ? {p: [W / 2, y], o: headO} : null};
};

/* ================================================================== camadas navy */

export const NavyLayers: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T11.invert[0]) return null;
  const inv = ramp(f, T11.invert[0], T11.invert[1], settle);
  const r = lerp(0, 2400, inv);
  const gradBuild = ramp(f, T14B.lineDrop[0], T14B.lineDrop[1]) * (1 - ramp(f, T15.verbs[0] - 2, T15.verbs[0]));
  return (
    <>
      <div style={{position: 'absolute', left: NAVY_ORIGIN[0] - r, top: NAVY_ORIGIN[1] - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.navyDeep}} />
      {/* E1 */}
      <Decisao />
      {f < T12.collapse[1] + 4 ? (
        <div style={{position: 'absolute', left: 0, top: RULER_Y - 300, width: W, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))', opacity: ramp(f, DEC, DEC + 12) * (1 - ramp(f, T12.collapse[0], T12.collapse[1]))}} />
      ) : null}
      {f < T12.rulerUp[0] ? <LineMB at={lineNavy} f={f} /> : null}
      <DecTags />
      <TickLabel text="02 · New Technologies & AI" x={M} y={64} at={T11.index} out={T12.close[0]} size={15} color={C.tealSoft} />
      {ROW.map((n, k) => (
        <TickLabel key={n} text={n} x={ROW_X[k] + 12} y={RULER_Y + 16} at={rowAt(k) + 2} out={T12.collapse[0] - 2} size={14} color={k === 4 ? C.cream : C.tealSoft} tracking={0.2} />
      ))}
      {/* E2 */}
      <TradeWindow />
      <OneMoment />
      {/* E3 · F1 */}
      <Split />
      <MemoryStack />
      <Panorama />
      <TickLabel text="01 · Marca e marketing" x={M} y={TRACK_A - 30} at={T14.tracks[0] + 6} out={T14.toWater[0]} size={14} color={C.tealSoft} />
      <TickLabel text="02 · Novas tecnologias e IA" x={M} y={TRACK_B + 14} at={T14.tracks[0] + 10} out={T14.toWater[0]} size={14} color={C.tealSoft} />
      {/* F2 */}
      {gradBuild > 0 ? <div style={{position: 'absolute', left: 0, top: RULER_Y - 340, width: W, height: 340, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.6))', opacity: gradBuild}} /> : null}
      {f >= T14B.write[0] && f < T15.verbs[0] + 2 ? (
        <WrittenTitle word="BUILD 2030" x={WORD_X} baseY={RULER_Y} size={BUILD_SIZE} headX={buildHead} from={T14B.write[0] - 4} out={T14B.out} />
      ) : null}
      {f >= T12.rulerUp[0] && f < T15.verbs[0] ? <LineMB at={lineNavy} f={f} /> : null}
      {/* F3 · F4 */}
      <Verbs />
      {f >= T16.collapse[0] ? <LineMB at={lineNavy} f={f} /> : null}
      <Signature />
    </>
  );
};
