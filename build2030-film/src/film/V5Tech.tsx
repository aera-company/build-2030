/**
 * GAVEA / BUILD 2030 · V5 · C · frente 02 · New Technologies & AI.
 * Lógica: necessidade → oportunidade → sistema → IA → implementação → evolução.
 * O nó "Oportunidades" da frente 01 devolve o campo ao navy. A operação real sobe da régua (necessidade); dela saem
 * recortes que viram um nó (oportunidade); a camada de inteligência cobre a imagem e solta o nó da IA; os nós se
 * ligam (sistema) e cada frente falada entra na régua: sistemas de IA, automações, conhecimento, processos.
 * "novas ferramentas": a régua abre o GAVEA Trade (prova) e a janela vira a barra do futuro Portal GAVEA (possibilidade).
 * A barra fecha, desce e se contrai num ponto: daí nasce o encontro.
 */
import React from 'react';
import {Freeze, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, H, M, W} from '../motion/design';
import {glide, lerp, leave, Pt, pull, ramp, settle} from '../motion/easing';
import {BAR, E0, ONE_WIN, O2, RULER_Y, Y_R} from '../motion/geometry';
import {T_B, T_C, T_D, T12} from '../motion/timing';
import {DUO_FILTER} from '../primitives/Grade';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate, StillImg} from '../primitives/Media';
import {TickLabel} from '../primitives/Type';

const END = T_D.invert[1] + 2;
/** o nó "Oportunidades" na tela (a frente 01 está levemente empurrada pela câmera) */
const ORIGIN: Pt = [W / 2 + (O2[0] - W / 2) * 1.035, Y_R + (O2[1] - Y_R) * 1.035];

const ROW = ['Sistemas de IA', 'Automações', 'Conhecimento', 'Processos', 'Apoio à decisão'];
const ROW_X = [1, 3, 5, 7, 9].map((i) => M + (i * (W - 2 * M)) / 12);
/** quando cada nó da régua acende: IA, automações, conhecimento, processos, decisão */
const ROW_AT = [T_C.aiNode + 14, T_C.row[1], T_C.row[2], T_C.row[3], T_C.detach[1]];
const ROW_LABEL_AT = [T_C.row[0], T_C.row[1], T_C.row[2], T_C.row[3], T_C.detach[1] + 1];
const DEC_TAGS = [
  {x: 860, y: 180, w: 260, h: 200, label: 'Documento'},
  {x: 1260, y: 770, w: 460, h: 150, label: 'Prazo'},
];
const INTEL_PT: Pt = [1236, 404];

/* ================================================================== imagens */

const Plates: React.FC = () => {
  const f = useCurrentFrame();
  const need = T_C.need;
  const p0 = ramp(f, need - 4, need + 14, settle);
  const dec = <ClipVideo src="media/v3/decisao.mp4" from={need - 6} />;
  const fz = ramp(f, T_C.freeze, T_C.freeze + 4, settle);
  const p1 = ramp(f, T_C.ai - 2, T_C.ai + 16, settle);
  const u1 = ramp(f, T_C.ai - 2, T_C.row[2] + 10, glide);
  const k2 = T_C.row[2] - 8;
  const p2 = ramp(f, k2, k2 + 12, settle);
  const k3 = T_C.row[3] - 8;
  const p3 = ramp(f, k3, k3 + 12, settle);
  const col = ramp(f, T12.collapse[0], T12.collapse[1], leave);
  return (
    <>
      {/* necessidade: a operação real sobe da régua */}
      {f >= need - 6 && f < T_C.ai + 20 ? (
        <Plate clip={inset(RULER_Y * (1 - p0), 0, 0, 0)} cam={{s: lerp(1.1, 1.02, ramp(f, need - 6, T_C.ai + 20, glide))}} filter={`${DUO_FILTER} brightness(${lerp(1, 0.74, fz)})`}>
          {f >= T_C.freeze ? <Freeze frame={T_C.freeze}>{dec}</Freeze> : dec}
        </Plate>
      ) : null}
      {/* IA: o campo de dados cobre a imagem (duas camadas, a luz anda mais rápido) */}
      {f >= T_C.ai - 3 && f < k2 + 14 ? (
        <>
          <Plate clip={inset(0, 0, H * (1 - p1), 0)} cam={{s: lerp(1.02, 1.1, u1), ty: lerp(-50, 0, p1), oy: H * 0.45}} filter={`${DUO_FILTER} brightness(1.05)`}>
            <StillImg src="media/v3/intel.png" />
          </Plate>
          <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
            <Plate clip={inset(0, 0, H * (1 - p1), 0)} cam={{s: lerp(1.08, 1.3, u1), tx: lerp(40, -70, u1), ty: lerp(-90, 0, p1), oy: H * 0.45}} filter={`${DUO_FILTER} brightness(1.1) contrast(2.6)`}>
              <StillImg src="media/v3/intel.png" />
            </Plate>
          </div>
        </>
      ) : null}
      {/* conhecimento: painel da direita */}
      {f >= k2 && f < k3 + 14 ? (
        <Plate clip={inset(0, 0, 0, W * (1 - p2))} cam={{s: 1.08, tx: lerp(160, 0, p2) - (f - k2) * 1.4}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/conhecimento.mp4" from={k2 - 4} />
        </Plate>
      ) : null}
      {/* processos: sobe da régua; na implementação fecha sobre ela */}
      {f >= k3 && f <= T12.collapse[1] ? (
        <Plate clip={inset(Math.max(RULER_Y * (1 - p3), lerp(0, RULER_Y, col)), 0, lerp(0, H - RULER_Y, col), 0)} cam={{s: lerp(1.1, 1.02, ramp(f, k3, T12.collapse[1], glide))}} filter={DUO_FILTER}>
          <ClipVideo src="media/v3/processos.mp4" from={k3 - 4} />
        </Plate>
      ) : null}
      {f >= need && f <= T12.collapse[1] ? (
        <div style={{position: 'absolute', left: 0, top: RULER_Y - 300, width: W, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.6))', opacity: ramp(f, need, need + 10) * (1 - col)}} />
      ) : null}
    </>
  );
};

/* ================================================================== informação extraída e rede na régua */

const trail = (key: string, f: number, from: Pt, to: Pt, a: number, b: number) => {
  if (f < a || f >= b) return null;
  const t = ramp(f, a, b, glide);
  const tp = ramp(f - 1, a, b, glide);
  const x = lerp(from[0], to[0], t);
  const y = lerp(from[1], to[1], t);
  const vx = (x - lerp(from[0], to[0], tp)) * 0.5;
  const vy = (y - lerp(from[1], to[1], tp)) * 0.5;
  return (
    <g key={key}>
      <circle cx={x - vx * 2} cy={y - vy * 2} r={5} fill={C.tealSoft} opacity={0.18} />
      <circle cx={x - vx} cy={y - vy} r={5} fill={C.tealSoft} opacity={0.36} />
      <circle cx={x} cy={y} r={5.5} fill={C.head} />
    </g>
  );
};

const Network: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_C.tag - 1 || f > T12.rulerUp[0] + 2) return null;
  const items: React.ReactNode[] = [];
  // necessidade → oportunidade: os recortes encolhem num nó que cai em "Apoio à decisão"
  DEC_TAGS.forEach((t, j) => {
    const t0 = T_C.tag + j * 3;
    const draw = ramp(f, t0, t0 + 8, settle);
    const shrink = ramp(f, T_C.detach[0] + j * 2, T_C.detach[0] + 6 + j * 2, leave);
    const cx = t.x + t.w / 2;
    const cy = t.y + t.h / 2;
    const rw = t.w * (1 - shrink);
    const rh = t.h * (1 - shrink);
    if (rw > 1 && f >= t0) items.push(<rect key={`r${j}`} x={cx - rw / 2} y={cy - rh / 2} width={rw} height={rh} fill="none" stroke={C.tealSoft} strokeWidth={1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />);
    items.push(trail(`d${j}`, f, [cx, cy], [ROW_X[4], RULER_Y], T_C.detach[0] + 4 + j * 2, T_C.detach[1] + j * 2));
  });
  // a IA: um ponto de luz acende no campo de dados e cai na régua
  const a3 = T_C.aiNode;
  if (f >= a3 - 4 && f < a3) items.push(<circle key="ai" cx={INTEL_PT[0]} cy={INTEL_PT[1]} r={6 * ramp(f, a3 - 4, a3, settle)} fill={C.head} />);
  items.push(trail('ai2', f, INTEL_PT, [ROW_X[0], RULER_Y], a3, a3 + 14));
  // sistema: arcos ligam os nós acesos (sempre do nó novo ao anterior)
  const order = [4, 0, 1, 2, 3];
  for (let i = 1; i < order.length; i++) {
    const a = order[i - 1];
    const b = order[i];
    const at = i === 1 ? T_C.link : ROW_AT[b];
    const g = ramp(f, at, at + 12, settle);
    if (g <= 0) continue;
    const x0 = ROW_X[a];
    const x1 = ROW_X[b];
    const hgt = 60 + Math.abs(x1 - x0) * 0.12;
    const d = `M ${x0} ${RULER_Y} C ${x0} ${RULER_Y - hgt} ${x1} ${RULER_Y - hgt} ${x1} ${RULER_Y}`;
    const ph = ((f - at) % 30) / 30;
    const mt = 1 - ph;
    const px = mt * mt * mt * x0 + 3 * mt * mt * ph * x0 + 3 * mt * ph * ph * x1 + ph * ph * ph * x1;
    const py = mt * mt * mt * RULER_Y + 3 * mt * mt * ph * (RULER_Y - hgt) + 3 * mt * ph * ph * (RULER_Y - hgt) + ph * ph * ph * RULER_Y;
    items.push(
      <g key={`a${i}`}>
        <path d={d} fill="none" stroke={C.tealSoft} strokeWidth={1.2} opacity={0.7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
        {g >= 1 ? <circle cx={px} cy={py} r={3.4} fill={C.head} opacity={Math.min(1, ph * 6, (1 - ph) * 6)} /> : null}
      </g>,
    );
  }
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {items}
      </svg>
      {DEC_TAGS.map((t, j) => (
        <TickLabel key={j} text={t.label} x={t.x} y={t.y - 26} at={T_C.tag + 4 + j * 3} out={T_C.detach[0] + j * 2} size={15} color={C.cream} tracking={0.2} />
      ))}
    </>
  );
};

/* ================================================================== implementação (prova) → evolução (possibilidade) */

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
  const swap = ramp(f, T12.tradeSwap, T12.tradeSwap + 12, settle);
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
      <TickLabel text="Ferramentas internas · implementação" x={W / 2 + TRADE.w / 2} y={BAR.y + TRADE.h / 2 + 14} at={T12.tradeLabel + 4} out={T12.toBar[0]} size={15} color={C.cream} align="right" />
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
          <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.0, 1.18, ramp(f, T12.window[0], T12.close[1], glide))})`, transformOrigin: '42% 78%', filter: 'saturate(0.85) brightness(1.05)'}}>
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

/* ================================================================== a linha da frente 02 */

export const lineTech = (f: number): LineState | null => {
  if (f < T_B.invert[0] + 4 || f >= T_D.invert[0] + 4) return null;
  const col = C.tealSoft;
  if (f < T12.rulerUp[0]) {
    const g = ramp(f, T_C.line[0], T_C.line[1], settle);
    const fade = 1 - ramp(f, T12.collapse[0], T12.collapse[1]);
    const nodes = ROW_X.map((x, k) => ({p: [x, RULER_Y] as Pt, r: k === 4 || k === 0 ? 6 : 5, o: ramp(f, ROW_AT[k] - 1, ROW_AT[k] + 3) * fade})).filter((n) => n.o > 0);
    return {pts: [[lerp(ORIGIN[0], M, g), RULER_Y], [lerp(ORIGIN[0], W - M, g), RULER_Y]], color: col, nodes};
  }
  if (f < T12.trade[0]) {
    const u = ramp(f, T12.rulerUp[0], T12.rulerUp[1], glide);
    const y = lerp(RULER_Y, BAR.y, u);
    return {pts: [[lerp(M, W / 2 - TRADE.w / 2, u), y], [lerp(W - M, W / 2 + TRADE.w / 2, u), y]], color: col};
  }
  if (barState(f).h > 3 || f < T12.close[0]) return null;
  // "Duas frentes": as duas metades da linha descem e se fecham num ponto
  const c = ramp(f, T_D.contract[0], T_D.contract[1], pull);
  const y = lerp(BAR.upY, E0[1], ramp(f, T_D.contract[0], T_D.contract[1], glide));
  const half = lerp(BAR.half, 0, c);
  const merged = ramp(f, T_D.contract[1] - 4, T_D.contract[1] + 2, settle);
  return {pts: [[E0[0] - half, y], [E0[0] + half + 0.01, y]], color: col, head: merged > 0 ? {p: [E0[0], y], o: merged} : null};
};

export const TechFront: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_B.invert[0] || f >= END) return null;
  const inv = ramp(f, T_B.invert[0], T_B.invert[1], settle);
  const r = lerp(0, 2400, inv);
  return (
    <>
      <div style={{position: 'absolute', left: ORIGIN[0] - r, top: ORIGIN[1] - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.navyDeep}} />
      <Plates />
      <LineMB at={lineTech} f={f} />
      <Network />
      <TickLabel text="02 · New Technologies & AI" x={M} y={64} at={T_C.index} out={T12.close[0]} size={15} color={C.tealSoft} />
      {ROW.map((n, k) => (
        <TickLabel key={n} text={n} x={ROW_X[k] + 12} y={RULER_Y + 16} at={ROW_LABEL_AT[k]} out={T12.collapse[0] - 2} size={14} color={k === 0 ? C.cream : C.tealSoft} tracking={0.2} />
      ))}
      <TradeWindow />
      <OneMoment />
    </>
  );
};
